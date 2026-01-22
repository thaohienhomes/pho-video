import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { upscaleVideo } from "@/lib/api-services"
import { getOrCreateUser } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import { COST_PHO_POINTS, formatPhoPoints } from "@/lib/pho-points"
import {
    deductPhoPoints,
    refundPhoPoints,
    checkSufficientPhoPoints,
} from "@/lib/pho-points/transactions"

// Phở Points cost for upscaling (25K for 4K upscale)
const UPSCALE_PHO_POINTS_COST = COST_PHO_POINTS.UPSCALE_4K // 25,000 points

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { generationId, tier = 'fast' } = body

        if (!generationId) {
            return NextResponse.json(
                { error: "Missing required field: generationId" },
                { status: 400 }
            )
        }

        const phoPointsCost = UPSCALE_PHO_POINTS_COST

        // Get user from database
        const user = await getOrCreateUser(clerkId)
        console.log(`⚡ [Upscale] Request from user ${user.id} for generation ${generationId}`)

        // Check if user has enough Phở Points
        const pointsCheck = await checkSufficientPhoPoints(user.id, phoPointsCost)
        if (!pointsCheck.sufficient) {
            console.log(`⚠️ [Upscale] Insufficient Phở Points: ${formatPhoPoints(pointsCheck.balance)} < ${formatPhoPoints(phoPointsCost)}`)
            return NextResponse.json(
                {
                    error: "Insufficient Phở Points for upscaling.",
                    phoPointsRequired: phoPointsCost,
                    phoPointsAvailable: pointsCheck.balance,
                    phoPointsShortfall: pointsCheck.shortfall,
                },
                { status: 402 }
            )
        }

        // Get the generation record
        const generation = await prisma.generation.findUnique({
            where: { id: generationId },
        })

        if (!generation) {
            return NextResponse.json(
                { error: "Generation not found" },
                { status: 404 }
            )
        }

        // Check if generation belongs to user
        if (generation.userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this generation" },
                { status: 403 }
            )
        }

        // Check if video URL exists
        if (!generation.videoUrl) {
            return NextResponse.json(
                { error: "No video available to upscale" },
                { status: 400 }
            )
        }

        // Check if already upscaled
        if (generation.upscaledUrl) {
            return NextResponse.json(
                {
                    upscaledUrl: generation.upscaledUrl,
                    status: "already_completed",
                    message: "Video has already been upscaled"
                }
            )
        }

        // Deduct Phở Points optimistically
        const deductResult = await deductPhoPoints(
            user.id,
            phoPointsCost,
            'spend_upscale',
            {
                generationId,
                tier,
                videoUrl: generation.videoUrl.substring(0, 100),
            }
        )

        if (!deductResult.success) {
            return NextResponse.json(
                { error: deductResult.error || "Failed to deduct Phở Points" },
                { status: 402 }
            )
        }

        console.log(`💰 [Upscale] Phở Points deducted: ${formatPhoPoints(phoPointsCost)}. New balance: ${formatPhoPoints(deductResult.newBalance)}`)

        try {
            // Perform upscaling
            console.log(`🎬 [Upscale] Starting ${tier} upscale for video: ${generation.videoUrl}`)
            const result = await upscaleVideo(generation.videoUrl, {
                creative: tier === 'cinematic'
            })

            // Update generation with upscaled URL
            await prisma.generation.update({
                where: { id: generationId },
                data: { upscaledUrl: result.upscaledUrl },
            })

            console.log(`✅ [Upscale] Complete! Upscaled URL saved.`)

            return NextResponse.json({
                upscaledUrl: result.upscaledUrl,
                status: "completed",
                creditsUsed: 0, // Legacy field (deprecated)
                phoPointsSpent: phoPointsCost,
                phoPointsBalance: deductResult.newBalance,
            })

        } catch (upscaleError) {
            // Refund Phở Points on failure
            const refundResult = await refundPhoPoints(
                user.id,
                phoPointsCost,
                {
                    reason: 'upscale_failed',
                    originalTransactionId: deductResult.transactionId,
                    error: upscaleError instanceof Error ? upscaleError.message : 'Unknown error',
                    generationId,
                }
            )
            console.error(`❌ [Upscale] Failed:`, upscaleError)
            console.log(`💸 [Upscale] Phở Points refunded. Balance: ${formatPhoPoints(refundResult.newBalance)}`)

            return NextResponse.json(
                {
                    error: "Upscaling failed. Phở Points have been refunded.",
                    phoPointsRefunded: phoPointsCost,
                },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("❌ [Upscale] Unexpected error:", error)
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        )
    }
}
