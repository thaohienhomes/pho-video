/**
 * Push Notification Service (Server-Side)
 * 
 * Sends push notifications to mobile devices via Expo's Push Notification service.
 * Used by webhook handlers to notify users when async tasks complete.
 */

import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk"

// Create a singleton Expo SDK client
const expo = new Expo()

export interface PushNotificationData {
    type: "video_ready" | "avatar_ready" | "generation_failed"
    videoUrl?: string
    generationId?: string
    avatarId?: string
    [key: string]: unknown
}

/**
 * Send a push notification to a user's mobile device
 */
export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: PushNotificationData
): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    // Validate the push token format
    if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error(`❌ [Push] Invalid Expo push token: ${expoPushToken}`)
        return {
            success: false,
            error: `Invalid push token format: ${expoPushToken}`
        }
    }

    // Construct the message
    const message: ExpoPushMessage = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: data as Record<string, unknown>,
        priority: "high",
        channelId: "video-ready", // Matches Android channel in mobile app
    }

    console.log(`📤 [Push] Sending notification to ${expoPushToken.substring(0, 30)}...`)
    console.log(`   Title: ${title}`)
    console.log(`   Body: ${body}`)

    try {
        // Send the notification
        const tickets = await expo.sendPushNotificationsAsync([message])
        const ticket = tickets[0] as ExpoPushTicket

        if (ticket.status === "ok") {
            console.log(`✅ [Push] Notification sent successfully, ticket: ${ticket.id}`)
            return {
                success: true,
                ticketId: ticket.id
            }
        } else {
            // Handle error response
            const errorMessage = ticket.message || "Unknown error"
            const errorDetails = ticket.details?.error || ""
            console.error(`❌ [Push] Failed to send: ${errorMessage} (${errorDetails})`)
            return {
                success: false,
                error: `${errorMessage}: ${errorDetails}`
            }
        }
    } catch (error) {
        console.error("❌ [Push] Error sending notification:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}

/**
 * Send "Video Ready" notification
 * Convenience wrapper for the most common use case
 */
export async function notifyVideoReady(
    expoPushToken: string,
    videoUrl: string,
    generationId: string
): Promise<{ success: boolean; error?: string }> {
    return sendPushNotification(
        expoPushToken,
        "🍜 Video của bạn đã xong!",
        "Xem ngay thôi! ✨",
        {
            type: "video_ready",
            videoUrl,
            generationId,
        }
    )
}

/**
 * Send "Generation Failed" notification
 */
export async function notifyGenerationFailed(
    expoPushToken: string,
    generationId: string,
    error?: string
): Promise<{ success: boolean; error?: string }> {
    return sendPushNotification(
        expoPushToken,
        "❌ Không thể tạo video",
        "Đã có lỗi xảy ra. Vui lòng thử lại.",
        {
            type: "generation_failed",
            generationId,
            error,
        }
    )
}
