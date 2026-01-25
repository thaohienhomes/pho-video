import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/db"
import {
    formatPhoPoints,
    getTierFeatures,
    SubscriptionTier,
} from "@/lib/pho-points"
import { getPhoPointsStats } from "@/lib/pho-points/transactions"

export const dynamic = 'force-dynamic'
/**
 * GET /api/pho-points/balance
 * 
 * Returns the current user's Phở Points balance and subscription info
 */
export async function GET() {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json(
                { error: "Not logged in", balance: 0, tier: 'free' },
                { status: 401 }
            )
        }

        // Get or create user
        const user = await getOrCreateUser(clerkId)
        if (!user) {
            return NextResponse.json(
                { error: "User not found", balance: 0, tier: 'free' },
                { status: 404 }
            )
        }

        // Get Phở Points stats
        const stats = await getPhoPointsStats(user.id)
        const tierFeatures = getTierFeatures(stats.tier as SubscriptionTier)

        return NextResponse.json({
            // Balance info
            balance: stats.balance,
            balanceFormatted: formatPhoPoints(stats.balance),

            // Lifetime stats
            lifetimeEarned: stats.lifetimeEarned,
            lifetimeSpent: stats.lifetimeSpent,

            // Subscription info
            tier: stats.tier,
            status: stats.status,

            // Tier features
            features: tierFeatures,
        })

    } catch (error) {
        console.error("[API] Error fetching Phở Points balance:", error)
        // Check if it's a "User not found" or similar DB error
        return NextResponse.json(
            { error: "Failed to fetch balance", balance: 0, tier: 'free' },
            { status: 500 }
        )
    }
}
