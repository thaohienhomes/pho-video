import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { transcribeAudio, STTOptions } from "@/lib/api-services"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// STT costs (flat rate per transcription)
const STT_COST = 10000 // 10K Phở Points per transcription

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { audioUrl, model = "whisper", language } = body

        if (!audioUrl) {
            return NextResponse.json({ error: "Audio URL is required" }, { status: 400 })
        }

        const cost = STT_COST

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

        console.log(`📝 [STT API] Transcribing with ${model}...`)

        // Transcribe audio
        const result = await transcribeAudio({
            audioUrl,
            model: model as STTOptions["model"],
            language,
        })

        if (result.status === "failed") {
            return NextResponse.json({
                error: result.error || "Transcription failed",
            }, { status: 500 })
        }

        // Deduct points on success
        await deductPhoPoints(dbUser.id, cost, `STT transcription (${model})`)

        return NextResponse.json({
            success: true,
            text: result.text,
            requestId: result.requestId,
            cost,
            model,
        })

    } catch (error) {
        console.error("❌ [STT API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}
