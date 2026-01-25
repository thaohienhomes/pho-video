import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private expoPushToken: string | null = null;

    async init(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log("Push notifications only work on physical devices");
            return null;
        }

        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permissions if not granted
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Failed to get push notification permissions");
            return null;
        }

        // Get Expo push token
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: "ce8ebd1e-e6f9-400e-87f5-2392f2884425", // From app.json extra.eas.projectId
            });
            this.expoPushToken = tokenData.data;

            // Register token with backend
            if (this.expoPushToken) {
                await api.registerPushToken(this.expoPushToken);
            }

            // Configure Android channel
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("video-ready", {
                    name: "Video Ready",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#F0421C",
                });
            }

            return this.expoPushToken;
        } catch (error) {
            console.error("Error getting push token:", error);
            return null;
        }
    }

    // Listen for notifications
    addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    // Listen for notification taps
    addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    // Send local notification (for testing)
    async sendLocalNotification(title: string, body: string, data?: object) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data as Record<string, unknown>,
                sound: true,
            },
            trigger: null, // Immediate
        });
    }

    // Simulate video ready notification
    async notifyVideoReady(videoId: string, prompt: string) {
        await this.sendLocalNotification(
            "🎬 Video Phở Finished!",
            "Video của bạn đã sẵn sàng! Xem ngay thôi! ✨",
            { videoId, type: "video_ready" }
        );
    }

    async notifyAvatarReady(avatarId: string) {
        await this.sendLocalNotification(
            "✨ Avatar Ready!",
            "Avatar của bạn đã luyện xong! Vào tạo video ngay! 🎭",
            { avatarId, type: "avatar_ready" }
        );
    }
}

export const notifications = new NotificationService();
