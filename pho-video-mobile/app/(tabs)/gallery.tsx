import React, { useState, useCallback, useMemo, memo } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Heart, Trash2, Share2, Search, X, ChevronDown, Clock, Star, Film } from "lucide-react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { api, Video } from "../../lib/api";
import { useVideoFeed } from "../../lib/hooks";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    textDim: "#525252",
    border: "rgba(255,255,255,0.1)",
    warning: "#F59E0B",
    danger: "#EF4444",
};

const SORT_OPTIONS = [
    { id: "newest", label: "Newest", icon: Clock },
    { id: "oldest", label: "Oldest", icon: Clock },
    { id: "longest", label: "Longest", icon: Film },
    { id: "favorites", label: "Favorites", icon: Star },
];

// Memoized VideoCard component for FlashList performance
const VideoCard = memo(({
    item,
    onDelete,
    onShare,
    onToggleFavorite,
    onPress,
}: {
    item: Video & { isFavorite?: boolean };
    onDelete: (id: string) => void;
    onShare: (item: Video) => void;
    onToggleFavorite: (id: string) => void;
    onPress: (item: Video) => void;
}) => {
    const [showActions, setShowActions] = useState(false);
    const isProcessing = item.status === "processing" || item.status === "pending";

    return (
        <View style={styles.cardContainer}>
            <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onLongPress={() => setShowActions(true)}
                onPress={() => {
                    if (showActions) setShowActions(false);
                    else if (!isProcessing) onPress(item);
                }}
            >
                {isProcessing ? (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.processingText}>Developing...</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: item.thumbnailUrl }}
                        style={styles.cardImage}
                        contentFit="cover"
                        transition={200}
                        alt={item.prompt || 'Video thumbnail'}
                    />
                )}

                {!isProcessing && (
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                        style={styles.cardOverlay}
                    >
                        <View style={styles.cardBadgeRow}>
                            <View style={styles.durationBadge}>
                                <Play size={8} color={COLORS.primary} fill={COLORS.primary} />
                                <Text style={styles.durationText}>{item.duration}s</Text>
                            </View>
                            <Pressable onPress={() => onToggleFavorite(item.id)} hitSlop={8}>
                                <Heart
                                    size={16}
                                    color={item.isFavorite ? COLORS.primary : COLORS.textMuted}
                                    fill={item.isFavorite ? COLORS.primary : "transparent"}
                                />
                            </Pressable>
                        </View>
                        <Text numberOfLines={1} style={styles.cardPrompt}>{item.prompt}</Text>
                    </LinearGradient>
                )}

                {showActions && !isProcessing && (
                    <View style={styles.actionsOverlay}>
                        <Pressable style={styles.actionButton} onPress={() => onShare(item)}>
                            <Share2 size={20} color={COLORS.text} />
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.actionButtonDanger]}
                            onPress={() => onDelete(item.id)}
                        >
                            <Trash2 size={20} color={COLORS.danger} />
                        </Pressable>
                    </View>
                )}
            </Pressable>
        </View>
    );
});

VideoCard.displayName = 'VideoCard';

