import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
    generateVirtualTryOn,
    VirtualTryOnOptions,
} from "@/lib/api-services"
import { getOrCreateUser } from "@/lib/db"
import {
    checkSufficientPhoPoints,
    deductPhoPoints,
} from "@/lib/pho-points/transactions"

// Base cost: 75K points per sample
const BASE_COST = 75000

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            modelImageUrl,
            garmentImageUrl,
            garmentType = "auto",
            mode = "balanced",
            numSamples = 1,
            seed,
        } = body as {
            modelImageUrl: string
            garmentImageUrl: string
            garmentType?: VirtualTryOnOptions["garmentType"]
            mode?: VirtualTryOnOptions["mode"]
            numSamples?: number
            seed?: number
        }

        // Validate required fields
        if (!modelImageUrl) {
            return NextResponse.json(
                { error: "Model image URL is required" },
                { status: 400 }
            )
        }
        if (!garmentImageUrl) {
            return NextResponse.json(
                { error: "Garment image URL is required" },
                { status: 400 }
            )
        }

        // Calculate cost based on numSamples
        const clampedSamples = Math.min(Math.max(numSamples, 1), 4)
        const totalCost = BASE_COST * clampedSamples

        // Get user and check balance
        const dbUser = await getOrCreateUser(userId)
        const hasSufficientPoints = await checkSufficientPhoPoints(dbUser.id, totalCost)

        if (!hasSufficientPoints) {
            return NextResponse.json(
                {
                    error: "Insufficient Phở Points",
                    required: totalCost,
                    balance: dbUser.phoPointsBalance,
                },
                { status: 402 }
            )
        }

        console.log(`👕 [Try-on API] Generating for user ${userId}...`)
        console.log(`   Mode: ${mode}, Samples: ${clampedSamples}`)
        console.log(`   Cost: ${totalCost / 1000}K Phở Points`)

        // Generate virtual try-on
        const result = await generateVirtualTryOn({
            modelImageUrl,
            garmentImageUrl,
            garmentType,
            mode,
            numSamples: clampedSamples,
            seed,
        })

        if (result.status === "failed") {
            return NextResponse.json(
                { error: result.error || "Virtual try-on generation failed" },
                { status: 500 }
            )
        }

        // Deduct points on success
        await deductPhoPoints(
            dbUser.id,
            totalCost,
            `Virtual Try-on (${mode}, ${clampedSamples}x)`
        )

        return NextResponse.json({
            success: true,
            imageUrls: result.imageUrls,
            cost: totalCost,
            requestId: result.requestId,
        })
    } catch (error) {
        console.error("❌ [Try-on API] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
