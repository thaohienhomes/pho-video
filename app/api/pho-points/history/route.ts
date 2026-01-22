import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/db"
import { formatPhoPoints } from "@/lib/pho-points"
import { getPhoPointsHistory } from "@/lib/pho-points/transactions"

/**
 * GET /api/pho-points/history
 * 
 * Returns the user's Phở Points transaction history
 * Query params: 
 *   - limit: number of transactions (default 50, max 100)
 *   - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get query params
        const { searchParams } = new URL(request.url)
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
        const offset = parseInt(searchParams.get("offset") || "0")

        // Get user
        const user = await getOrCreateUser(clerkId)

        // Get transaction history
        const transactions = await getPhoPointsHistory(user.id, limit, offset)

        // Format transactions for response
        const formattedTransactions = transactions.map(tx => ({
            id: tx.id,
            amount: tx.amount,
            amountFormatted: (tx.amount >= 0 ? "+" : "") + formatPhoPoints(tx.amount),
            balanceAfter: tx.balanceAfter,
            balanceAfterFormatted: formatPhoPoints(tx.balanceAfter),
            type: tx.transactionType,
            description: tx.description,
            metadata: tx.metadata,
            createdAt: tx.createdAt.toISOString(),
        }))

        return NextResponse.json({
            transactions: formattedTransactions,
            pagination: {
                limit,
                offset,
                hasMore: transactions.length === limit,
            }
        })

    } catch (error) {
        console.error("[API] Error fetching Phở Points history:", error)
        return NextResponse.json(
            { error: "Failed to fetch history" },
            { status: 500 }
        )
    }
}
