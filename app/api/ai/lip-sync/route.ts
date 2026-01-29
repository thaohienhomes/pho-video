import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateTalkingHead, TalkingHeadOptions } from "@/lib/api-services"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// Lip Sync costs (based on audio duration)
// SadTalker costs ~$0.15/second = ~$4.50/30s
// We charge: 50K Phở Points per 10 seconds
const LIPSYNC_COST_PER_10S = 50000

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            sourceImageUrl,
            drivenAudioUrl,
            audioDuration = 10,  // seconds
            expressionScale = 1.0,
            preprocess = "crop",
            stillMode = false,
            enhanceFace = false,
        } = body

        if (!sourceImageUrl) {
            return NextResponse.json({ error: "Source image is required" }, { status: 400 })
        }

        if (!drivenAudioUrl) {
            return NextResponse.json({ error: "Audio is required" }, { status: 400 })
        }

        // Limit to 30 seconds max
        const effectiveDuration = Math.min(audioDuration, 30)

        // Calculate cost based on audio duration
        const cost = Math.ceil(effectiveDuration / 10) * LIPSYNC_COST_PER_10S

        // Check if user has enough points
        const dbUser = await getOrCreateUser(userId)
        const hasSufficientPoints = await checkSufficientPhoPoints(dbUser.id, cost)

        if (!hasSufficientPoints) {
            return NextResponse.json({
                error: "Insufficient Phở Points",
                required: cost,
                balance: dbUser.phoPointsBalance,
            }, { status: 402 })
        }

        console.log(`🎤 [Lip Sync API] Generating talking head...`)
        console.log(`   Duration: ${effectiveDuration}s, Cost: ${cost} Phở Points`)

        // Generate talking head video
        const result = await generateTalkingHead({
            sourceImageUrl,
            drivenAudioUrl,
            expressionScale,
            preprocess: preprocess as TalkingHeadOptions["preprocess"],
            stillMode,
            enhanceFace,
        })

        if (result.status === "failed") {
            return NextResponse.json({
                error: result.error || "Lip sync generation failed",
            }, { status: 500 })
        }

        // Deduct points on success
        await deductPhoPoints(dbUser.id, cost, `Lip Sync (${effectiveDuration}s)`)

        return NextResponse.json({
            success: true,
            videoUrl: result.videoUrl,
            requestId: result.requestId,
            cost,
            duration: effectiveDuration,
        })

    } catch (error) {
        console.error("❌ [Lip Sync API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}
