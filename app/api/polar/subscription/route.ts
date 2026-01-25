import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/db"

export const dynamic = 'force-dynamic'
/**
 * GET /api/polar/subscription
 * 
 * Get current user's subscription details
 */
export async function GET() {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await getOrCreateUser(clerkId)

        // Return subscription info from database
        // For detailed Polar subscription management, users go to customer portal
        return NextResponse.json({
            hasSubscription: !!user.polarSubscriptionId,
            subscriptionId: user.polarSubscriptionId,
            tier: user.subscriptionTier,
            status: user.subscriptionStatus,
            // Polar Customer Portal URL - users can manage their subscription here
            portalUrl: user.polarSubscriptionId
                ? `https://polar.sh/purchases/subscriptions/${user.polarSubscriptionId}`
                : null,
            // General customer portal
            customerPortalUrl: "https://polar.sh/purchases",
        })

    } catch (error) {
        console.error("[API] Error fetching subscription:", error)
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        )
    }
}
