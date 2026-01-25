import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

/**
 * POST /api/user/push-token
 * Save user's Expo push token for mobile notifications
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate via Clerk
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { token } = body

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "Invalid token. Expected { token: string }" },
                { status: 400 }
            )
        }

        // Validate Expo push token format
        if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
            console.warn(`⚠️ [PushToken] Suspicious token format: ${token.substring(0, 30)}...`)
        }

        // Update user's push token
        const user = await db.user.update({
            where: { clerkId },
            data: { expoPushToken: token },
            select: { id: true, email: true, expoPushToken: true }
        })

        console.log(`📱 [PushToken] Registered for user ${user.id}: ${token.substring(0, 40)}...`)

        return NextResponse.json({
            success: true,
            message: "Push token registered successfully"
        })

    } catch (error) {
        console.error("❌ [PushToken] Error:", error)

        // Handle user not found
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            return NextResponse.json(
                { error: "User not found. Please sign up first." },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: "Failed to register push token" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/user/push-token
 * Remove user's push token (on logout)
 */
export async function DELETE() {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        await db.user.update({
            where: { clerkId },
            data: { expoPushToken: null }
        })

        console.log(`📱 [PushToken] Removed for user with clerkId: ${clerkId}`)

        return NextResponse.json({
            success: true,
            message: "Push token removed successfully"
        })

    } catch (error) {
        console.error("❌ [PushToken] Delete error:", error)
        return NextResponse.json(
            { error: "Failed to remove push token" },
            { status: 500 }
        )
    }
}
