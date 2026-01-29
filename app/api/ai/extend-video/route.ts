import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { fal } from "@fal-ai/client"

// Fal.ai configuration
fal.config({
    credentials: process.env.FAL_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { videoUrl, extensionSeconds = 5, prompt = "Continue this video seamlessly" } = body

        if (!videoUrl) {
            return NextResponse.json(
                { error: "Video URL is required" },
                { status: 400 }
            )
        }

        // Use video-to-video extension approach
        // Since LTX doesn't support direct video extension, we use a workaround:
        // 1. Extract last frame from video (client-side)
        // 2. Use Image-to-Video to continue from that frame
        // For now, return a placeholder response indicating manual workflow

        // Alternative: Use Kling's extend feature if available
        const result = await fal.subscribe("fal-ai/kling-video/v1/standard/image-to-video", {
            input: {
                prompt: prompt,
                image_url: videoUrl.replace(/\.(mp4|webm)$/, '_lastframe.jpg'), // Assumes lastframe extracted
                duration: "5" as const,
            },
            logs: true,
            onQueueUpdate: (update) => {
                console.log("[Extend Video] Queue update:", update.status)
            },
        })

        // Return extended video URL
        const extendedVideoUrl = (result.data as { video?: { url?: string } })?.video?.url

        if (!extendedVideoUrl) {
            return NextResponse.json(
                { error: "Failed to extend video - please extract last frame first" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            originalUrl: videoUrl,
            extendedUrl: extendedVideoUrl,
            addedSeconds: extensionSeconds,
            note: "Extended from last frame using I2V"
        })
    } catch (error) {
        console.error("[Extend Video] Error:", error)
        return NextResponse.json(
            { error: "Failed to extend video" },
            { status: 500 }
        )
    }
}

