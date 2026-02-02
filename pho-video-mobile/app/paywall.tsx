import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Check, X, Zap, Sparkles, Crown, Building2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";

import { COLORS } from "../constants/Colors";
const { width } = Dimensions.get("window");

// SYNCED with web app: app/[locale]/(main)/pricing/page.tsx
// Last sync: 2026-02-02
const PLANS = [
    {
        id: "free",
        name: "Free",
        nameVi: "Miễn Phí",
        monthlyPrice: 0,
        annualPrice: 0,
        points: "50,000",
        features: ["50,000 Phở Points/month", "5s max video", "Standard models", "3 daily generations"],
        highlight: false,
        color: "#525252",
        icon: Zap,
    },
    {
        id: "starter",
        name: "Starter",
        nameVi: "Khởi Đầu",
        monthlyPrice: 9,
        annualPrice: 86.40,
        points: "1,000,000",
        features: ["1,000,000 Phở Points/month", "10s max video", "No watermark", "50 daily generations"],
        highlight: false,
        color: "#3B82F6",
        icon: Zap,
    },
    {
        id: "creator",
        name: "Creator",
        nameVi: "Sáng Tạo",
        monthlyPrice: 24,
        annualPrice: 230.40,
        points: "3,000,000",
        features: ["3,000,000 Phở Points/month", "20s max video", "Pro models (Kling, LTX)", "4K upscaling", "200 daily generations"],
        highlight: true,
        color: COLORS.primary,
        icon: Sparkles,
    },
    {
        id: "pro",
        name: "Pro",
        nameVi: "Chuyên Nghiệp",
        monthlyPrice: 49,
        annualPrice: 470.40,
        points: "7,000,000",
        features: ["7,000,000 Phở Points/month", "Unlimited video duration", "All models + early access", "API access", "Priority support"],
        highlight: false,
        color: COLORS.accent.purple,
        icon: Crown,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        nameVi: "Doanh Nghiệp",
        monthlyPrice: 99,
        annualPrice: 950.40,
        points: "20,000,000",
        features: ["20,000,000 Phở Points/month", "Priority generation queue", "Custom AI training (LoRA)", "White-label API", "Dedicated account manager"],
        highlight: false,
        color: "#F59E0B",
        icon: Building2,
    }
];

export default function PaywallScreen() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

    const handleSubscribe = (planId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (planId === "free") {
            Alert.alert("Current Plan", "You are already on the Free plan.");
            return;
        }

        const plan = PLANS.find(p => p.id === planId);
        const price = billingCycle === "monthly" ? plan?.monthlyPrice : plan?.annualPrice;

        // Open web pricing page for checkout
        // In production: integrate with in-app purchases or deep link to checkout
        Alert.alert(
            "Subscribe",
            `Upgrade to ${plan?.name} plan for $${price?.toFixed(0)}/${billingCycle === "monthly" ? "mo" : "year"}?\n\nThis will open the web checkout.`,
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
                    colors={[COLORS.background, COLORS.background]}
                    style={[styles.gradientOverlay, { opacity: 0.9 }]}
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
                    <Text style={styles.heroTitle}>Unlock Your <Text style={{ color: COLORS.primary }}>Studio</Text></Text>
                    <Text style={styles.heroSubtitle}>Create cinematic videos without limits.</Text>
                </View>

                {/* Billing Toggle */}
                <View style={styles.billingToggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, billingCycle === "monthly" && styles.toggleButtonActive]}
                        onPress={() => setBillingCycle("monthly")}
                    >
                        <Text style={[styles.toggleText, billingCycle === "monthly" && styles.toggleTextActive]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, billingCycle === "annual" && styles.toggleButtonActive]}
                        onPress={() => setBillingCycle("annual")}
                    >
                        <Text style={[styles.toggleText, billingCycle === "annual" && styles.toggleTextActive]}>Annual</Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveBadgeText}>-20%</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Plans List */}
                <View style={styles.plansContainer}>
                    {PLANS.map((plan) => {
                        const IconComponent = plan.icon;
                        const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice / 12;
                        const annualSavings = (plan.monthlyPrice * 12) - plan.annualPrice;

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
                                        <Text style={styles.planPrice}>${price.toFixed(0)}</Text>
                                        <Text style={styles.planPeriod}>/mo</Text>
                                    </View>
                                    {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                                        <View style={styles.savingsRow}>
                                            <Text style={styles.savingsText}>Save ${annualSavings.toFixed(0)}/year</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.creditsRow}>
                                    <Text style={styles.creditsEmoji}>🍜</Text>
                                    <Text style={[styles.creditsText, plan.highlight && { color: COLORS.primary }]}>
                                        {plan.points} Phở Points/mo
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.featuresList}>
                                    {plan.features.map((feature, i) => (
                                        <View key={i} style={styles.featureItem}>
                                            <Check size={14} color={plan.highlight ? COLORS.primary : COLORS.textMuted} />
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
                                        {plan.monthlyPrice === 0 ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Subscribe"}
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
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.surface,
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
        color: COLORS.textMuted,
        fontSize: 16,
        marginTop: 8,
        textAlign: "center",
    },
    plansContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    planCard: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    planCardActive: {
        backgroundColor: COLORS.glass,
        transform: [{ scale: 1.02 }],
    },
    popularBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: COLORS.primary,
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
    billingToggle: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 20,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    toggleButtonActive: {
        backgroundColor: "white",
    },
    toggleText: {
        color: "rgba(255,255,255,0.6)",
        fontWeight: "600",
        fontSize: 14,
    },
    toggleTextActive: {
        color: "#0A0A0A",
    },
    saveBadge: {
        backgroundColor: "#22C55E",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saveBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    savingsRow: {
        marginTop: 4,
    },
    savingsText: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
    },
});
