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

// Cost: 75K points = ~$0.075
const TRYON_COST = 75000

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
        } = body as {
            modelImageUrl: string
            garmentImageUrl: string
            garmentType?: VirtualTryOnOptions["garmentType"]
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

        // Get user and check balance
        const dbUser = await getOrCreateUser(userId)
        const hasSufficientPoints = await checkSufficientPhoPoints(dbUser.id, TRYON_COST)

        if (!hasSufficientPoints) {
            return NextResponse.json(
                {
                    error: "Insufficient Phở Points",
                    required: TRYON_COST,
                    balance: dbUser.phoPointsBalance,
                },
                { status: 402 }
            )
        }

        console.log(`👕 [Try-on API] Generating for user ${userId}...`)
        console.log(`   Cost: ${TRYON_COST / 1000}K Phở Points`)

        // Generate virtual try-on
        const result = await generateVirtualTryOn({
            modelImageUrl,
            garmentImageUrl,
            garmentType,
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
            TRYON_COST,
            `Virtual Try-on (${garmentType})`
        )

        return NextResponse.json({
            success: true,
            imageUrl: result.imageUrl,
            cost: TRYON_COST,
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
