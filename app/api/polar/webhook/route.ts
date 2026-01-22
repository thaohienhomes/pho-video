import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks"
import { db } from "@/lib/db"
import { addPhoPoints, updateSubscriptionTier } from "@/lib/pho-points/transactions"
import { TIER_PHO_POINTS } from "@/lib/polar"

/**
 * POST /api/polar/webhook
 * 
 * Handles Polar webhook events:
 * - checkout.created
 * - subscription.created
 * - subscription.updated
 * - subscription.active (monthly renewal)
 * - subscription.canceled
 * - order.created (one-time purchases)
 * - order.refunded
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()

        // Validate webhook signature
        let event;
        try {
            event = validateEvent(
                body,
                Object.fromEntries(headersList.entries()),
                process.env.POLAR_WEBHOOK_SECRET!
            )
        } catch (error) {
            if (error instanceof WebhookVerificationError) {
                console.error("[Polar Webhook] Invalid signature:", error.message)
                return NextResponse.json(
                    { error: "Invalid webhook signature" },
                    { status: 403 }
                )
            }
            throw error
        }

        console.log(`[Polar Webhook] Event received: ${event.type}`)

        switch (event.type) {
            case 'checkout.created': {
                // Checkout started - just log for now
                console.log(`[Polar Webhook] Checkout created: ${event.data.id}`)
                break
            }

            case 'subscription.created':
            case 'subscription.updated': {
                const subscription = event.data
                const metadata = subscription.metadata as Record<string, string> | null
                const userId = metadata?.userId
                const tier = (metadata?.tier || 'starter') as keyof typeof TIER_PHO_POINTS

                if (!userId) {
                    console.error("[Polar Webhook] No userId in subscription metadata")
                    return NextResponse.json(
                        { error: "Missing userId in metadata" },
                        { status: 400 }
                    )
                }

                console.log(`[Polar Webhook] Subscription ${event.type}: ${subscription.id}`)
                console.log(`   User: ${userId}, Tier: ${tier}`)

                // Update user subscription info
                await db.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionTier: tier,
                        subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
                        polarCustomerId: subscription.customerId,
                        polarSubscriptionId: subscription.id,
                    }
                })

                // Grant Phở Points for new subscription
                if (event.type === 'subscription.created' && subscription.status === 'active') {
                    const points = TIER_PHO_POINTS[tier] || TIER_PHO_POINTS.starter
                    await addPhoPoints(
                        userId,
                        points,
                        'subscription_grant',
                        {
                            tier,
                            subscriptionId: subscription.id,
                            period: new Date().toISOString().slice(0, 7),
                        }
                    )
                    console.log(`[Polar Webhook] Granted ${points} Phở Points to user ${userId}`)
                }

                break
            }

            case 'subscription.active': {
                // Monthly renewal - grant new Phở Points
                const subscription = event.data
                const metadata = subscription.metadata as Record<string, string> | null
                const userId = metadata?.userId
                const tier = (metadata?.tier || 'starter') as keyof typeof TIER_PHO_POINTS

                if (!userId) {
                    console.error("[Polar Webhook] No userId in subscription.active metadata")
                    break
                }

                const points = TIER_PHO_POINTS[tier] || TIER_PHO_POINTS.starter
                await addPhoPoints(
                    userId,
                    points,
                    'subscription_grant',
                    {
                        tier,
                        subscriptionId: subscription.id,
                        period: new Date().toISOString().slice(0, 7),
                        reason: 'monthly_renewal',
                    }
                )

                console.log(`[Polar Webhook] Monthly renewal: Granted ${points} Phở Points to user ${userId}`)
                break
            }

            case 'subscription.canceled': {
                const subscription = event.data
                const metadata = subscription.metadata as Record<string, string> | null
                const userId = metadata?.userId

                if (!userId) {
                    console.error("[Polar Webhook] No userId in subscription.canceled metadata")
                    break
                }

                // Update subscription status (user keeps current tier until end of period)
                await db.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: 'canceled',
                    }
                })

                console.log(`[Polar Webhook] Subscription canceled for user ${userId}`)
                break
            }

            case 'subscription.revoked': {
                // Subscription ended (after cancellation period or failed payment)
                const subscription = event.data
                const metadata = subscription.metadata as Record<string, string> | null
                const userId = metadata?.userId

                if (!userId) break

                // Downgrade to free tier
                await updateSubscriptionTier(userId, 'free', 'canceled')
                console.log(`[Polar Webhook] Subscription revoked, user ${userId} downgraded to free`)
                break
            }

            case 'order.created': {
                // One-time purchase (e.g., lifetime deals or credit packs)
                const order = event.data
                const metadata = order.metadata as Record<string, string> | null
                const userId = metadata?.userId

                if (!userId) {
                    console.error("[Polar Webhook] No userId in order metadata")
                    break
                }

                console.log(`[Polar Webhook] Order created: ${order.id} for user ${userId}`)

                // Handle lifetime deals
                if (metadata?.tier === 'lifetime') {
                    await db.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: 'lifetime',
                            subscriptionStatus: 'active',
                        }
                    })

                    // Grant lifetime Phở Points
                    await addPhoPoints(
                        userId,
                        TIER_PHO_POINTS.lifetime,
                        'subscription_grant',
                        {
                            tier: 'lifetime',
                            orderId: order.id,
                            reason: 'lifetime_purchase',
                        }
                    )
                    console.log(`[Polar Webhook] Lifetime deal activated for user ${userId}`)
                }
                break
            }

            case 'order.refunded': {
                // Refund processed
                const order = event.data
                const metadata = order.metadata as Record<string, string> | null
                const userId = metadata?.userId

                if (!userId) break

                // Downgrade to free tier
                await db.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionTier: 'free',
                        subscriptionStatus: 'refunded',
                    }
                })

                console.log(`[Polar Webhook] Refund processed for user ${userId}`)
                break
            }

            default:
                console.log(`[Polar Webhook] Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error("[Polar Webhook] Error processing webhook:", error)
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        )
    }
}

// This file uses standard Next.js 14+ Route Handler conventions.
// The deprecated `export const config` has been removed to fix Vercel build errors.
