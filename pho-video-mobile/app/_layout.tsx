import "../global.css";
import { useEffect, useState } from "react";
import { useRouter, Stack } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notifications } from "../lib/notifications";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { usePushNotifications } from '../hooks/usePushNotifications';

const queryClient = new QueryClient();
const ONBOARDING_KEY = '@pho_onboarding_completed';

export default function RootLayout() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Initialize push notifications
    const { expoPushToken, permissionStatus } = usePushNotifications();

    useEffect(() => {
        // Check onboarding status
        const checkOnboarding = async () => {
            try {
                const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
                if (!hasSeenOnboarding) {
                    setShowOnboarding(true);
                }
            } catch (error) {
                console.error('Error checking onboarding:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        // Navigate after loading
        if (!isLoading && showOnboarding) {
            router.replace('/onboarding');
        }
    }, [isLoading, showOnboarding, router]);

    useEffect(() => {
        // Handle deep links
        const handleDeepLink = (event: { url: string }) => {
            const { path, queryParams } = Linking.parse(event.url);
            console.log("Deep link received:", path, queryParams);

            if (path?.startsWith("video/")) {
                const videoId = path.replace("video/", "");
                router.push(`/video/${videoId}`);
            }
        };

        const subscription = Linking.addEventListener("url", handleDeepLink);

        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        const notificationSubscription = notifications.addNotificationResponseListener(
            (response) => {
                const data = response.notification.request.content.data;
                if (data?.type === "video_ready" && data?.videoId) {
                    router.push(`/(tabs)/gallery`);
                }
            }
        );

        return () => {
            subscription.remove();
            notificationSubscription.remove();
        };
    }, [router]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <StatusBar style="light" backgroundColor="#0A0A0A" />
                <ActivityIndicator size="large" color="#F0421C" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <SafeAreaProvider>
                        <View style={styles.container}>
                            <StatusBar style="light" backgroundColor="#0A0A0A" />
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="onboarding" />
                                <Stack.Screen name="(tabs)" />
                                <Stack.Screen
                                    name="video/[id]"
                                    options={{
                                        presentation: 'transparentModal',
                                        animation: 'fade'
                                    }}
                                />
                                <Stack.Screen
                                    name="paywall"
                                    options={{
                                        presentation: 'modal',
                                        animation: 'slide_from_bottom'
                                    }}
                                />
                            </Stack>
                        </View>
                    </SafeAreaProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
