import { useEffect, useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { notifications } from "../lib/notifications";
import { api } from "../lib/api";

/**
 * usePushNotifications Hook
 * 
 * Handles push notification setup, permission requests, and token syncing.
 * Uses the existing NotificationService class.
 */
export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "undetermined">("undetermined");

    /**
     * Initialize push notifications
     */
    const initializeNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Initialize the notification service (requests permissions, gets token)
            const token = await notifications.init();

            if (token) {
                setExpoPushToken(token);
                setPermissionStatus("granted");

                // Sync token with backend
                try {
                    await api.registerPushToken(token);
                    console.log("✅ [Push] Token synced with backend");
                } catch (syncError) {
                    console.error("⚠️ [Push] Failed to sync token:", syncError);
                    // Don't fail the whole init if sync fails
                }
            } else {
                setPermissionStatus("denied");
                console.log("📱 [Push] Notifications not available or permission denied");
            }
        } catch (err) {
            console.error("❌ [Push] Initialization error:", err);
            setError(err instanceof Error ? err.message : "Failed to initialize notifications");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Request permission manually (if user previously denied)
     */
    const requestPermission = useCallback(async () => {
        if (Platform.OS === "web") {
            Alert.alert("Not Available", "Push notifications are not available on web.");
            return;
        }

        await initializeNotifications();
    }, [initializeNotifications]);

    /**
     * Display a foreground notification as an alert
     */
    const showForegroundNotification = useCallback((title: string, body: string, data?: object) => {
        Alert.alert(title, body, [
            { text: "OK", style: "cancel" },
            ...(data && (data as { type?: string }).type === "video_ready" ? [
                {
                    text: "Xem ngay",
                    onPress: () => {
                        // Navigate to gallery - this would need router access
                        console.log("Navigate to video:", data);
                    }
                }
            ] : [])
        ]);
    }, []);

    // Initialize on mount
    useEffect(() => {
        initializeNotifications();

        // Set up foreground notification listener
        const foregroundSubscription = notifications.addNotificationReceivedListener(
            (notification) => {
                const { title, body, data } = notification.request.content;
                console.log("📬 [Push] Foreground notification:", { title, body, data });

                // Show as alert when app is in foreground
                if (title) {
                    showForegroundNotification(title, body || "", data);
                }
            }
        );

        return () => {
            foregroundSubscription.remove();
        };
    }, [initializeNotifications, showForegroundNotification]);

    return {
        expoPushToken,
        isLoading,
        error,
        permissionStatus,
        requestPermission,
        showForegroundNotification,
    };
}