export default function GalleryScreen() {
    const [activeFilter, setActiveFilter] = useState<"all" | "processing" | "favorites">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const router = useRouter();

    const { data: videos, isLoading, refetch, isRefetching } = useVideoFeed(activeFilter);

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handlePress = (item: Video) => {
        router.push({
            pathname: "/video/[id]",
            params: {
                id: item.id,
                thumb: item.thumbnailUrl || "",
                prompt: item.prompt,
                url: item.videoUrl || ""
            }
        });
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await api.deleteVideo(id);
                        refetch();
                    } catch (e) {
                        Alert.alert("Error", "Could not delete video");
                    }
                }
            }
        ]);
    };

    const handleShare = async (item: Video) => {
        if (item.videoUrl && await Sharing.isAvailableAsync()) {
            try {
                const fileName = `video_${item.id}.mp4`;
                // @ts-ignore - cacheDirectory exists but types might be mismatched
                const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;

                if (!cacheDir) {
                    Alert.alert("Error", "Could not access storage");
                    return;
                }

                const fileUri = cacheDir + fileName;
                await FileSystem.downloadAsync(item.videoUrl, fileUri);
                await Sharing.shareAsync(fileUri);
            } catch (e) {
                Alert.alert("Error", "Could not share video");
            }
        }
    };

    // Filter and sort logic
    const filteredAndSortedVideos = useMemo(() => {
        let result = videos || [];

        // Apply status filter
        if (activeFilter === "processing") {
            result = result.filter((v: any) => v.status === "processing" || v.status === "pending");
        } else if (activeFilter === "favorites") {
            result = result.filter((v: any) => v.isFavorite);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((v: any) =>
                v.prompt?.toLowerCase().includes(query) ||
                v.model?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        result = [...result].sort((a: any, b: any) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case "oldest":
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                case "longest":
                    return (b.duration || 0) - (a.duration || 0);
                case "favorites":
                    return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [videos, activeFilter, searchQuery, sortBy]);

    const currentSort = SORT_OPTIONS.find(s => s.id === sortBy);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar style="light" />

            {/* Header with Search */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>My Creations</Text>
                    <View style={styles.headerActions}>
                        <Pressable
                            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
                            onPress={() => setShowSearch(!showSearch)}
                        >
                            {showSearch ? (
                                <X size={20} color={COLORS.text} />
                            ) : (
                                <Search size={20} color={COLORS.textMuted} />
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Search Bar */}
                {showSearch && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={styles.searchContainer}
                    >
                        <Search size={16} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by prompt..."
                            placeholderTextColor={COLORS.textDim}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                                <X size={16} color={COLORS.textMuted} />
                            </Pressable>
                        )}
                    </Animated.View>
                )}
            </View>

            {/* Filter Tabs + Sort */}
            <View style={styles.filterRow}>
                <View style={styles.filterContainer}>
                    {(["all", "processing", "favorites"] as const).map(f => (
                        <Pressable
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            style={({ pressed }) => [styles.filterTab, activeFilter === f && styles.filterTabActive, pressed && { opacity: 0.8 }]}
                        >
                            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Sort Dropdown */}
                <Pressable
                    style={({ pressed }) => [styles.sortButton, pressed && { opacity: 0.7 }]}
                    onPress={() => setShowSortMenu(!showSortMenu)}
                >
                    {currentSort && <currentSort.icon size={14} color={COLORS.textMuted} />}
                    <Text style={styles.sortButtonText}>{currentSort?.label}</Text>
                    <ChevronDown size={14} color={COLORS.textMuted} />
                </Pressable>
            </View>

            {/* Sort Menu Dropdown */}
            {showSortMenu && (
                <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(150)}
                    style={styles.sortMenu}
                >
                    {SORT_OPTIONS.map(option => (
                        <Pressable
                            key={option.id}
                            style={({ pressed }) => [
                                styles.sortMenuItem,
                                sortBy === option.id && styles.sortMenuItemActive,
                                pressed && { opacity: 0.7 }
                            ]}
                            onPress={() => {
                                setSortBy(option.id);
                                setShowSortMenu(false);
                            }}
                        >
                            <option.icon size={16} color={sortBy === option.id ? COLORS.primary : COLORS.textMuted} />
                            <Text style={[
                                styles.sortMenuText,
                                sortBy === option.id && styles.sortMenuTextActive
                            ]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </Animated.View>
            )}

            {/* Results count */}
            {searchQuery && (
                <Text style={styles.resultsCount}>
                    {filteredAndSortedVideos.length} result{filteredAndSortedVideos.length !== 1 ? 's' : ''} found
                </Text>
            )}

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            ) : (
                <FlashList
                    data={filteredAndSortedVideos}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Film size={48} color={COLORS.textDim} />
                            <Text style={styles.emptyTitle}>No videos yet</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? "No videos match your search" : "Create your first video to see it here"}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <VideoCard
                            item={item}
                            onDelete={handleDelete}
                            onShare={handleShare}
                            onToggleFavorite={() => { }}
                            onPress={handlePress}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { marginTop: 8, marginBottom: 16 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { color: COLORS.text, fontSize: 28, fontWeight: "bold" },
    headerActions: { flexDirection: "row", gap: 8 },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    filterContainer: { flexDirection: "row", gap: 8 },
    filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
    filterTabActive: { borderColor: COLORS.primary, backgroundColor: "rgba(240,66,28,0.1)" },
    filterText: { color: COLORS.textDim, fontSize: 13, fontWeight: "500" },
    filterTextActive: { color: COLORS.primary },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortButtonText: { color: COLORS.textMuted, fontSize: 12 },
    sortMenu: {
        position: "absolute",
        top: 145,
        right: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        zIndex: 100,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    sortMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    sortMenuItemActive: {
        backgroundColor: "rgba(240,66,28,0.1)",
    },
    sortMenuText: { color: COLORS.textMuted, fontSize: 14 },
    sortMenuTextActive: { color: COLORS.primary },
    resultsCount: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 12,
    },
    listContent: { paddingBottom: 100 },
    row: { justifyContent: "space-between" },
    cardContainer: { marginBottom: 16 },
    card: { width: CARD_WIDTH, height: CARD_WIDTH * 1.4, backgroundColor: COLORS.surface, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
    cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    cardImage: { width: "100%", height: "100%" },
    cardOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40 },
    cardBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    durationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
    durationText: { color: COLORS.text, fontSize: 10, fontWeight: "bold" },
    cardPrompt: { color: COLORS.text, fontSize: 13, fontWeight: "600", marginBottom: 2 },
    processingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.surface },
    processingText: { color: COLORS.textMuted, fontSize: 12, marginTop: 12 },
    actionsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.8)", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20 },
    actionButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.surface, justifyContent: "center", alignItems: "center" },
    actionButtonDanger: { backgroundColor: "rgba(239,68,68,0.2)" },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
        gap: 12,
    },
    emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "600" },
    emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: "center" },
});
