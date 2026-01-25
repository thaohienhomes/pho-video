import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyVideoReady, notifyGenerationFailed } from "@/lib/push-notifications"

/**
 * Fal.ai Webhook Payload Types
 * 
 * When using webhook mode, Fal.ai sends a POST request to this endpoint
 * when the generation job completes (success or failure).
 */
interface FalWebhookPayload {
    request_id: string
    status: "COMPLETED" | "FAILED"
    error?: string
    // For LTX-Video model
    video?: {
        url: string
        content_type: string
        file_name: string
        file_size: number
    }
    seed?: number
    // Custom metadata we pass when submitting the job
    webhook_metadata?: {
        userId: string
        generationId: string
    }
}

// Optional: Webhook secret for validation
const WEBHOOK_SECRET = process.env.FAL_WEBHOOK_SECRET

/**
 * POST /api/webhooks/fal
 * Handle Fal.ai webhook callbacks for async video generation
 */
export async function POST(request: NextRequest) {
    try {
        // Optional: Validate webhook secret via query param
        const url = new URL(request.url)
        const secret = url.searchParams.get("secret")

        if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
            console.warn("⚠️ [Webhook/Fal] Invalid webhook secret")
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Parse the webhook payload
        const payload: FalWebhookPayload = await request.json()

        console.log(`📥 [Webhook/Fal] Received webhook for request: ${payload.request_id}`)
        console.log(`   Status: ${payload.status}`)

        // Find the generation record by requestId
        // Note: We need to store requestId in generation record when submitting
        const generation = await db.generation.findFirst({
            where: {
                // We'll store the Fal request_id in a metadata field or use a mapping table
                // For now, we use a simple approach: find by status pending with matching model
                status: "pending",
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        expoPushToken: true,
                    }
                }
            }
        })

        // If we have metadata in the webhook payload, use it directly
        let userId: string | undefined
        let generationId: string | undefined
        let expoPushToken: string | null = null

        if (payload.webhook_metadata) {
            userId = payload.webhook_metadata.userId
            generationId = payload.webhook_metadata.generationId

            // Look up the user's push token
            const user = await db.user.findUnique({
                where: { id: userId },
                select: { expoPushToken: true }
            })
            expoPushToken = user?.expoPushToken || null
        } else if (generation) {
            // Fallback: use the found generation
            userId = generation.userId
            generationId = generation.id
            expoPushToken = generation.user.expoPushToken
        }

        if (!generationId) {
            console.warn(`⚠️ [Webhook/Fal] No matching generation found for request: ${payload.request_id}`)
            // Still return 200 to acknowledge the webhook
            return NextResponse.json({ received: true, matched: false })
        }

        // Handle completed generation
        if (payload.status === "COMPLETED" && payload.video?.url) {
            console.log(`✅ [Webhook/Fal] Video ready: ${payload.video.url}`)

            // Update generation record
            await db.generation.update({
                where: { id: generationId },
                data: {
                    status: "completed",
                    videoUrl: payload.video.url,
                }
            })

            // Send push notification if user has a token
            if (expoPushToken) {
                const result = await notifyVideoReady(
                    expoPushToken,
                    payload.video.url,
                    generationId
                )
                console.log(`📱 [Webhook/Fal] Push notification result:`, result)
            } else {
                console.log(`📱 [Webhook/Fal] No push token for user, skipping notification`)
            }

            return NextResponse.json({
                received: true,
                matched: true,
                generationId,
                notificationSent: !!expoPushToken
            })
        }

        // Handle failed generation
        if (payload.status === "FAILED") {
            console.error(`❌ [Webhook/Fal] Generation failed: ${payload.error}`)

            // Update generation record
            await db.generation.update({
                where: { id: generationId },
                data: { status: "failed" }
            })

            // TODO: Refund Phở Points here if needed

            // Send failure notification if user has a token
            if (expoPushToken) {
                await notifyGenerationFailed(expoPushToken, generationId, payload.error)
            }

            return NextResponse.json({
                received: true,
                matched: true,
                generationId,
                status: "failed"
            })
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error("❌ [Webhook/Fal] Error processing webhook:", error)

        // Still return 200 to prevent Fal.ai from retrying
        return NextResponse.json(
            { error: "Internal error", received: true },
            { status: 200 }
        )
    }
}

/**
 * GET /api/webhooks/fal
 * Health check endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "fal-webhook",
        description: "Fal.ai webhook handler for async video generation"
    })
}
