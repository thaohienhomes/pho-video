import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser, db } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId: clerkId } = await auth()
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await getOrCreateUser(clerkId)
        const avatar = await db.avatar.findUnique({
            where: {
                id: id,
                userId: user.id // Security check
            }
        })

        if (!avatar) {
            return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
        }

        // TODO: In a real scenario, we would check Replicate/Astria status here
        // For development, we'll auto-complete training after 30 seconds if it's still training
        if (avatar.status === "TRAINING") {
            const now = new Date()
            const timeDiff = now.getTime() - avatar.createdAt.getTime()

            if (timeDiff > 30000) { // 30 seconds for test
                const updatedAvatar = await db.avatar.update({
                    where: { id: avatar.id },
                    data: {
                        status: "READY",
                        modelUrl: "https://fal.run/lora/dummy-weights.safetensors" // Mock weights
                    }
                })
                return NextResponse.json(updatedAvatar)
            }
        }

        return NextResponse.json(avatar)

    } catch (error) {
        console.error("❌ [Avatar] Status error:", error)
        return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
    }
}
