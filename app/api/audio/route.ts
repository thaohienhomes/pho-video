import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser, checkCredits, deductCredits, updateGeneration } from "@/lib/db"
import { generateAudio } from "@/lib/api-services"
import { db } from "@/lib/db"

/**
 * POST /api/audio
 * Generates audio for an existing video generation
 */
export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { generationId, prompt } = body

        if (!generationId) {
            return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
        }

        // 1. Get user and check credits
        const user = await getOrCreateUser(clerkId)
        const COST = 5 // Audio generation cost

        const hasCredits = await checkCredits(user.id, COST)
        if (!hasCredits) {
            return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
        }

        // 2. Fetch generation to get video URL
        const generation = await db.generation.findUnique({
            where: { id: generationId }
        })

        if (!generation || generation.userId !== user.id) {
            return NextResponse.json({ error: "Generation not found" }, { status: 404 })
        }

        // Use upscaled URL if available, otherwise original video URL
        const targetVideoUrl = generation.upscaledUrl || generation.videoUrl

        if (!targetVideoUrl) {
            return NextResponse.json({ error: "Video not ready for audio generation" }, { status: 400 })
        }

        // 3. Deduct credits first (optimistic)
        await deductCredits(user.id, COST)

        // 4. Call AI Service
        const result = await generateAudio(targetVideoUrl, prompt)

        if (result.status === "failed") {
            // Refund on failure
            await deductCredits(user.id, -COST)
            return NextResponse.json({ error: result.error || "Audio generation failed" }, { status: 500 })
        }

        // 5. Update Database
        await updateGeneration(generationId, {
            audioUrl: result.audioUrl
        })

        return NextResponse.json({
            success: true,
            audioUrl: result.audioUrl,
            credits: user.credits - COST
        })

    } catch (error) {
        console.error("[API] Audio generation error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
