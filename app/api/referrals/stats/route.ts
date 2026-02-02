import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { TRANSACTION_TYPES } from '@/lib/pho-points/constants'

/**
 * GET /api/referrals/stats
 * 
 * Returns referral statistics for the authenticated user:
 * - Total successful referrals
 * - Total bonus points earned from referrals
 * - List of referred users (anonymized)
 */
export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await db.user.findFirst({
            where: { clerkId },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get all referral bonus transactions for this user
        const referralTransactions = await db.phoPointsTransaction.findMany({
            where: {
                userId: user.id,
                transactionType: TRANSACTION_TYPES.BONUS_REFERRAL,
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                amount: true,
                createdAt: true,
                metadata: true,
            }
        })

        // Calculate total points earned
        const totalPointsEarned = referralTransactions.reduce(
            (sum, tx) => sum + tx.amount,
            0
        )

        // Format referrals list (anonymized)
        const referrals = referralTransactions.map((tx, index) => ({
            id: tx.id,
            pointsEarned: tx.amount,
            createdAt: tx.createdAt.toISOString(),
            // Anonymize referred user - just show order number
            label: `Friend #${referralTransactions.length - index}`,
        }))

        return NextResponse.json({
            success: true,
            stats: {
                totalReferrals: referralTransactions.length,
                totalPointsEarned,
                referralCode: clerkId, // User's Clerk ID is their referral code
            },
            referrals,
        })

    } catch (error) {
        console.error('[API] Referral stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch referral stats' },
            { status: 500 }
        )
    }
}
