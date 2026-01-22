import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { generateVideo, generateAudio, SupportedModel, VideoGenerationOptions } from "@/lib/api-services"
import { GenerateResponse } from "@/types"
import {
    getOrCreateUser,
    createGeneration,
    updateGeneration,
} from "@/lib/db"
import { COST_PHO_POINTS, formatPhoPoints } from "@/lib/pho-points"
import {
    deductPhoPoints,
    refundPhoPoints,
    checkSufficientPhoPoints,
} from "@/lib/pho-points/transactions"

// Phở Points cost mapping for video generation
const MODEL_PHO_POINTS_COSTS: Record<string, Record<string, number>> = {
    "ltx-video": {
        "5": COST_PHO_POINTS.VIDEO_5S_1080P_FAST,   // 50K
        "10": COST_PHO_POINTS.VIDEO_10S_1080P_FAST, // 100K
    },
    "ltx-video-pro": {
        "5": COST_PHO_POINTS.VIDEO_5S_1080P_PRO,   // 75K
        "10": COST_PHO_POINTS.VIDEO_10S_1080P_PRO, // 150K
        "5-4k": COST_PHO_POINTS.VIDEO_5S_4K_PRO,   // 300K
    },
    "kling-2.6-pro": {
        "5": COST_PHO_POINTS.I2V_5S_1080P,  // 55K
        "10": COST_PHO_POINTS.I2V_10S_1080P, // 110K
    },
    "wan-2.6": {
        "5": COST_PHO_POINTS.I2V_5S_1080P,  // 55K
        "10": COST_PHO_POINTS.I2V_10S_1080P, // 110K
    },
}

// Validate model is supported
function isValidModel(model: string): model is SupportedModel {
    return ["ltx-video", "kling-2.6-pro", "wan-2.6"].includes(model)
}

