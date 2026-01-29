import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { fal } from "@fal-ai/client"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// Fal.ai configuration
fal.config({
    credentials: process.env.FAL_KEY,
})

// Cost: Same as I2V generation per 5s extension
const EXTEND_COST_PER_5S = 40000 // 40K Phở Points

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            videoUrl,
            lastFrameUrl,
            extensionSeconds = 5,
            prompt = "Continue this video seamlessly with natural motion"
        } = body

        if (!lastFrameUrl) {
            return NextResponse.json(
                { error: "Last frame URL is required for extension" },
                { status: 400 }
            )
        }

        // Calculate cost
        const cost = Math.ceil(extensionSeconds / 5) * EXTEND_COST_PER_5S

        // Check points
        const dbUser = await getOrCreateUser(userId)
        const hasSufficientPoints = await checkSufficientPhoPoints(dbUser.id, cost)

        if (!hasSufficientPoints) {
            return NextResponse.json({
                error: "Insufficient Phở Points",
                required: cost,
                balance: dbUser.phoPointsBalance,
            }, { status: 402 })
        }

        console.log(`🎬 [Extend Video] Extending by ${extensionSeconds}s...`)
        console.log(`   Cost: ${cost} Phở Points`)

        // Use Kling Image-to-Video to continue from last frame
        const result = await fal.subscribe("fal-ai/kling-video/v1/standard/image-to-video", {
            input: {
                prompt: prompt,
                image_url: lastFrameUrl,
                duration: extensionSeconds <= 5 ? "5" : "10",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("   ⏳ Extending video...")
                }
            },
        })

        const extendedVideoUrl = (result.data as { video?: { url?: string } })?.video?.url

        if (!extendedVideoUrl) {
            return NextResponse.json(
                { error: "Failed to extend video" },
                { status: 500 }
            )
        }

        // Deduct points
        await deductPhoPoints(dbUser.id, cost, `Video Extend (+${extensionSeconds}s)`)

        return NextResponse.json({
            success: true,
            originalUrl: videoUrl,
            extendedUrl: extendedVideoUrl,
            addedSeconds: extensionSeconds,
            cost,
        })
    } catch (error) {
        console.error("❌ [Extend Video] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to extend video" },
            { status: 500 }
        )
    }
}
