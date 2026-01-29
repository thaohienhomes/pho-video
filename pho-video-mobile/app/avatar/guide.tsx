import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    border: "rgba(255,255,255,0.1)",
};

const STEPS = [
    {
        title: "Good Lighting",
        description: "Natural light works best. Avoid heavy shadows or backlighting.",
        icon: "💡",
    },
    {
        title: "Clear Face",
        description: "No sunglasses, masks, or heavy makeup that hides your features.",
        icon: "👤",
    },
    {
        title: "Multiple Angles",
        description: "We'll guide you to capture your face from front, left, and right.",
        icon: "🔄",
    },
    {
        title: "Just You",
        description: "Make sure no other people are in the frame during capture.",
        icon: "✨",
    }
];

export default function CaptureGuide() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = React.useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push("/avatar/capture");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={COLORS.text} />
                </Pressable>
                <View style={styles.progressContainer}>
                    {STEPS.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                i === currentStep && styles.progressDotActive,
                                i < currentStep && styles.progressDotDone
                            ]}
                        />
                    ))}
                </View>
            </View>

            <Animated.View
                key={currentStep}
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(400)}
                style={styles.content}
            >
                <View style={styles.imageContainer}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.stepIcon}>{STEPS[currentStep].icon}</Text>
                    </View>
                </View>

                <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
                <Text style={styles.stepDescription}>{STEPS[currentStep].description}</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Pressable
                    onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    style={[styles.backButton, currentStep === 0 && { opacity: 0 }]}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft size={24} color={COLORS.textMuted} />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>

                <Pressable onPress={handleNext} style={styles.nextButton}>
                    <Text style={styles.nextText}>
                        {currentStep === STEPS.length - 1 ? "Start Capture" : "Next"}
                    </Text>
                    <ChevronRight size={20} color="#FFF" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 20,
    },
    closeButton: { padding: 4 },
    progressContainer: { flex: 1, flexDirection: "row", gap: 8 },
    progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.surface },
    progressDotActive: { backgroundColor: COLORS.primary },
    progressDotDone: { backgroundColor: "rgba(240, 66, 28, 0.4)" },
    content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    imageContainer: { marginBottom: 40 },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(240, 66, 28, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(240, 66, 28, 0.2)",
    },
    stepIcon: { fontSize: 48 },
    stepTitle: { color: COLORS.text, fontSize: 28, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
    stepDescription: { color: COLORS.textMuted, fontSize: 16, textAlign: "center", lineHeight: 24 },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 30,
        paddingBottom: 40,
    },
    backButton: { flexDirection: "row", alignItems: "center", gap: 4 },
    backText: { color: COLORS.textMuted, fontSize: 16, fontWeight: "600" },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    nextText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
