import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
    generateFalVideoUnified,
    generateMusic,
    mergeVideos,
    mergeAudioWithVideo
} from "@/lib/api-services"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

/**
 * Phở Storyboard API
 * 
 * Converts a text story into a full video with scenes and music.
 * Pipeline: Text → LLM Scene Breakdown → Images → Videos → Merge → Add Music
 */

const STORYBOARD_BASE_COST = 500000 // 500K base cost for storyboard workflow

export interface StoryboardRequest {
    story: string              // Full story text
    scenes?: number            // Number of scenes (default: 3)
    sceneDescriptions?: string[] // Optional manual scene descriptions
    videoModel?: string        // Video generation model
    musicPrompt?: string       // Optional custom music prompt
    duration?: number          // Target duration per scene in seconds
}

export interface SceneResult {
    sceneNumber: number
    description: string
    imageUrl?: string
    videoUrl?: string
    status: "pending" | "completed" | "failed"
    error?: string
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body: StoryboardRequest = await request.json()
        const {
            story,
            scenes = 3,
            sceneDescriptions,
            videoModel = "pho-instant",
            musicPrompt,
            duration = 5,
        } = body

        if (!story && !sceneDescriptions?.length) {
            return NextResponse.json({
                error: "Story text or scene descriptions required"
            }, { status: 400 })
        }

        // Calculate cost based on scenes
        const estimatedCost = STORYBOARD_BASE_COST + (scenes * 100000) // +100K per scene

        // Check if user has enough points
        const dbUser = await getOrCreateUser(userId)
        const hasSufficientPoints = await checkSufficientPhoPoints(dbUser.id, estimatedCost)

        if (!hasSufficientPoints) {
            return NextResponse.json({
                error: "Insufficient Phở Points for storyboard",
                required: estimatedCost,
                balance: dbUser.phoPointsBalance,
                breakdown: {
                    base: STORYBOARD_BASE_COST,
                    perScene: 100000,
                    scenes,
                }
            }, { status: 402 })
        }

        console.log(`📖 [Storyboard] Starting ${scenes}-scene generation...`)
        console.log(`   Story: ${story?.substring(0, 100)}...`)
        console.log(`   Estimated cost: ${estimatedCost} Phở Points`)

        // Get scene descriptions (either provided or generate from story)
        const scenePrompts = sceneDescriptions || generateScenePrompts(story, scenes)

        const sceneResults: SceneResult[] = []
        const videoUrls: string[] = []

        // Generate each scene
        for (let i = 0; i < scenePrompts.length; i++) {
            const sceneDesc = scenePrompts[i]
            console.log(`🎬 [Storyboard] Generating scene ${i + 1}/${scenePrompts.length}...`)

            try {
                // Generate video for scene
                const videoResult = await generateFalVideoUnified(videoModel, {
                    prompt: `Cinematic scene: ${sceneDesc}. High quality, smooth motion, film-like.`,
                    duration,
                    aspectRatio: "16:9",
                })

                if (videoResult.status === "completed" && videoResult.videoUrl) {
                    videoUrls.push(videoResult.videoUrl)
                    sceneResults.push({
                        sceneNumber: i + 1,
                        description: sceneDesc,
                        videoUrl: videoResult.videoUrl,
                        status: "completed",
                    })
                } else {
                    sceneResults.push({
                        sceneNumber: i + 1,
                        description: sceneDesc,
                        status: "failed",
                        error: videoResult.error,
                    })
                }
            } catch (err) {
                sceneResults.push({
                    sceneNumber: i + 1,
                    description: sceneDesc,
                    status: "failed",
                    error: err instanceof Error ? err.message : "Scene generation failed",
                })
            }
        }

        // Merge all successful videos
        let finalVideoUrl = ""
        if (videoUrls.length > 1) {
            console.log(`🔗 [Storyboard] Merging ${videoUrls.length} scenes...`)
            const mergeResult = await mergeVideos({ videoUrls })
            if (mergeResult.status === "completed") {
                finalVideoUrl = mergeResult.resultUrl
            }
        } else if (videoUrls.length === 1) {
            finalVideoUrl = videoUrls[0]
        }

        // Generate and add music if requested
        let finalWithMusicUrl = finalVideoUrl
        if (finalVideoUrl && musicPrompt) {
            console.log(`🎵 [Storyboard] Generating background music...`)
            const musicResult = await generateMusic({
                prompt: musicPrompt || `Background music for: ${story?.substring(0, 200)}`,
                duration: duration * scenes,
            })

            if (musicResult.status === "completed" && musicResult.audioUrl) {
                const audioMergeResult = await mergeAudioWithVideo({
                    videoUrl: finalVideoUrl,
                    audioUrl: musicResult.audioUrl,
                })
                if (audioMergeResult.status === "completed") {
                    finalWithMusicUrl = audioMergeResult.resultUrl
                }
            }
        }

        // Deduct points
        const actualCost = STORYBOARD_BASE_COST + (sceneResults.filter(s => s.status === "completed").length * 100000)
        await deductPhoPoints(dbUser.id, actualCost, `Storyboard (${sceneResults.length} scenes)`)

        console.log(`✅ [Storyboard] Complete!`)

        return NextResponse.json({
            success: true,
            finalVideoUrl: finalWithMusicUrl || finalVideoUrl,
            scenes: sceneResults,
            cost: actualCost,
            totalScenes: scenePrompts.length,
            successfulScenes: sceneResults.filter(s => s.status === "completed").length,
        })

    } catch (error) {
        console.error("❌ [Storyboard API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}

/**
 * Simple scene breakdown from story text
 * In production, this would use an LLM for better results
 */
function generateScenePrompts(story: string, sceneCount: number): string[] {
    // Split story into sentences and group into scenes
    const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentencesPerScene = Math.ceil(sentences.length / sceneCount)

    const scenes: string[] = []
    for (let i = 0; i < sceneCount; i++) {
        const start = i * sentencesPerScene
        const end = Math.min(start + sentencesPerScene, sentences.length)
        const sceneText = sentences.slice(start, end).join(". ").trim()

        if (sceneText) {
            scenes.push(sceneText)
        }
    }

    // Ensure we have at least one scene
    if (scenes.length === 0 && story.trim()) {
        scenes.push(story.trim())
    }

    return scenes
}
