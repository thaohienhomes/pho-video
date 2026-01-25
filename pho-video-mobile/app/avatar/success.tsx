import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, Sparkles, Play } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
};

const PREVIEW_CARDS = [
    { title: "As a Warrior", emoji: "🗡️", color: "#F0421C" },
    { title: "In Space", emoji: "🚀", color: "#3B82F6" },
    { title: "Anime Style", emoji: "🎨", color: "#EC4899" },
    { title: "Cyberpunk", emoji: "🌆", color: "#A855F7" },
];

export default function AvatarSuccess() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const avatarId = params.avatarId as string;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <View style={styles.successBadge}>
                        <Check size={32} color="#FFF" />
                    </View>
                    <Text style={styles.title}>Avatar Ready!</Text>
                    <Text style={styles.subtitle}>
                        Phở Video has learned your face. You can now generate yourself in any scene.
                    </Text>
                </Animated.View>

                <View style={styles.grid}>
                    {PREVIEW_CARDS.map((card, index) => (
                        <Animated.View
                            key={index}
                            entering={FadeInUp.delay(200 + index * 100).duration(600)}
                            style={[styles.card, { backgroundColor: `${card.color}15`, borderColor: `${card.color}30` }]}
                        >
                            <Text style={styles.cardEmoji}>{card.emoji}</Text>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Sparkles size={20} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                        Try prompting with: &quot;Me as a warrior in a rainy cyberpunk city&quot;
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => router.push(`/(tabs)?avatarId=${avatarId}`)}
                >
                    <Text style={styles.ctaText}>Go to Studio</Text>
                    <Play size={20} color="#FFF" fill="#FFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, padding: 30, justifyContent: "center", alignItems: "center" },
    header: { alignItems: "center", marginBottom: 40 },
    successBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    title: { color: "#FFF", fontSize: 32, fontWeight: "bold", marginBottom: 16 },
    subtitle: { color: COLORS.textMuted, fontSize: 16, textAlign: "center", lineHeight: 24 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 40 },
    card: {
        width: (width - 76) / 2,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cardEmoji: { fontSize: 32, marginBottom: 12 },
    cardTitle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "rgba(240, 66, 28, 0.1)",
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: "center",
        marginBottom: 40,
    },
    infoText: { color: COLORS.primary, fontSize: 13, flex: 1, fontWeight: "500" },
    ctaButton: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 35,
        gap: 12,
        width: "100%",
    },
    ctaText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
