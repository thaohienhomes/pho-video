import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateMusic, MusicGenerationOptions } from "@/lib/api-services"
import { COST_PHO_POINTS } from "@/lib/pho-points"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// Music generation costs (based on duration)
const MUSIC_COST_PER_30S = 30000 // 30K Phở Points for 30 seconds

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { prompt, duration = 30, model = "minimax", referenceAudioUrl } = body

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        // Calculate cost based on duration
        const cost = Math.ceil(duration / 30) * MUSIC_COST_PER_30S

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

        console.log(`🎵 [Music API] Generating ${duration}s music with ${model}...`)
        console.log(`   Cost: ${cost} Phở Points`)

        // Generate music
        const result = await generateMusic({
            prompt,
            duration,
            model: model as MusicGenerationOptions["model"],
            referenceAudioUrl,
        })

        if (result.status === "failed") {
            return NextResponse.json({
                error: result.error || "Music generation failed",
            }, { status: 500 })
        }

        // Deduct points on success
        await deductPhoPoints(dbUser.id, cost, `Music generation (${duration}s, ${model})`)

        return NextResponse.json({
            success: true,
            audioUrl: result.audioUrl,
            requestId: result.requestId,
            cost,
            model,
            duration,
        })

    } catch (error) {
        console.error("❌ [Music API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}
