import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Check, X, Zap, Sparkles, Crown } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

const { width } = Dimensions.get("window");

// SYNCED with web app: app/[locale]/(main)/account/subscription/page.tsx
const PLANS = [
    {
        id: "free",
        name: "Free",
        nameVi: "Miễn Phí",
        price: "$0",
        priceVi: "0đ",
        points: "50,000",
        period: "/mo",
        features: ["50,000 Phở Points/month", "5s max video", "Standard models", "3 daily generations"],
        highlight: false,
        color: "#525252",
        icon: Zap,
    },
    {
        id: "starter",
        name: "Starter",
        nameVi: "Khởi Đầu",
        price: "$9",
        priceVi: "199.000đ",
        points: "1,000,000",
        period: "/mo",
        features: ["1,000,000 Phở Points/month", "10s max video", "No watermark", "50 daily generations"],
        highlight: false,
        color: "#3B82F6",
        icon: Zap,
    },
    {
        id: "creator",
        name: "Creator",
        nameVi: "Sáng Tạo",
        price: "$24",
        priceVi: "499.000đ",
        points: "3,000,000",
        period: "/mo",
        features: ["3,000,000 Phở Points/month", "20s max video", "Pro models (Kling, LTX)", "4K upscaling", "200 daily generations"],
        highlight: true,
        color: "#F0421C",
        icon: Sparkles,
    },
    {
        id: "pro",
        name: "Pro",
        nameVi: "Chuyên Nghiệp",
        price: "$49",
        priceVi: "999.000đ",
        points: "7,000,000",
        period: "/mo",
        features: ["7,000,000 Phở Points/month", "Unlimited video duration", "All models + early access", "API access", "Priority support"],
        highlight: false,
        color: "#A855F7",
        icon: Crown,
    }
];

export default function PaywallScreen() {
    const router = useRouter();

    const handleSubscribe = (planId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (planId === "free") {
            Alert.alert("Current Plan", "You are already on the Free plan.");
            return;
        }

        // Open web pricing page for checkout
        // In production: integrate with in-app purchases or deep link to checkout
        Alert.alert(
            "Subscribe",
            `Upgrade to ${PLANS.find(p => p.id === planId)?.name} plan?\n\nThis will open the web checkout.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Continue",
                    onPress: () => {
                        Linking.openURL("https://pho.video/en/pricing");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Image / Gradient */}
            <ImageBackground
                source={{ uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" }}
                style={styles.backgroundImage}
            >
                <LinearGradient
                    colors={['rgba(10,10,10,0.6)', '#0A0A0A'] as const}
                    style={styles.gradientOverlay}
                />
            </ImageBackground>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <X color="white" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Upgrade Plan</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Unlock Your <Text style={{ color: "#F0421C" }}>Studio</Text></Text>
                    <Text style={styles.heroSubtitle}>Create cinematic videos without limits.</Text>
                </View>

                {/* Plans List */}
                <View style={styles.plansContainer}>
                    {PLANS.map((plan) => {
                        const IconComponent = plan.icon;
                        return (
                            <View
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    plan.highlight && styles.planCardActive,
                                    { borderColor: plan.highlight ? plan.color : 'rgba(255,255,255,0.1)' }
                                ]}
                            >
                                {plan.highlight && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularText}>MOST POPULAR</Text>
                                    </View>
                                )}

                                <View style={styles.planHeader}>
                                    <View style={styles.planNameRow}>
                                        <IconComponent size={18} color={plan.color} />
                                        <Text style={styles.planName}>{plan.name}</Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.planPrice}>{plan.price}</Text>
                                        <Text style={styles.planPeriod}>{plan.period}</Text>
                                    </View>
                                </View>

                                <View style={styles.creditsRow}>
                                    <Text style={styles.creditsEmoji}>🍜</Text>
                                    <Text style={[styles.creditsText, plan.highlight && { color: "#F0421C" }]}>
                                        {plan.points} Phở Points/mo
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.featuresList}>
                                    {plan.features.map((feature, i) => (
                                        <View key={i} style={styles.featureItem}>
                                            <Check size={14} color={plan.highlight ? "#F0421C" : "#A3A3A3"} />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: plan.highlight ? plan.color : 'rgba(255,255,255,0.1)' }
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => handleSubscribe(plan.id)}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {plan.price === "$0" ? "Current Plan" : "Subscribe"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                <Text style={styles.disclaimer}>
                    Subscription auto-renews. Cancel anytime in settings.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    heroSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
        alignItems: "center",
    },
    heroTitle: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
    },
    heroSubtitle: {
        color: "#A3A3A3",
        fontSize: 16,
        marginTop: 8,
        textAlign: "center",
    },
    plansContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    planCard: {
        backgroundColor: "rgba(20,20,20,0.8)",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    planCardActive: {
        backgroundColor: "rgba(30,30,30,0.9)",
        transform: [{ scale: 1.02 }],
    },
    popularBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#F0421C",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderBottomLeftRadius: 12,
    },
    popularText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    planHeader: {
        marginBottom: 12,
    },
    planNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    planName: {
        color: "#A3A3A3",
        fontSize: 16,
        fontWeight: "600",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "flex-end",
    },
    planPrice: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
    },
    planPeriod: {
        color: "#A3A3A3",
        fontSize: 16,
        marginBottom: 6,
        marginLeft: 2,
    },
    creditsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
    },
    creditsEmoji: {
        fontSize: 18,
    },
    creditsText: {
        color: "#A3A3A3",
        fontSize: 14,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginBottom: 20,
    },
    featuresList: {
        gap: 12,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    featureText: {
        color: "#D4D4D4",
        fontSize: 14,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    actionButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    disclaimer: {
        color: "#525252",
        fontSize: 12,
        textAlign: "center",
        marginTop: 24,
    },
});
