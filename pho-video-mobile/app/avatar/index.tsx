import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Plus, Info, ChevronRight, Sparkles } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

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

export default function AvatarHub() {
    const router = useRouter();

    // Fetch user's avatars
    const { data: avatars, isLoading } = useQuery({
        queryKey: ["avatars"],
        queryFn: () => api.getAvatars(),
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronRight size={24} color={COLORS.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.title}>My Avatar</Text>
                <TouchableOpacity style={styles.infoButton}>
                    <Info size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {avatars && avatars.length > 0 ? (
                    <View style={styles.avatarGrid}>
                        {avatars.map((avatar: any) => (
                            <TouchableOpacity
                                key={avatar.id}
                                style={styles.avatarCard}
                                onPress={() => router.push(`/(tabs)?avatarId=${avatar.id}`)}
                            >
                                <Image source={{ uri: avatar.imageUrl }} style={styles.avatarImage} />
                                <View style={styles.avatarOverlay}>
                                    <Text style={styles.avatarName}>{avatar.name}</Text>
                                    <View style={[styles.statusBadge, avatar.status === 'READY' ? styles.statusReady : styles.statusTraining]}>
                                        <Text style={styles.statusText}>{avatar.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.addCard}
                            onPress={() => router.push("/avatar/guide")}
                        >
                            <Plus size={32} color={COLORS.primary} />
                            <Text style={styles.addText}>New Avatar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <User size={64} color={COLORS.textDim} />
                            <Sparkles size={24} color={COLORS.primary} style={styles.sparkleIcon} />
                        </View>
                        <Text style={styles.emptyTitle}>No Avatars Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Teach Phở Video your face to generate yourself in any scene or style.
                        </Text>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push("/avatar/guide")}
                        >
                            <Text style={styles.createButtonText}>Create Your First Avatar</Text>
                        </TouchableOpacity>

                        <View style={styles.costInfo}>
                            <Text style={styles.costText}>⚡ 50K Phở Points per training</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { padding: 4 },
    title: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
    infoButton: { padding: 4 },
    content: { flexGrow: 1, padding: 20 },
    avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    avatarCard: {
        width: (width - 56) / 2,
        aspectRatio: 1,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: COLORS.surface,
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    avatarName: { color: COLORS.text, fontSize: 12, fontWeight: "600" },
    statusBadge: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    statusReady: { backgroundColor: "#10B981" },
    statusTraining: { backgroundColor: COLORS.primary },
    statusText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
    addCard: {
        width: (width - 56) / 2,
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    addText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
    emptyIconContainer: { position: "relative", marginBottom: 24 },
    sparkleIcon: { position: "absolute", top: -8, right: -8 },
    emptyTitle: { color: COLORS.text, fontSize: 24, fontWeight: "bold", marginBottom: 12 },
    emptySubtitle: {
        color: COLORS.textMuted,
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    costInfo: { marginTop: 20 },
    costText: { color: COLORS.textDim, fontSize: 12 },
});
