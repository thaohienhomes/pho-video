import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronRight, X, Trash2, ShieldCheck } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { PaywallSheet, PaywallSheetRef } from "../../components/PaywallSheet";
import { api } from "../../lib/api";

const { width } = Dimensions.get("window");

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    border: "rgba(255,255,255,0.1)",
};

export default function PhotoReview() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialPhotos = params.photos ? JSON.parse(params.photos as string) : [];

    const [photos, setPhotos] = useState<string[]>(initialPhotos);
    const [isUploading, setIsUploading] = useState(false);
    const paywallSheetRef = React.useRef<PaywallSheetRef>(null);

    const { data: creditData } = useQuery({
        queryKey: ["credits"],
        queryFn: () => api.getCredits(),
    });

    const handleRemove = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    const handleStartTraining = async () => {
        if (photos.length < 5) {
            Alert.alert("More Photos Needed", "A minimum of 5 photos is required to train the AI.");
            return;
        }

        const currentCredits = creditData?.credits || 0;
        const trainingCost = 200; // Phase 4 standard cost for Avatar

        if (currentCredits < trainingCost) {
            paywallSheetRef.current?.open();
            return;
        }

        setIsUploading(true);
        try {
            // Mock API call to start training
            // In reality, images would be uploaded to S3/Supabase first
            const name = "My Avatar"; // In real UI, we'd ask for a name
            const result = await api.startAvatarTraining({ name, images: photos });

            router.push({
                pathname: "/avatar/processing",
                params: { avatarId: result.avatarId }
            });
        } catch (e) {
            console.error(e);
            Alert.alert("Upload Failed", "Could not start training. Please check your connection.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.iconButton}>
                    <X size={24} color="#FFF" />
                </Pressable>
                <Text style={styles.title}>Review Photos</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <ShieldCheck size={20} color="#10B981" />
                    <Text style={styles.infoText}>
                        Your photos are used ONLY for training and are encrypted.
                    </Text>
                </View>

                <Text style={styles.photoCount}>
                    {photos.length} photos selected (minimum 5)
                </Text>

                <View style={styles.grid}>
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
                            <Pressable
                                style={styles.removeButton}
                                onPress={() => handleRemove(index)}
                            >
                                <Trash2 size={16} color="#FFF" />
                            </Pressable>
                        </View>
                    ))}

                    {photos.length < 12 && (
                        <Pressable style={styles.addMore} onPress={() => router.back()}>
                            <View style={styles.addCircle}>
                                <Text style={styles.addText}>+</Text>
                            </View>
                        </Pressable>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[styles.trainButton, (photos.length < 5 || isUploading) && styles.trainButtonDisabled]}
                    onPress={handleStartTraining}
                    disabled={photos.length < 5 || isUploading}
                >
                    <Text style={styles.trainText}>
                        {isUploading ? "Uploading..." : "Start Training"}
                    </Text>
                    {!isUploading && <ChevronRight size={20} color="#FFF" />}
                </Pressable>
            </View>

            <PaywallSheet ref={paywallSheetRef} />
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
        paddingVertical: 10
    },
    iconButton: { padding: 8 },
    title: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    placeholder: { width: 40 },
    content: { padding: 20 },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
    },
    infoText: { color: "#10B981", fontSize: 13, flex: 1 },
    photoCount: { color: COLORS.textMuted, fontSize: 14, marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    photoContainer: {
        width: (width - 64) / 3,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative"
    },
    photo: { width: "100%", height: "100%" },
    removeButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 6,
        borderRadius: 12
    },
    addMore: {
        width: (width - 64) / 3,
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center"
    },
    addCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center"
    },
    addText: { color: COLORS.textMuted, fontSize: 20 },
    footer: { padding: 20, paddingBottom: 40 },
    trainButton: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
    },
    trainButtonDisabled: { opacity: 0.5 },
    trainText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
