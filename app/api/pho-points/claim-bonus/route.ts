import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/db"
import { formatPhoPoints } from "@/lib/pho-points"
import {
    grantSignupBonus,
    grantReferralBonus,
    validateReferralCode,
} from "@/lib/pho-points/transactions"

/**
 * POST /api/pho-points/claim-bonus
 * 
 * Claim available bonuses for authenticated user
 * Body: { type: 'signup' | 'referral', referralCode?: string }
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
        const { type, referralCode } = body

        // Get or create user
        const user = await getOrCreateUser(clerkId)

        switch (type) {
            case 'signup': {
                const result = await grantSignupBonus(user.id)

                if (result.success) {
                    console.log(`[Bonus] Signup bonus granted to ${user.id}`)

                    // If referral code provided, also grant referrer bonus
                    if (referralCode) {
                        const validation = await validateReferralCode(referralCode)
                        if (validation.valid && validation.referrerId !== user.id) {
                            await grantReferralBonus(validation.referrerId!, user.id)
                        }
                    }

                    return NextResponse.json({
                        success: true,
                        bonusType: 'signup',
                        amount: 50000,
                        amountFormatted: formatPhoPoints(50000),
                        newBalance: result.newBalance,
                        newBalanceFormatted: formatPhoPoints(result.newBalance),
                        message: 'Welcome! You received 50K Phở Points!'
                    })
                } else {
                    return NextResponse.json({
                        success: false,
                        error: result.error || 'Failed to grant signup bonus'
                    })
                }
            }

            case 'referral': {
                if (!referralCode) {
                    return NextResponse.json(
                        { error: "Referral code required" },
                        { status: 400 }
                    )
                }

                const validation = await validateReferralCode(referralCode)

                if (!validation.valid) {
                    return NextResponse.json({
                        success: false,
                        error: 'Invalid referral code'
                    })
                }

                if (validation.referrerId === user.id) {
                    return NextResponse.json({
                        success: false,
                        error: "You can't refer yourself"
                    })
                }

                const result = await grantReferralBonus(validation.referrerId!, user.id)

                if (result.success) {
                    return NextResponse.json({
                        success: true,
                        bonusType: 'referral',
                        message: 'Referral bonus granted to your friend!'
                    })
                } else {
                    return NextResponse.json({
                        success: false,
                        error: result.error || 'Failed to grant referral bonus'
                    })
                }
            }

            default:
                return NextResponse.json(
                    { error: "Invalid bonus type. Must be 'signup' or 'referral'" },
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error("[API] Error claiming bonus:", error)
        return NextResponse.json(
            { error: "Failed to claim bonus" },
            { status: 500 }
        )
    }
}
