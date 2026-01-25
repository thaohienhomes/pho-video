import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Search, TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api, Idea } from "../../lib/api";

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
};

// Categories with colorful gradients
const CATEGORIES = [
    { id: 'E-commerce', emoji: '🛒', gradient: ['#F0421C', '#FF6B4A'] as const },
    { id: 'Cinematic', emoji: '🎬', gradient: ['#6366F1', '#818CF8'] as const },
    { id: 'Anime', emoji: '🎨', gradient: ['#EC4899', '#F472B6'] as const },
    { id: 'Nature', emoji: '🌿', gradient: ['#10B981', '#34D399'] as const },
    { id: 'Sci-Fi', emoji: '🚀', gradient: ['#3B82F6', '#60A5FA'] as const },
    { id: 'Fantasy', emoji: '🐉', gradient: ['#8B5CF6', '#A78BFA'] as const },
    { id: 'Action', emoji: '💥', gradient: ['#EF4444', '#F87171'] as const },
    { id: 'Lifestyle', emoji: '✨', gradient: ['#F59E0B', '#FBBF24'] as const },
    { id: 'Food', emoji: '🍜', gradient: ['#F97316', '#FB923C'] as const },
    { id: 'Travel', emoji: '✈️', gradient: ['#14B8A6', '#2DD4BF'] as const },
];

const CategoryCard = ({
    category,
    onPress
}: {
    category: typeof CATEGORIES[0];
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.8}
        onPress={onPress}
    >
        <LinearGradient
            colors={category.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryGradient}
        >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={styles.categoryName}>{category.id}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const IdeaCard = ({
    item,
    onPress,
}: {
    item: Partial<Idea>;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={styles.ideaCard}
        activeOpacity={0.9}
        onPress={onPress}
    >
        <Image
            source={{ uri: item.thumbnailUrl || item.thumbnail }}
            style={styles.ideaThumbnail}
            resizeMode="cover"
            alt={`Thumbnail for ${item.prompt || item.title}`}
        />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.ideaOverlay}
        >
            <View style={styles.ideaBadge}>
                <Play size={8} color={COLORS.primary} fill={COLORS.primary} />
                <Text style={styles.ideaDuration}>5s</Text>
            </View>
            <Text numberOfLines={2} style={styles.ideaPrompt}>
                {item.prompt || item.title}
            </Text>
        </LinearGradient>
    </TouchableOpacity>
);

export default function ExploreScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch ideas for selected category
    const { data: ideas, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["explore", selectedCategory],
        queryFn: () => api.getIdeasByCategory(selectedCategory || "All"),
        enabled: !!selectedCategory,
    });

    const handleCategoryPress = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleIdeaPress = (idea: Partial<Idea>) => {
        router.push({
            pathname: '/video/[id]',
            params: {
                id: idea.id || '',
                thumb: idea.thumbnailUrl || idea.thumbnail || '',
                prompt: idea.prompt || '',
                videoUrl: idea.videoUrl || '',
                model: idea.model || idea.modelId || 'kling',
                duration: 5,
            }
        });
    };

    const handleUsePrompt = (prompt: string) => {
        router.push({
            pathname: '/(tabs)',
            params: { prompt }
        });
    };

    const renderHeader = () => (
        <>
            {/* Title */}
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Search size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Categories Grid */}
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
                {CATEGORIES.map(cat => (
                    <CategoryCard
                        key={cat.id}
                        category={cat}
                        onPress={() => handleCategoryPress(cat.id)}
                    />
                ))}
            </View>

            {/* Trending Section */}
            {selectedCategory && (
                <View style={styles.trendingHeader}>
                    <TrendingUp size={18} color={COLORS.primary} />
                    <Text style={styles.trendingTitle}>{selectedCategory}</Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                        <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar style="light" />

            {selectedCategory && isLoading ? (
                <View style={styles.loadingContainer}>
                    {renderHeader()}
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                </View>
            ) : (
                <FlatList
                    data={ideas || []}
                    keyExtractor={(item) => item.id || ''}
                    numColumns={2}
                    columnWrapperStyle={ideas?.length ? styles.row : undefined}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        selectedCategory ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    No videos found in {selectedCategory}
                                </Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <IdeaCard
                            item={item}
                            onPress={() => handleIdeaPress(item)}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 24,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    categoriesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    categoryCard: {
        width: (width - 56) / 2,
        height: 80,
        borderRadius: 16,
        overflow: "hidden",
    },
    categoryGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    categoryEmoji: {
        fontSize: 28,
    },
    categoryName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "bold",
    },
    trendingHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    trendingTitle: {
        flex: 1,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "bold",
    },
    clearButton: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    listContent: {
        paddingBottom: 100,
    },
    row: {
        paddingHorizontal: 16,
        justifyContent: "space-between",
    },
    ideaCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.4,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    ideaThumbnail: {
        width: "100%",
        height: "100%",
    },
    ideaOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        paddingTop: 40,
    },
    ideaBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
        alignSelf: "flex-start",
        marginBottom: 6,
    },
    ideaDuration: {
        color: COLORS.text,
        fontSize: 10,
        fontWeight: "bold",
    },
    ideaPrompt: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
    },
    emptyState: {
        alignItems: "center",
        paddingTop: 40,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
});
