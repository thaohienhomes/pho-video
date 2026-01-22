import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/db"
import { polar, getProductId } from "@/lib/polar"

/**
 * POST /api/polar/create-checkout
 * 
 * Creates a Polar checkout session for subscription purchase
 * Body: { tier: 'starter' | 'creator' | 'pro', billingCycle: 'monthly' | 'annual' }
 */
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { tier, billingCycle = 'monthly' } = body

        // Validate tier
        if (!['starter', 'creator', 'pro'].includes(tier)) {
            return NextResponse.json(
                { error: "Invalid tier. Must be 'starter', 'creator', or 'pro'" },
                { status: 400 }
            )
        }

        // Validate billing cycle
        if (!['monthly', 'annual'].includes(billingCycle)) {
            return NextResponse.json(
                { error: "Invalid billing cycle. Must be 'monthly' or 'annual'" },
                { status: 400 }
            )
        }

        // Get product ID from config
        const productId = getProductId(tier, billingCycle)
        if (!productId) {
            console.error(`[Polar] Missing product ID for ${tier} ${billingCycle}`)
            return NextResponse.json(
                { error: "Product configuration missing. Please contact support." },
                { status: 500 }
            )
        }

        // Get user from database
        const user = await getOrCreateUser(clerkId)

        console.log(`[Polar] Creating checkout for user ${user.id}`)
        console.log(`   Tier: ${tier}, Billing: ${billingCycle}`)
        console.log(`   Product ID: ${productId}`)

        // Create Polar checkout session using direct API call (more reliable than SDK)
        try {
            // Robust Base URL detection
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
            const successUrl = `${baseUrl}/dashboard?payment=success&tier=${tier}`

            // Polar API requires product_id directly, not products array
            const requestBody = {
                product_id: productId,
                success_url: successUrl,
                customer_email: user.email || undefined,
                metadata: {
                    user_id: user.id,
                    clerk_id: clerkId,
                    tier,
                    billing_cycle: billingCycle,
                },
            }

            console.log(`[Polar] Attempting to create checkout via direct API:`, requestBody)

            // Use sandbox API since tokens/products are in sandbox environment
            const polarResponse = await fetch('https://sandbox-api.polar.sh/v1/checkouts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
                },
                body: JSON.stringify(requestBody),
            })

            const responseData = await polarResponse.json()

            if (!polarResponse.ok) {
                console.error("[Polar] API Error creating checkout:")
                console.error("   Status:", polarResponse.status)
                console.error("   Response:", JSON.stringify(responseData, null, 2))

                return NextResponse.json(
                    {
                        error: "Polar API Error",
                        details: responseData.detail || responseData.message || 'Unknown error',
                        raw: responseData
                    },
                    { status: polarResponse.status }
                )
            }

            console.log(`[Polar] Checkout created successfully: ${responseData.id}`)

            return NextResponse.json({
                checkoutUrl: responseData.url,
                checkoutId: responseData.id,
            })
        } catch (polarError: any) {
            console.error("[Polar] Network/Parse Error creating checkout:")
            console.error("   Message:", polarError.message)

            return NextResponse.json(
                {
                    error: "Polar Network Error",
                    details: polarError.message,
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("[Polar] Error creating checkout:", error)

        // Handle Polar-specific errors
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: "Failed to create checkout" },
            { status: 500 }
        )
    }
}
