import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Loader2, Sparkles, Bell } from "lucide-react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    FadeIn
} from "react-native-reanimated";
import { api } from "../../lib/api";
import { notifications } from "../../lib/notifications";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    textDim: "#525252",
    border: "rgba(255,255,255,0.1)",
};

const STATUS_MESSAGES = [
    "Analyzing your unique features...",
    "Defining bone structure...",
    "Learning facial expressions...",
    "Applying cinematic textures...",
    "Finalizing your AI model...",
    "Almost ready to generate!"
];

export default function AvatarProcessing() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const avatarId = params.avatarId as string;

    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1
        );
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1
        );
    }, [pulse, rotation]);

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, 5000);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return prev;
                return prev + 1;
            });
        }, 2000);

        // Polling API for status
        const pollInterval = setInterval(async () => {
            try {
                const status = await api.getAvatarStatus(avatarId);
                if (status.status === 'READY') {
                    clearInterval(pollInterval);
                    clearInterval(messageInterval);
                    clearInterval(progressInterval);

                    // Notify user
                    await notifications.sendLocalNotification(
                        "👤 Avatar Ready!",
                        "Your AI Avatar is now trained and ready to use in Studio."
                    );

                    router.push({
                        pathname: "/avatar/success",
                        params: { avatarId }
                    });
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 5000);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
            clearInterval(pollInterval);
        };
    }, [avatarId, router]);

    const animatedLoaderStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: 2 - pulse.value
    }));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.visualContainer}>
                    <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
                    <View style={styles.loaderOuter}>
                        <Animated.View style={animatedLoaderStyle}>
                            <Loader2 size={120} color={COLORS.primary} strokeWidth={1} />
                        </Animated.View>
                        <View style={styles.iconContainer}>
                            <Sparkles size={40} color={COLORS.primary} />
                        </View>
                    </View>
                </View>

                <Animated.View entering={FadeIn.delay(500)} style={styles.textContainer}>
                    <Text style={styles.title}>Creating Your AI Twin</Text>
                    <Text style={styles.subtitle}>{STATUS_MESSAGES[messageIndex]}</Text>
                </Animated.View>

                <View style={styles.progressSection}>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}% complete</Text>
                </View>

                <View style={styles.infoBox}>
                    <Bell size={20} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>
                        Training usually takes 2-5 minutes. You can close the app and we&apos;ll notify you when it&apos;s done.
                    </Text>
                </View>

                <Pressable
                    style={styles.minimizeButton}
                    onPress={() => router.push("/(tabs)")}
                >
                    <Text style={styles.minimizeText}>Go back to Studio</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
    visualContainer: { width: 200, height: 200, justifyContent: "center", alignItems: "center", marginBottom: 60 },
    pulseCircle: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: COLORS.primary
    },
    loaderOuter: { width: 140, height: 140, justifyContent: "center", alignItems: "center" },
    iconContainer: { position: "absolute" },
    textContainer: { alignItems: "center", marginBottom: 40 },
    title: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 12 },
    subtitle: { color: COLORS.textMuted, fontSize: 16, textAlign: "center" },
    progressSection: { width: "100%", marginBottom: 40 },
    progressBarContainer: {
        height: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 12
    },
    progressBar: {
        height: "100%",
        backgroundColor: COLORS.primary,
        borderRadius: 3
    },
    progressText: { color: COLORS.textDim, fontSize: 12, textAlign: "center" },
    infoBox: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: "center",
        marginBottom: 40,
    },
    infoText: { color: COLORS.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
    minimizeButton: { padding: 12 },
    minimizeText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
});
