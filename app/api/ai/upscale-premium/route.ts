import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { upscaleVideoPremium, PremiumUpscaleOptions } from "@/lib/api-services"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"
import { getOrCreateUser } from "@/lib/db"

// Premium upscaler costs by model
const UPSCALE_COSTS: Record<string, number> = {
    "topaz": 100000,     // 100K - Premium Topaz quality
    "seedvr": 50000,     // 50K - ByteDance SeedVR
    "flashvsr": 30000,   // 30K - Fast real-time
    "standard": 25000,   // 25K - Basic upscaler
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { videoUrl, model = "topaz", scale = 2 } = body

        if (!videoUrl) {
            return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
        }

        // Calculate cost based on model and scale
        const baseCost = UPSCALE_COSTS[model] || UPSCALE_COSTS["standard"]
        const cost = scale === 4 ? baseCost * 2 : baseCost

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

        console.log(`📈 [Upscale Premium API] Starting ${model} upscale (${scale}x)...`)
        console.log(`   Cost: ${cost} Phở Points`)

        // Upscale video
        const result = await upscaleVideoPremium({
            videoUrl,
            model: model as PremiumUpscaleOptions["model"],
            scale: scale as 2 | 4,
        })

        if (result.status === "failed") {
            return NextResponse.json({
                error: result.error || "Upscale failed",
            }, { status: 500 })
        }

        // Deduct points on success
        await deductPhoPoints(dbUser.id, cost, `Premium upscale (${model}, ${scale}x)`)

        return NextResponse.json({
            success: true,
            videoUrl: result.videoUrl,
            requestId: result.requestId,
            cost,
            model,
            scale,
        })

    } catch (error) {
        console.error("❌ [Upscale Premium API] Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 })
    }
}
