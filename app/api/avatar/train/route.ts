import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser, db } from "@/lib/db"
import { COST_PHO_POINTS, formatPhoPoints } from "@/lib/pho-points"
import { deductPhoPoints, checkSufficientPhoPoints } from "@/lib/pho-points/transactions"

const AVATAR_TRAINING_COST = 50000 // 50K points as per plan

export async function POST(request: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await getOrCreateUser(clerkId)

        // Parse request
        const { name, images } = await request.json()
        if (!name || !images || !Array.isArray(images) || images.length < 5) {
            return NextResponse.json({ error: "Name and at least 5 images are required" }, { status: 400 })
        }

        // Check points
        const pointsCheck = await checkSufficientPhoPoints(user.id, AVATAR_TRAINING_COST)
        if (!pointsCheck.sufficient) {
            return NextResponse.json({
                error: `Insufficient Phở Points. Requires ${formatPhoPoints(AVATAR_TRAINING_COST)}.`,
                phoPointsRequired: AVATAR_TRAINING_COST,
            }, { status: 402 })
        }

        // Deduct points
        const deductResult = await deductPhoPoints(
            user.id,
            AVATAR_TRAINING_COST,
            'spend_avatar_train',
            { name, imageCount: images.length }
        )

        if (!deductResult.success) {
            return NextResponse.json({ error: "Failed to deduct points" }, { status: 402 })
        }

        // Create Avatar record
        const avatar = await db.avatar.create({
            data: {
                userId: user.id,
                name,
                status: "TRAINING",
                imageUrl: images[0], // Use first image as thumbnail for now
            }
        })

        console.log(`👤 [Avatar] Training started for ${name} (ID: ${avatar.id})`)

        // TODO: Integration with Replicate/Astria here
        // For now, we simulate the training start
        const replicateId = `train_${Math.random().toString(36).substring(7)}`

        await db.avatar.update({
            where: { id: avatar.id },
            data: { replicateId }
        })

        return NextResponse.json({
            success: true,
            avatarId: avatar.id,
            replicateId,
            status: "TRAINING",
            phoPointsSpent: AVATAR_TRAINING_COST,
            phoPointsBalance: deductResult.newBalance
        })

    } catch (error) {
        console.error("❌ [Avatar] Training error:", error)
        return NextResponse.json({ error: "Failed to start training" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await getOrCreateUser(clerkId)
        const avatars = await db.avatar.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(avatars)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch avatars" }, { status: 500 })
    }
}
