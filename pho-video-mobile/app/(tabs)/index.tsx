import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StyleSheet,
    RefreshControl,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Settings2, Sparkles, Loader2, User } from "lucide-react-native";
import { AdvancedSettingsSheet, AdvancedSettingsSheetRef } from "../../components/AdvancedSettingsSheet";
import { PaywallSheet, PaywallSheetRef } from "../../components/PaywallSheet";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { GenerateButton } from "../../components/GenerateButton";
import { VideoCard } from "../../components/VideoCard";
import { ImagePickerComponent } from "../../components/ImagePicker";
import { api } from "../../lib/api";
import { notifications } from "../../lib/notifications";
import { useGenerateVideo, useAppConfig } from "../../lib/hooks";
import { ProcessingScreen } from "../../components/ProcessingScreen";
import { useInstantPreview } from "../../lib/useInstantPreview";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { Image as RNImage } from "react-native";

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

const STYLE_PRESETS = [
    { id: 'none', name: 'None', emoji: '✨', color: '#525252' },
    { id: 'cinematic', name: 'Cinematic', emoji: '🎬', color: '#F0421C' },
    { id: 'anime', name: 'Anime', emoji: '🎨', color: '#EC4899' },
    { id: 'realistic', name: 'Realistic', emoji: '📸', color: '#3B82F6' },
    { id: 'vintage', name: 'Vintage', emoji: '📽️', color: '#F59E0B' },
    { id: 'neon', name: 'Neon', emoji: '💜', color: '#A855F7' },
];

// Categories from Web App /api/ideas
const CATEGORIES = [
    { id: 'All', emoji: '🔥' },
    { id: 'E-commerce', emoji: '🛒' },
    { id: 'Cinematic', emoji: '🎬' },
    { id: 'Anime', emoji: '🎨' },
    { id: 'Nature', emoji: '🌿' },
    { id: 'Sci-Fi', emoji: '🚀' },
    { id: 'Fantasy', emoji: '🐉' },
    { id: 'Action', emoji: '💥' },
    { id: 'Lifestyle', emoji: '✨' },
];

// Removed static constants, using dynamic config instead

const Header = ({ credits }: { credits: number }) => (
    <View style={styles.header}>
        <View style={styles.logoContainer}>
            <Text style={styles.logo}>Phở</Text>
            <Text style={styles.logoAccent}>Video</Text>
        </View>
        <View style={styles.creditPill}>
            <Text style={styles.creditText}>⚡ {credits} pts</Text>
        </View>
    </View>
);


