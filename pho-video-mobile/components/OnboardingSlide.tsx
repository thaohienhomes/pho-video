import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    imageUrl?: string;
    badges?: string[];
}

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    card: '#171717',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
};

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
    title,
    description,
    icon,
    imageUrl,
    badges,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Hero Area */}
                <View style={styles.heroArea}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : icon ? (
                        <View style={styles.iconContainer}>
                            {icon}
                        </View>
                    ) : null}
                </View>

                {/* Badges (for model logos slide) */}
                {badges && badges.length > 0 && (
                    <View style={styles.badgesContainer}>
                        {badges.map((badge, index) => (
                            <View key={index} style={styles.badge}>
                                <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Content */}
                <View style={styles.contentArea}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
    },
    heroArea: {
        width: '100%',
        aspectRatio: 16 / 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    badge: {
        backgroundColor: 'rgba(240, 66, 28, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(240, 66, 28, 0.3)',
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    contentArea: {
        alignItems: 'center',
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
});
