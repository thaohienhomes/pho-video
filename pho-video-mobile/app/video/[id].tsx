import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Share,
    Alert,
    FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import {
    X,
    Share2,
    Download,
    Heart,
    Copy,
    RotateCcw,
    Play,
    Pause,
    ChevronDown,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { Watermark } from "../../components/Watermark";
import { api } from "../../lib/api";

const { width, height } = Dimensions.get("window");

const COLORS = {
    primary: '#F0421C',
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    overlay: 'rgba(0,0,0,0.4)',
    glass: 'rgba(255,255,255,0.1)',
};

interface VideoItem {
    id: string;
    thumb: string;
    prompt: string;
    videoUrl?: string;
    model?: string;
    duration?: number;
}

// Single Video Card Component
const VideoCard = ({
    item,
    isActive,
    onClose,
    onRemix,
}: {
    item: VideoItem;
    isActive: boolean;
    onClose: () => void;
    onRemix: (prompt: string) => void;
}) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const lastTap = useRef(0);
    const heartScale = useSharedValue(0);

    // expo-video player instance
    const player = useVideoPlayer(item.videoUrl || '', (playerInstance) => {
        playerInstance.loop = true;
        playerInstance.muted = false;
    });

    // Control playback based on visibility
    useEffect(() => {
        if (isActive && item.videoUrl && player) {
            player.play();
        } else if (player) {
            player.pause();
        }
    }, [isActive, item.videoUrl, player]);

    // Double-tap to Like handler
    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            // Double tap detected!
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsLiked(true);
            setShowHeartAnimation(true);
            heartScale.value = withSpring(1.2, { damping: 10 }, () => {
                heartScale.value = withSpring(0, { damping: 15 });
            });
            setTimeout(() => setShowHeartAnimation(false), 800);
        } else {
            // Single tap - toggle controls
            setShowControls(!showControls);
        }
        lastTap.current = now;
    };

    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
        opacity: heartScale.value > 0 ? 1 : 0,
    }));

    const handleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLiked(!isLiked);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this AI video I created with Phở Video!\n\n"${item.prompt}"`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleCopyPrompt = async () => {
        await Clipboard.setStringAsync(item.prompt);
        Alert.alert('Copied!', 'Prompt copied to clipboard');
    };

    const handleDownload = () => {
        Alert.alert('Download', 'Download functionality coming soon!');
    };

    const togglePlayPause = () => {
        if (player) {
            if (isPlaying) {
                player.pause();
            } else {
                player.play();
            }
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={styles.videoCard}>
            {/* Video/Image */}
            <TouchableOpacity
                style={styles.videoContainer}
                activeOpacity={1}
                onPress={handleDoubleTap}
            >
                {/* Thumbnail fallback while loading */}
                <Animated.Image
                    source={{ uri: item.thumb || item.videoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                />

                {/* Video Player with expo-video */}
                {item.videoUrl && (
                    <VideoView
                        player={player}
                        style={styles.video}
                        nativeControls={false}
                        contentFit="contain"
                    />
                )}

                {/* Watermark Overlay */}
                <Watermark style={styles.watermark} />

                {/* Double-tap Heart Animation */}
                {showHeartAnimation && (
                    <Animated.View style={[styles.heartAnimation, heartAnimatedStyle]}>
                        <Heart size={100} color={COLORS.primary} fill={COLORS.primary} />
                    </Animated.View>
                )}
            </TouchableOpacity>

            {/* Overlay UI */}
            {showControls && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.overlay}
                >
                    {/* Close Button */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                        >
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Right Sidebar */}
                    <View style={styles.rightSidebar}>
                        <TouchableOpacity style={styles.sidebarButton} onPress={handleLike}>
                            <Heart
                                size={28}
                                color={isLiked ? COLORS.primary : "white"}
                                fill={isLiked ? COLORS.primary : "transparent"}
                            />
                            <Text style={styles.sidebarLabel}>Like</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sidebarButton}
                            onPress={() => onRemix(item.prompt)}
                        >
                            <RotateCcw size={26} color="white" />
                            <Text style={styles.sidebarLabel}>Remix</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sidebarButton} onPress={handleCopyPrompt}>
                            <Copy size={24} color="white" />
                            <Text style={styles.sidebarLabel}>Copy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sidebarButton} onPress={handleShare}>
                            <Share2 size={24} color="white" />
                            <Text style={styles.sidebarLabel}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sidebarButton} onPress={handleDownload}>
                            <Download size={24} color="white" />
                            <Text style={styles.sidebarLabel}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Panel */}
                    <View style={styles.bottomPanel}>
                        {item.videoUrl && (
                            <TouchableOpacity
                                style={styles.playPauseButton}
                                onPress={togglePlayPause}
                            >
                                {isPlaying ? (
                                    <Pause size={20} color="white" />
                                ) : (
                                    <Play size={20} color="white" fill="white" />
                                )}
                            </TouchableOpacity>
                        )}

                        <Text style={styles.promptText} numberOfLines={3}>
                            {item.prompt}
                        </Text>

                        <View style={styles.metaRow}>
                            {item.model && (
                                <View style={styles.metaBadge}>
                                    <Text style={styles.metaBadgeText}>{item.model}</Text>
                                </View>
                            )}
                            {item.duration && (
                                <Text style={styles.metaText}>{item.duration}s</Text>
                            )}
                        </View>

                        {/* Swipe hint */}
                        <View style={styles.swipeHint}>
                            <ChevronDown size={16} color={COLORS.textSecondary} />
                            <Text style={styles.swipeHintText}>Swipe for more</Text>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

export default function VideoDetailScreen() {
    const { id, thumb, prompt, videoUrl, model, duration } = useLocalSearchParams();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch trending videos for swipe navigation
    const { data: trendingVideos } = useQuery({
        queryKey: ['trending-videos'],
        queryFn: async () => {
            const res = await api.getTrendingVideos();
            return res || [];
        },
    });

    // Build video list: current video first, then trending
    const initialVideo: VideoItem = {
        id: id as string,
        thumb: thumb as string,
        prompt: prompt as string,
        videoUrl: videoUrl as string,
        model: model as string,
        duration: Number(duration) || 5,
    };

    const videoList: VideoItem[] = [
        initialVideo,
        ...(trendingVideos || [])
            .filter((v: any) => v.id !== id)
            .map((v: any) => ({
                id: v.id,
                thumb: v.thumbnailUrl || '',
                prompt: v.prompt,
                videoUrl: v.videoUrl || '',
                model: v.model || 'kling',
                duration: v.duration || 5,
            }))
    ];

    const goBack = () => router.back();

    const handleRemix = (promptText: string) => {
        router.replace({
            pathname: '/(tabs)',
            params: { prompt: promptText }
        });
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }, []);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50
    };

    const renderItem = ({ item, index }: { item: VideoItem; index: number }) => (
        <VideoCard
            item={item}
            isActive={index === currentIndex}
            onClose={goBack}
            onRemix={handleRemix}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <FlatList
                ref={flatListRef}
                data={videoList}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    videoCard: {
        width: width,
        height: height,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    video: {
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.glass,
        justifyContent: "center",
        alignItems: "center",
    },
    rightSidebar: {
        position: 'absolute',
        right: 12,
        bottom: 220,
        alignItems: 'center',
        gap: 20,
    },
    sidebarButton: {
        alignItems: 'center',
        gap: 4,
    },
    sidebarLabel: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: '500',
    },
    bottomPanel: {
        backgroundColor: COLORS.overlay,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 50,
        gap: 12,
    },
    playPauseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 20,
        top: -50,
    },
    promptText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metaBadge: {
        backgroundColor: 'rgba(240, 66, 28, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(240, 66, 28, 0.3)',
    },
    metaBadgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    swipeHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 8,
    },
    swipeHintText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    watermark: {
        top: 60,
        right: 20,
    },
    videoPlayOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        gap: 12,
    },
    videoHintText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
    heartAnimation: {
        position: 'absolute',
        alignSelf: 'center',
        top: '40%',
    },
});