export default function HomeScreen() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState("kling");
    const [selectedRatio, setSelectedRatio] = useState("9:16");
    const [duration, setDuration] = useState(5);
    const [selectedStyleId, setSelectedStyleId] = useState("none");
    const [magicPrompt, setMagicPrompt] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [generationMode, setGenerationMode] = useState<'text' | 'image' | 'avatar'>('text');
    const [controlImage, setControlImage] = useState<string | null>(null);
    const [controlType, setControlType] = useState<'none' | 'pose' | 'depth'>('none');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { previewUrl, isLoading, generatePreview } = useInstantPreview();

    const settingsSheetRef = React.useRef<AdvancedSettingsSheetRef>(null);
    const paywallSheetRef = React.useRef<PaywallSheetRef>(null);

    // 🧠 Hooks mới từ React Query
    const { generate, isGenerating, status } = useGenerateVideo();
    const { data: config } = useAppConfig();

    // Simulated progress for ProcessingScreen (real progress would come from polling API)
    const [generationProgress, setGenerationProgress] = useState(0);

    // Simulate progress when generating
    useEffect(() => {
        if (isGenerating) {
            setGenerationProgress(0);
            const interval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 95) return prev;
                    return prev + Math.random() * 10;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (status === 'ready') {
            setGenerationProgress(100);
        }
    }, [isGenerating, status]);

    // Update defaults when config loads
    useEffect(() => {
        if (config?.models?.length > 0 && !selectedModel) {
            setSelectedModel(config.models[0].id);
        }
    }, [config, selectedModel]);

    // Lấy số credit hiện có
    const { data: creditData } = useQuery({
        queryKey: ["credits"],
        queryFn: () => api.getCredits(),
    });

    // Lấy trending videos với category filter
    const { data: trendingVideos, refetch: refetchTrending, isRefetching } = useQuery({
        queryKey: ["trending", selectedCategory],
        queryFn: () => api.getIdeasByCategory(selectedCategory),
    });

    const handleEnhancePrompt = async () => {
        if (!prompt.trim() || isEnhancing) return;
        setIsEnhancing(true);
        try {
            const { enhancedPrompt } = await api.enhancePrompt(prompt);
            setPrompt(enhancedPrompt);
        } catch (e) {
            Alert.alert("Error", "Could not enhance prompt");
        } finally {
            setIsEnhancing(false);
        }
    };

    const onRefresh = useCallback(async () => {
        await refetchTrending();
    }, [refetchTrending]);

    const handleSelectControlImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Library access is needed to select a reference image.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                setControlImage(result.assets[0].uri);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to select image");
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim() && !selectedImage && !controlImage) {
            Alert.alert("Missing Input", "Please enter a prompt or select a reference image.");
            return;
        }

        // Calculate cost based on duration
        const estimatedCost = duration === 5 ? 50 : duration === 10 ? 100 : 150;
        const currentCredits = creditData?.credits || 0;

        if (currentCredits < estimatedCost) {
            console.log("Insufficient credits, showing paywall");
            paywallSheetRef.current?.open();
            return;
        }

        generate({
            prompt: prompt.trim(),
            model: selectedModel,
            aspectRatio: selectedRatio as any,
            image: selectedImage || undefined,
            controlImage: controlType !== 'none' ? (controlImage || undefined) : undefined,
            controlType: controlType !== 'none' ? controlType : undefined,
            duration,
            style: selectedStyleId,
        }, {
            onSuccess: () => {
                setPrompt("");
                setSelectedImage(null);
                setControlImage(null);
                Alert.alert("Queued!", "Video is being developed.");
            },
            onError: (err) => {
                Alert.alert("Error", err.message);
            }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar style="light" />

            <View style={styles.headerContainer}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <Header credits={creditData?.credits || 0} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            generationMode === 'text' && styles.modeButtonActive
                        ]}
                        onPress={() => {
                            setGenerationMode('text');
                            setSelectedImage(null);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            generationMode === 'text' && styles.modeButtonTextActive
                        ]}>
                            Text-to-Video
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            generationMode === 'image' && styles.modeButtonActive
                        ]}
                        onPress={() => setGenerationMode('image')}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            generationMode === 'image' && styles.modeButtonTextActive
                        ]}>
                            Image-to-Video
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            generationMode === 'avatar' && styles.modeButtonActive
                        ]}
                        onPress={() => setGenerationMode('avatar')}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            generationMode === 'avatar' && styles.modeButtonTextActive
                        ]}>
                            My Avatar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Selection - Only show in avatar mode */}
                {generationMode === 'avatar' && (
                    <View style={styles.avatarSelectionContainer}>
                        <TouchableOpacity
                            style={styles.avatarCard}
                            onPress={() => router.push("/avatar")}
                        >
                            <View style={styles.avatarIconCircle}>
                                <User size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.avatarCardText}>Select Avatar</Text>
                        </TouchableOpacity>
                        <Text style={styles.avatarTip}>
                            Avatar will be used as the subject of the video.
                        </Text>
                    </View>
                )}

                {/* Image Picker - Only show in image mode */}
                {generationMode === 'image' && (
                    <ImagePickerComponent
                        selectedImage={selectedImage}
                        onImageSelected={setSelectedImage}
                    />
                )}

                {/* Instant Preview */}
                {(previewUrl || isLoading) && (
                    <Animated.View
                        layout={LinearTransition}
                        entering={FadeIn.duration(400)}
                        exiting={FadeOut.duration(300)}
                        style={styles.previewContainer}
                    >
                        {isLoading ? (
                            <View style={styles.skeletonContainer}>
                                <View style={styles.skeleton} />
                                <View style={styles.skeletonBadge}>
                                    <Loader2 size={12} color={COLORS.primary} />
                                    <Text style={styles.skeletonText}>Imagining...</Text>
                                </View>
                            </View>
                        ) : (
                            previewUrl && (
                                <View style={styles.previewImageWrapper}>
                                    <RNImage
                                        source={{ uri: previewUrl }}
                                        style={styles.previewImage}
                                        resizeMode="cover"
                                    />
                                    <BlurView intensity={20} style={styles.previewBadge}>
                                        <Text style={styles.previewBadgeText}>PREVIEW</Text>
                                    </BlurView>
                                </View>
                            )
                        )}
                    </Animated.View>
                )}

                <View style={styles.inputDock}>
                    <TextInput
                        placeholder={generationMode === 'text'
                            ? "Describe your dream video..."
                            : "Describe how to animate this image..."
                        }
                        placeholderTextColor={COLORS.textDim}
                        multiline
                        style={styles.textInput}
                        value={prompt}
                        onChangeText={(text) => {
                            setPrompt(text);
                            generatePreview(text);
                        }}
                    />
                    <TouchableOpacity
                        style={[styles.enhanceButton, (!prompt.trim() || isEnhancing) && styles.enhanceButtonDisabled]}
                        onPress={handleEnhancePrompt}
                        disabled={!prompt.trim() || isEnhancing}
                    >
                        {isEnhancing ? (
                            <Loader2 size={16} color={COLORS.primary} />
                        ) : (
                            <Sparkles size={16} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.settingsToggle}
                    onPress={() => {
                        console.log('Settings button pressed!');
                        settingsSheetRef.current?.open();
                    }}
                >
                    <Settings2 size={16} color={COLORS.textMuted} />
                    <Text style={styles.settingsText}>
                        {config?.models?.find((m: any) => m.id === selectedModel)?.name || selectedModel} • {config?.aspectRatios?.find((r: any) => r.id === selectedRatio)?.label || selectedRatio}
                    </Text>
                </TouchableOpacity>

                {/* Style Presets */}
                <View style={styles.stylePresetsSection}>
                    <Text style={styles.stylePresetsLabel}>Style</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.stylePresetsScroll}
                    >
                        {STYLE_PRESETS.map((style) => {
                            const isSelected = selectedStyleId === style.id;
                            return (
                                <TouchableOpacity
                                    key={style.id}
                                    style={[
                                        styles.stylePresetPill,
                                        isSelected && {
                                            backgroundColor: `${style.color}20`,
                                            borderColor: style.color
                                        }
                                    ]}
                                    onPress={() => setSelectedStyleId(style.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.stylePresetEmoji}>{style.emoji}</Text>
                                    <Text style={[
                                        styles.stylePresetText,
                                        isSelected && { color: style.color }
                                    ]}>
                                        {style.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <GenerateButton
                    onPress={handleGenerate}
                    status={isGenerating ? "loading" : (status === "ready" ? "success" : "idle")}
                />

                <View style={styles.feedSection}>
                    <View style={styles.feedHeader}>
                        <Text style={styles.feedTitle}>Trending Styles</Text>
                        <View style={styles.feedDivider} />
                    </View>

                    {/* Category Filter Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryChipsContainer}
                        style={styles.categoryChipsScroll}
                    >
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        isSelected && styles.categoryChipActive
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                                    <Text style={[
                                        styles.categoryChipText,
                                        isSelected && styles.categoryChipTextActive
                                    ]}>
                                        {cat.id}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.feedGrid}>
                        {trendingVideos?.map((item: any, index: number) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => {
                                    // Navigate to video detail
                                    router.push({
                                        pathname: '/video/[id]',
                                        params: {
                                            id: item.id,
                                            thumb: item.thumbnailUrl || '',
                                            prompt: item.prompt,
                                            videoUrl: item.videoUrl || '',
                                            model: item.model || 'kling',
                                            duration: item.duration || 5
                                        }
                                    });
                                }}
                                onLongPress={() => {
                                    // Copy prompt to input on long press
                                    console.log("Long pressed trending:", item.prompt);
                                    setPrompt(item.prompt);
                                }}
                                style={{ zIndex: 1 }}
                                activeOpacity={0.7}
                                delayLongPress={500}
                            >
                                <VideoCard
                                    item={{
                                        id: item.id,
                                        thumb: item.thumbnail || item.thumbnailUrl || "",
                                        prompt: item.prompt,
                                        duration: `${item.duration || 5}s`,
                                        model: item.model,
                                        videoUrl: item.videoUrl || "",
                                    }}
                                    index={index}
                                    isActive={index < 4} // First 4 videos autoplay
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Advanced Settings Bottom Sheet */}
            <AdvancedSettingsSheet
                ref={settingsSheetRef}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                aspectRatio={selectedRatio}
                onSelectAspectRatio={setSelectedRatio}
                duration={duration}
                onSelectDuration={setDuration}
                magicPrompt={magicPrompt}
                onToggleMagicPrompt={setMagicPrompt}
                controlImage={controlImage}
                onSelectControlImage={(img) => img === 'placeholder' ? handleSelectControlImage() : setControlImage(img)}
                controlType={controlType}
                onSelectControlType={setControlType}
                onApply={() => {
                    console.log('Settings applied:', { selectedModel, selectedRatio, duration, magicPrompt, controlType });
                    settingsSheetRef.current?.close();
                }}
            />

            {/* Paywall Bottom Sheet */}
            <PaywallSheet ref={paywallSheetRef} />

            {/* Processing Screen Overlay */}
            <ProcessingScreen
                visible={isGenerating}
                progress={generationProgress}
                estimatedTime={Math.max(0, Math.round(30 - (generationProgress / 100) * 30))}
                prompt={prompt}
                onMinimize={() => router.push('/(tabs)/gallery')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { paddingBottom: 110, paddingTop: 100, paddingHorizontal: 20 },
    headerContainer: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, overflow: 'hidden', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    logoContainer: { flexDirection: "row", alignItems: "center" },
    logo: { color: COLORS.text, fontSize: 28, fontWeight: "bold", letterSpacing: -1 },
    logoAccent: { color: COLORS.primary, fontSize: 28, fontWeight: "bold", letterSpacing: -1 },
    creditPill: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.05)" },
    creditText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },
    inputDock: { width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12, position: "relative" },
    textInput: { color: COLORS.text, fontSize: 16, lineHeight: 24, minHeight: 80, textAlignVertical: "top", paddingRight: 40 },
    enhanceButton: { position: "absolute", bottom: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(240, 66, 28, 0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(240, 66, 28, 0.2)" },
    enhanceButtonDisabled: { opacity: 0.5 },
    settingsToggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, marginBottom: 8 },
    settingsText: { color: COLORS.textMuted, fontSize: 13 },
    selectorContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
    selectorRow: { marginBottom: 12 },
    selectorLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
    pillGroup: { flexDirection: "row", gap: 8 },
    pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: COLORS.border },
    pillActive: { backgroundColor: "rgba(240, 66, 28, 0.15)", borderColor: COLORS.primary },
    pillText: { color: COLORS.textDim, fontSize: 13, fontWeight: "500" },
    pillTextActive: { color: COLORS.primary },
    feedSection: { marginBottom: 16 },
    feedHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    feedTitle: { color: COLORS.text, fontSize: 20, fontWeight: "bold", marginRight: 16 },
    feedDivider: { height: 1, flex: 1, backgroundColor: COLORS.border },
    feedGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    // Category Chips
    categoryChipsScroll: {
        marginBottom: 12,
        marginHorizontal: -20,
    },
    categoryChipsContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryChipActive: {
        backgroundColor: "rgba(240, 66, 28, 0.15)",
        borderColor: COLORS.primary,
    },
    categoryChipEmoji: {
        fontSize: 14,
    },
    categoryChipText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: "600",
    },
    categoryChipTextActive: {
        color: COLORS.primary,
    },
    // Mode Toggle Styles
    modeToggle: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
        gap: 4,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    modeButtonActive: {
        backgroundColor: "rgba(240, 66, 28, 0.15)",
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    modeButtonText: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: "600",
    },
    modeButtonTextActive: {
        color: COLORS.primary,
    },
    // Style Presets Styles
    stylePresetsSection: {
        marginBottom: 16,
    },
    stylePresetsLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 10,
    },
    stylePresetsScroll: {
        gap: 10,
    },
    stylePresetPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    stylePresetEmoji: {
        fontSize: 16,
    },
    stylePresetText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: "600",
    },
    // Instant Preview Styles
    previewContainer: {
        width: "100%",
        height: 160,
        marginBottom: 16,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    previewImageWrapper: {
        width: "100%",
        height: "100%",
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    previewBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    previewBadgeText: {
        color: COLORS.text,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    skeletonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.surface,
    },
    skeleton: {
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    skeletonBadge: {
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    skeletonText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: "500",
    },
    // Avatar Selection Styles
    avatarSelectionContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        gap: 12,
    },
    avatarCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(240, 66, 28, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarCardText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "bold",
    },
    avatarTip: {
        color: COLORS.textDim,
        fontSize: 12,
        textAlign: "center",
    },
});
