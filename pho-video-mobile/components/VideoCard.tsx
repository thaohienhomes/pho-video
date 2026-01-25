import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Loader2 } from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Watermark } from "./Watermark";

// Default blurhash for loading placeholder (dark gray)
const BLURHASH = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7telephones";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

interface VideoCardProps {
    item: {
        id: string;
        thumb: string;
        prompt: string;
        duration: string;
        model: string;
        videoUrl?: string; // Optional video URL for playback
    };
    index: number;
    isActive?: boolean; // For controlling playback when visible
}

export const VideoCard: React.FC<VideoCardProps> = ({ item, index, isActive = false }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const [isBuffering, setIsBuffering] = useState(true);
    const [showVideo, setShowVideo] = useState(false);

    // Extract video URL - handle both .mp4 URLs and image URLs
    const videoSource = item.videoUrl || (item.thumb?.endsWith('.mp4') ? item.thumb : null);

    // Create video player instance with expo-video
    const player = useVideoPlayer(videoSource || '', (playerInstance) => {
        playerInstance.loop = true;
        playerInstance.muted = true; // Muted for autoplay on scroll
        playerInstance.volume = 0;
    });

    // Control playback based on visibility
    useEffect(() => {
        if (isActive && videoSource && player) {
            player.play();
            setShowVideo(true);
        } else if (player) {
            player.pause();
        }
    }, [isActive, videoSource, player]);

    // Entrance animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 150,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                delay: index * 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Handle buffering state
    useEffect(() => {
        if (player) {
            const subscription = player.addListener('statusChange', (status) => {
                setIsBuffering(status.status === 'loading');
            });
            return () => subscription?.remove();
        }
    }, [player]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={styles.card}>
                {/* Thumbnail Image (fallback/loading state) with blurhash */}
                <Image
                    source={{ uri: item.thumb }}
                    style={[styles.image, showVideo && !isBuffering && styles.imageHidden]}
                    contentFit="cover"
                    placeholder={BLURHASH}
                    transition={300}
                    alt={`Thumbnail for ${item.prompt}`}
                />

                {/* Video Player (TikTok style) */}
                {videoSource && showVideo && (
                    <VideoView
                        player={player}
                        style={styles.videoPlayer}
                        nativeControls={false}
                        contentFit="cover"
                    />
                )}

                {/* Buffering Indicator */}
                {isBuffering && isActive && videoSource && (
                    <View style={styles.bufferingOverlay}>
                        <Loader2 size={24} color="#F0421C" />
                    </View>
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                    locations={[0, 0.6, 1]}
                    style={styles.overlay}
                >
                    <Watermark style={styles.watermark} />
                    <View style={styles.durationBadge}>
                        <Play size={8} color="#F0421C" fill="#F0421C" />
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>

                    <Text numberOfLines={2} style={styles.promptText}>
                        {item.prompt}
                    </Text>
                </LinearGradient>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    card: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH * 1.6,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    image: {
        width: "100%",
        height: "100%",
        backgroundColor: "#262626",
        position: "absolute",
        top: 0,
        left: 0,
    },
    imageHidden: {
        opacity: 0,
    },
    videoPlayer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
    },
    bufferingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "50%",
        justifyContent: "flex-end",
        padding: 12,
    },
    durationBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    durationText: {
        color: "white",
        fontSize: 10,
        marginLeft: 4,
        fontWeight: "bold",
    },
    promptText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
        lineHeight: 16,
    },
    watermark: {
        top: 10,
        right: 10,
        transform: [{ scale: 0.7 }],
        opacity: 0.6,
    },
});
