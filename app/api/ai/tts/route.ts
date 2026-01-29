import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateTTS, TTSOptions } from "@/lib/api-services"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// TTS costs (based on character count)
const TTS_COST_PER_1000_CHARS = 5000 // 5K Phở Points per 1000 characters

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { text, voice, model = "elevenlabs", language } = body

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        // Calculate cost based on text length
        const charCount = text.length
        const cost = Math.max(5000, Math.ceil(charCount / 1000) * TTS_COST_PER_1000_CHARS)

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

        console.log(`🗣️ [TTS API] Generating speech with ${model}...`)
        console.log(`   Characters: ${charCount}, Cost: ${cost} Phở Points`)

        // Generate speech
        const result = await generateTTS({
            text,
            voice,
            model: model as TTSOptions["model"],
            language,
        })

        if (result.status === "failed") {
            return NextResponse.json({
                error: result.error || "TTS generation failed",
            }, { status: 500 })
        }

        // Deduct points on success
        await deductPhoPoints(dbUser.id, cost, `TTS (${charCount} chars, ${model})`)

        return NextResponse.json({
            success: true,
            audioUrl: result.audioUrl,
            requestId: result.requestId,
            cost,
            model,
            charCount,
        })

    } catch (error) {
        console.error("❌ [TTS API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}
