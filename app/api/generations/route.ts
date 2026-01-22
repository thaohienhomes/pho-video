import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser, getUserGenerations } from "@/lib/db"

/**
 * GET /api/generations
 * Returns the current user's generation history
 */
export async function GET() {
    try {
        // Debug: Log environment variable availability
        console.log("🔍 [DEBUG] DATABASE_URL available:", !!process.env.DATABASE_URL)
        console.log("🔍 [DEBUG] DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 30) + "...")

        // Check authentication
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json(
                { error: "Not logged in", generations: [] },
                { status: 401 }
            )
        }

        // Get user from database
        console.log("🔍 [DEBUG] Calling getOrCreateUser...")
        const user = await getOrCreateUser(clerkId)
        console.log("🔍 [DEBUG] User:", user?.id, "Credits:", user?.credits)

        // Get generation history
        const generations = await getUserGenerations(user.id)
        console.log("🔍 [DEBUG] Generations count:", generations.length)

        return NextResponse.json({
            generations,
            // Use phoPointsBalance (new system) instead of legacy credits
            credits: user.phoPointsBalance ?? user.credits ?? 0,
        })

    } catch (error) {
        console.error("❌ [API] Error fetching generations:")
        console.error("   Error name:", (error as Error).name)
        console.error("   Error message:", (error as Error).message)
        console.error("   Stack:", (error as Error).stack)

        // Return detailed error in development
        return NextResponse.json(
            {
                error: "Failed to fetch generation history",
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            },
            { status: 500 }
        )
    }
}