// Calculate Phở Points cost for video generation
function calculateVideoCost(model: string, duration: number, resolution?: string): number {
    const modelCosts = MODEL_PHO_POINTS_COSTS[model] || MODEL_PHO_POINTS_COSTS["ltx-video"]

    // Check for 4K resolution
    if (resolution === "4k" || resolution === "2160p") {
        const fourKKey = `${duration}-4k`
        if (modelCosts[fourKKey]) {
            return modelCosts[fourKKey]
        }
    }

    // Default to duration-based cost
    const durationKey = String(duration)
    return modelCosts[durationKey] || COST_PHO_POINTS.VIDEO_5S_1080P_FAST
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to generate videos." },
                { status: 401 }
            )
        }

        // Get user info from Clerk
        const clerkUser = await currentUser()
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress

        // Get or create user in database
        const user = await getOrCreateUser(clerkId, email)
        console.log(`👤 [API] User: ${user.id} (${email || 'no email'}) - Phở Points: ${formatPhoPoints(user.phoPointsBalance)}`)

        // Parse request body
        const body = await request.json()
        const {
            prompt,
            model,
            duration = 5,
            resolution = "720p",
            aspectRatio = "16:9",
            seed,
            imageBase64,
            includeAudio = false,
            motion = 5
        } = body

        // Determine generation mode
        const isI2VMode = !!imageBase64

        // Validate required fields
        if (!prompt || !model) {
            return NextResponse.json(
                { error: "Missing required fields: prompt and model" },
                { status: 400 }
            )
        }

        // Validate model
        if (!isValidModel(model)) {
            return NextResponse.json(
                { error: `Unsupported model: ${model}. Available: ltx-video, kling-2.6-pro, wan-2.6` },
                { status: 400 }
            )
        }

        // Calculate Phở Points cost (replaces legacy credit system)
        const phoPointsCost = calculateVideoCost(model, duration, resolution)

        // Check if user has enough Phở Points
        const pointsCheck = await checkSufficientPhoPoints(user.id, phoPointsCost)
        if (!pointsCheck.sufficient) {
            console.log(`⚠️ [API] Insufficient Phở Points: ${formatPhoPoints(pointsCheck.balance)} < ${formatPhoPoints(phoPointsCost)}`)
            return NextResponse.json(
                {
                    error: "Insufficient Phở Points. Please upgrade your plan or purchase more points.",
                    phoPointsRequired: phoPointsCost,
                    phoPointsAvailable: pointsCheck.balance,
                    phoPointsShortfall: pointsCheck.shortfall,
                },
                { status: 402 } // Payment Required
            )
        }

        console.log(`📹 [API] Video generation request from user: ${user.id}`)
        console.log(`   Model: ${model}`)
        console.log(`   Mode: ${isI2VMode ? 'Image-to-Video' : 'Text-to-Video'}`)
        console.log(`   Prompt: ${prompt.substring(0, 100)}...`)
        console.log(`   Duration: ${duration}s, Resolution: ${resolution}`)
        console.log(`   Phở Points cost: ${formatPhoPoints(phoPointsCost)}`)

        // Deduct Phở Points optimistically        // Deduct points (Atomic)
        const deductResult = await deductPhoPoints(
            user.id,
            phoPointsCost,
            'spend_video', // Retaining original transaction type
            {
                model,
                duration,
                resolution,
                mode: isI2VMode ? 'i2v' : 't2v', // Retaining original mode
                prompt: prompt.substring(0, 200),
            }
        )

        if (!deductResult.success) {
            return NextResponse.json(
                { error: deductResult.error || "Failed to deduct Phở Points" }, // Changed message to match original
                { status: 402 }
            )
        }

        // Create generation record with 'pending' status
        const generation = await createGeneration({
            userId: user.id,
            prompt,
            imageUrl: isI2VMode ? 'i2v-upload' : undefined,
            model,
            cost: 0, // Legacy credits field (deprecated)
            type: "video",
        })

        // Prepare generation options
        const options: VideoGenerationOptions = {
            prompt,
            imageBase64,
            duration,
            resolution,
            seed,
            negativePrompt: "low quality, worst quality, deformed, distorted, blurry, motion smear",
            motion,
            includeAudio,
        }

        // Generate video using the unified service
        const result = await generateVideo(model, options)

        // Handle generation result
        if (result.status === "failed") {
            console.error(`❌ [API] Video generation failed: ${result.error}`)

            // Refund Phở Points on failure
            const refundResult = await refundPhoPoints(
                user.id,
                phoPointsCost,
                {
                    reason: 'generation_failed',
                    originalTransactionId: deductResult.transactionId,
                    error: result.error,
                    model,
                }
            )
            console.log(`💸 [API] Phở Points refunded: ${formatPhoPoints(phoPointsCost)}. Balance restored: ${formatPhoPoints(refundResult.newBalance)}`)

            // Update generation record to failed
            await updateGeneration(generation.id, { status: 'failed' })

            return NextResponse.json(
                {
                    error: result.error || "Video generation failed. Please try again.",
                    status: "failed",
                    phoPointsRefunded: phoPointsCost,
                },
                { status: 500 }
            )
        }

        // Optional: Generate Sound FX if requested
        let finalVideoUrl = result.videoUrl
        if (includeAudio) {
            console.log(`🎵 [API] Generating Phở Sound FX for video: ${generation.id}`)
            try {
                // Call the audio generation service
                const audioResult = await generateAudio(result.videoUrl, prompt)
                if (audioResult.status === "completed") {
                    finalVideoUrl = audioResult.audioUrl
                    console.log(`✅ [API] Sound FX added successfully: ${finalVideoUrl}`)
                }
            } catch (audioError) {
                console.error(`⚠️ [API] Sound FX generation failed, returning silent video:`, audioError)
                // We don't fail the whole request if only audio fails
            }
        }

        // Update generation record with final (possibly with audio) video URL
        await updateGeneration(generation.id, {
            status: 'completed',
            videoUrl: finalVideoUrl,
        })

        console.log(`✅ [API] Video generated successfully`)
        console.log(`   Video URL: ${result.videoUrl}`)
        console.log(`   Request ID: ${result.requestId}`)
        console.log(`   Generation ID: ${generation.id}`)

        // Return successful response
        const response: GenerateResponse = {
            videoUrl: finalVideoUrl,
            status: "completed",
            requestId: result.requestId,
            creditsUsed: 0, // Legacy field (deprecated)
            generationId: generation.id,
        }

        return NextResponse.json({
            ...response,
            phoPointsSpent: phoPointsCost,
            phoPointsBalance: deductResult.newBalance,
        })

    } catch (error) {
        console.error("❌ [API] Unexpected error:", error)

        // Handle specific error types
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invalid JSON in request body" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        )
    }
}

// Optional: Add GET endpoint for checking API status
export async function GET() {
    return NextResponse.json({
        status: "ok",
        availableModels: ["ltx-video", "kling-2.6-pro", "wan-2.6"],
        providers: {
            "fal.ai": !!process.env.FAL_KEY,
            "wavespeed": !!process.env.WAVESPEED_API_KEY,
        },
        pricingSystem: "pho-points",
    })
}
