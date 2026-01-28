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

export const VideoCard: React.FC<VideoCardProps> = React.memo(({ item, index, isActive = false }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const [isBuffering, setIsBuffering] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);

    // Extract video URL - handle both .mp4 URLs and image URLs
    const videoSource = item.videoUrl || (item.thumb?.toLowerCase().endsWith('.mp4') ? item.thumb : null);

    // OPTIMIZATION: Only create video player when isActive AND we have a video source
    // This prevents all cards from creating expensive player instances
    const shouldCreatePlayer = isActive && !!videoSource;

    // Create video player instance with expo-video - ONLY when needed
    const player = useVideoPlayer(shouldCreatePlayer ? videoSource : '', (playerInstance) => {
        playerInstance.loop = true;
        playerInstance.muted = true;
        playerInstance.volume = 0;
        // Don't auto-play in callback, let useEffect handle it
    });

    // Control playback based on visibility
    useEffect(() => {
        if (!player || !shouldCreatePlayer) {
            setShowVideo(false);
            setPlayerReady(false);
            return;
        }

        if (isActive && videoSource) {
            // Small delay to ensure player is ready
            const timer = setTimeout(() => {
                player.play();
                setShowVideo(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            player.pause();
            setShowVideo(false);
        }
    }, [isActive, videoSource, player, shouldCreatePlayer]);

    // Entrance animation - use shorter delay for better perceived performance
    useEffect(() => {
        const delay = Math.min(index * 100, 400); // Cap max delay at 400ms
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, index, translateY]);

    // Handle buffering state - only when player exists
    useEffect(() => {
        if (!player || !shouldCreatePlayer) return;

        const subscription = player.addListener('statusChange', (status) => {
            setIsBuffering(status.status === 'loading');
            if (status.status === 'readyToPlay') {
                setPlayerReady(true);
            }
        });
        return () => subscription?.remove();
    }, [player, shouldCreatePlayer]);

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
                {/* Thumbnail Image (always visible until video is ready) */}
                <Image
                    source={{ uri: item.thumb }}
                    style={[styles.image, (showVideo && playerReady && !isBuffering) && styles.imageHidden]}
                    contentFit="cover"
                    placeholder={BLURHASH}
                    transition={200}
                    cachePolicy="memory-disk"
                    alt={item.prompt.substring(0, 50)}
                />

                {/* Video Player - only render when active and player exists */}
                {shouldCreatePlayer && showVideo && (
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
});

// Add display name for React DevTools
VideoCard.displayName = 'VideoCard';

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
