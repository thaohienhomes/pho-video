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
        const { prompt, duration = 30, model = "minimax", referenceAudioUrl, lyrics } = body

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
        if (lyrics) console.log(`   With lyrics: ${lyrics.substring(0, 50)}...`)

        // Generate music
        const result = await generateMusic({
            prompt,
            duration,
            model: model as MusicGenerationOptions["model"],
            referenceAudioUrl,
            lyrics,
        })

        if (result.status === "failed") {
            // Sanitize error - don't expose provider details
            let userError = "Music generation failed. Please try again."
            let statusCode = 500

            // Map internal errors to user-friendly messages
            const errorLower = (result.error || "").toLowerCase()

            if (errorLower.includes("forbidden") || errorLower.includes("exhausted") || errorLower.includes("locked")) {
                // Provider quota/access issue - don't expose to user
                userError = "This model is temporarily unavailable. Please try another model."
                statusCode = 503
                console.warn(`⚠️ [Music API] Provider access issue for ${model} - suggesting alternative`)
            } else if (errorLower.includes("rate limit") || errorLower.includes("too many")) {
                userError = "Too many requests. Please wait a moment and try again."
                statusCode = 429
            } else if (errorLower.includes("invalid") || errorLower.includes("bad request")) {
                userError = "Invalid request. Please check your input and try again."
                statusCode = 400
            }

            return NextResponse.json({ error: userError }, { status: statusCode })
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

        // Sanitize catch-all errors
        let userError = "Generation failed. Please try again."

        if (error instanceof Error) {
            const msg = error.message.toLowerCase()
            if (msg.includes("forbidden") || msg.includes("403")) {
                userError = "This model is temporarily unavailable. Please try another model."
            } else if (msg.includes("timeout")) {
                userError = "Request timed out. Please try again."
            }
        }

        return NextResponse.json({ error: userError }, { status: 500 })
    }
}
