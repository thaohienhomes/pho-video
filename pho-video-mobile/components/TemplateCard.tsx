import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Sparkles, Clock, Coins, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2; // 2 columns with padding

interface Template {
    id: string;
    title: string;
    prompt: string;
    category: string;
    creditCost: number;
    duration: string;
    featured?: boolean;
    icon?: string;
}

interface TemplateCardProps {
    template: Template;
    onPress?: () => void;
    onLongPress?: () => void;
}

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    surface: '#171717',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    border: 'rgba(255,255,255,0.1)',
};

const CATEGORY_ICONS: Record<string, string> = {
    cinematic: '🎬',
    anime: '✨',
    nature: '🌿',
    product: '📦',
    abstract: '🎨',
    portrait: '👤',
    scifi: '🚀',
    fantasy: '🐉',
};

export function TemplateCard({ template, onPress, onLongPress }: TemplateCardProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress?.();
    };

    const categoryIcon = CATEGORY_ICONS[template.category] || '🎬';

    return (
        <Pressable
            style={styles.card}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
        >
            {/* Thumbnail Area */}
            <View style={styles.thumbnail}>
                <Text style={styles.thumbnailIcon}>{categoryIcon}</Text>

                {/* Featured Badge */}
                {template.featured && (
                    <View style={styles.featuredBadge}>
                        <Star size={10} color="white" fill="white" />
                        <Text style={styles.featuredText}>Featured</Text>
                    </View>
                )}

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                    <Clock size={10} color="white" />
                    <Text style={styles.durationText}>{template.duration}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {template.title}
                </Text>

                {/* Meta */}
                <View style={styles.meta}>
                    <View style={styles.categoryPill}>
                        <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                        <Text style={styles.categoryLabel}>
                            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </Text>
                    </View>

                    <View style={styles.creditBadge}>
                        <Coins size={12} color={COLORS.primary} />
                        <Text style={styles.creditText}>{template.creditCost}</Text>
                    </View>
                </View>
            </View>

            {/* Use Button */}
            <Pressable style={styles.useButton} onPress={handlePress}>
                <Sparkles size={14} color="white" />
                <Text style={styles.useButtonText}>Use</Text>
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    thumbnail: {
        height: 100,
        backgroundColor: 'rgba(240,66,28,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    thumbnailIcon: {
        fontSize: 36,
    },
    featuredBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },
    featuredText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 6,
    },
    durationText: {
        color: 'white',
        fontSize: 10,
    },
    content: {
        padding: 12,
    },
    title: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    categoryIcon: {
        fontSize: 12,
    },
    categoryLabel: {
        color: COLORS.textMuted,
        fontSize: 11,
    },
    creditBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    creditText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    useButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 10,
    },
    useButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },
});
