import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser, createGeneration, updateGeneration } from "@/lib/db"
import { generateImage } from "@/lib/api-services"
import { COST_PHO_POINTS, formatPhoPoints } from "@/lib/pho-points"
import {
    deductPhoPoints,
    refundPhoPoints,
    checkSufficientPhoPoints,
} from "@/lib/pho-points/transactions"

// Phở Points cost for image generation
const IMAGE_PHO_POINTS_COSTS: Record<string, Record<string, number>> = {
    "flux-pro-v1.1": {
        "1": COST_PHO_POINTS.IMAGE_FLUX_PRO,      // 10K for single image
        "4": COST_PHO_POINTS.IMAGE_FLUX_BATCH_4,  // 35K for 4 images (batch discount)
    },
    "recraft-v3": {
        "1": COST_PHO_POINTS.IMAGE_RECRAFT_V3,    // 12.5K for single image
        "4": COST_PHO_POINTS.IMAGE_RECRAFT_V3 * 4 * 0.875, // 43.75K for 4 (12.5% batch discount)
    },
}

// Calculate Phở Points cost for image generation
function calculateImageCost(modelId: string, count: number): number {
    const modelCosts = IMAGE_PHO_POINTS_COSTS[modelId] || IMAGE_PHO_POINTS_COSTS["flux-pro-v1.1"]
    const countKey = String(count === 4 ? 4 : 1)
    return Math.round(modelCosts[countKey] || COST_PHO_POINTS.IMAGE_FLUX_PRO)
}

export async function POST(request: Request) {
    try {
        // Check authentication
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await getOrCreateUser(clerkId)

        // Parse request body
        const body = await request.json()
        const { prompt, aspectRatio, seed, modelId, count } = body

        const imageBatchCount = count === 4 ? 4 : 1
        const selectedModel = modelId || "flux-pro-v1.1"

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            )
        }

        // Calculate Phở Points cost
        const phoPointsCost = calculateImageCost(selectedModel, imageBatchCount)

        // Check if user has enough Phở Points
        const pointsCheck = await checkSufficientPhoPoints(user.id, phoPointsCost)
        if (!pointsCheck.sufficient) {
            console.log(`⚠️ [API] Insufficient Phở Points: ${formatPhoPoints(pointsCheck.balance)} < ${formatPhoPoints(phoPointsCost)}`)
            return NextResponse.json(
                {
                    error: `Insufficient Phở Points. This generation requires ${formatPhoPoints(phoPointsCost)}.`,
                    phoPointsRequired: phoPointsCost,
                    phoPointsAvailable: pointsCheck.balance,
                    phoPointsShortfall: pointsCheck.shortfall,
                },
                { status: 402 }
            )
        }

        console.log("[API] Generate Image request from user", user.id)
        console.log("   Prompt:", prompt.substring(0, 80) + "...")
        console.log("   Model:", selectedModel)
        console.log("   Count:", imageBatchCount)
        console.log("   Phở Points cost:", formatPhoPoints(phoPointsCost))

        // Deduct Phở Points upfront
        const deductResult = await deductPhoPoints(
            user.id,
            phoPointsCost,
            'spend_image',
            {
                model: selectedModel,
                count: imageBatchCount,
                prompt: prompt.substring(0, 200),
            }
        )

        if (!deductResult.success) {
            return NextResponse.json(
                { error: deductResult.error || "Failed to deduct Phở Points" },
                { status: 402 }
            )
        }

        console.log(`💰 [API] Phở Points deducted: ${formatPhoPoints(phoPointsCost)}. New balance: ${formatPhoPoints(deductResult.newBalance)}`)

        // Create initial generation record
        const generation = await createGeneration({
            userId: user.id,
            prompt,
            model: selectedModel,
            type: "image",
            cost: 0, // Legacy credits field (deprecated)
        })

        // Generate the image
        const result = await generateImage({
            prompt,
            aspectRatio: aspectRatio || "1:1",
            seed: seed ? parseInt(seed) : undefined,
            modelId: selectedModel,
            numImages: imageBatchCount
        })

        if (result.status === "failed") {
            // Refund Phở Points on failure
            const refundResult = await refundPhoPoints(
                user.id,
                phoPointsCost,
                {
                    reason: 'generation_failed',
                    originalTransactionId: deductResult.transactionId,
                    error: result.error,
                    model: selectedModel,
                }
            )
            console.log(`💸 [API] Phở Points refunded: ${formatPhoPoints(phoPointsCost)}. Balance restored: ${formatPhoPoints(refundResult.newBalance)}`)

            // Update generation as failed
            await updateGeneration(generation.id, { status: "failed" })
            return NextResponse.json(
                {
                    error: result.error || "Image generation failed",
                    phoPointsRefunded: phoPointsCost,
                },
                { status: 500 }
            )
        }

        // Update generation as completed with all result images
        await updateGeneration(generation.id, {
            status: "completed",
            imageUrl: result.imageUrls[0], // Keep legacy field for compatibility
            imageUrls: result.imageUrls
        })

        console.log("[API] Image(s) generated successfully, ID:", generation.id)

        return NextResponse.json({
            success: true,
            imageUrl: result.imageUrls[0],
            imageUrls: result.imageUrls,
            generationId: generation.id,
            creditsUsed: 0, // Legacy field (deprecated)
            phoPointsSpent: phoPointsCost,
            phoPointsBalance: deductResult.newBalance,
            type: "image"
        })

    } catch (error) {
        console.error("[API] Error generating image:", error)
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        )
    }
}
