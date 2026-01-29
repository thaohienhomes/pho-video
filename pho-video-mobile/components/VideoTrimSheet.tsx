import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Scissors, Clock, RotateCcw, Check, Play, Pause } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

interface VideoTrimSheetProps {
    videoUrl: string;
    duration: number;
    onTrimApply?: (startTime: number, endTime: number) => void;
}

export interface VideoTrimSheetRef {
    open: () => void;
    close: () => void;
}

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    sheetBg: '#171717',
    surface: '#262626',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    border: 'rgba(255,255,255,0.1)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 48;
const HANDLE_WIDTH = 16;

export const VideoTrimSheet = forwardRef<VideoTrimSheetRef, VideoTrimSheetProps>(
    ({ videoUrl, duration, onTrimApply }, ref) => {
        const bottomSheetModalRef = useRef<BottomSheetModal>(null);
        const videoRef = useRef<Video>(null);
        const snapPoints = useMemo(() => ['75%'], []);

        const [isPlaying, setIsPlaying] = useState(false);
        const [currentTime, setCurrentTime] = useState(0);

        // Trim values in pixels
        const trimStartX = useSharedValue(0);
        const trimEndX = useSharedValue(TIMELINE_WIDTH - HANDLE_WIDTH);

        // Convert pixels to time
        const pixelsToTime = (px: number) => (px / TIMELINE_WIDTH) * duration;
        const timeToPixels = (time: number) => (time / duration) * TIMELINE_WIDTH;

        useImperativeHandle(ref, () => ({
            open: () => bottomSheetModalRef.current?.present(),
            close: () => bottomSheetModalRef.current?.dismiss(),
        }));

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                    pressBehavior="close"
                />
            ),
            []
        );

        // Gesture for start handle
        const startHandleGesture = Gesture.Pan()
            .onUpdate((e) => {
                const newX = Math.max(0, Math.min(trimEndX.value - HANDLE_WIDTH - 20, trimStartX.value + e.translationX));
                trimStartX.value = newX;
            });

        // Gesture for end handle
        const endHandleGesture = Gesture.Pan()
            .onUpdate((e) => {
                const newX = Math.max(trimStartX.value + HANDLE_WIDTH + 20, Math.min(TIMELINE_WIDTH - HANDLE_WIDTH, trimEndX.value + e.translationX));
                trimEndX.value = newX;
            });

        // Animated styles
        const startHandleStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: trimStartX.value }],
        }));

        const endHandleStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: trimEndX.value }],
        }));

        const leftOverlayStyle = useAnimatedStyle(() => ({
            width: trimStartX.value,
        }));

        const rightOverlayStyle = useAnimatedStyle(() => ({
            width: TIMELINE_WIDTH - trimEndX.value - HANDLE_WIDTH,
        }));

        const selectionStyle = useAnimatedStyle(() => ({
            left: trimStartX.value + HANDLE_WIDTH,
            right: TIMELINE_WIDTH - trimEndX.value,
        }));

        const togglePlay = async () => {
            if (!videoRef.current) return;
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        };

        const handleReset = () => {
            trimStartX.value = withSpring(0);
            trimEndX.value = withSpring(TIMELINE_WIDTH - HANDLE_WIDTH);
        };

        const handleApply = () => {
            const startTime = pixelsToTime(trimStartX.value);
            const endTime = pixelsToTime(trimEndX.value + HANDLE_WIDTH);
            onTrimApply?.(startTime, endTime);
            bottomSheetModalRef.current?.dismiss();
        };

        const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Calculate trimmed duration
        const trimmedDuration = pixelsToTime(trimEndX.value + HANDLE_WIDTH) - pixelsToTime(trimStartX.value);

        return (
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetView style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Scissors size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Trim Video</Text>
                            <Text style={styles.headerSubtitle}>Drag handles to select range</Text>
                        </View>
                    </View>

                    {/* Video Preview */}
                    <View style={styles.videoContainer}>
                        <Video
                            ref={videoRef}
                            source={{ uri: videoUrl }}
                            style={styles.video}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={false}
                            isLooping
                            onPlaybackStatusUpdate={(status) => {
                                if (status.isLoaded) {
                                    setCurrentTime(status.positionMillis / 1000);
                                }
                            }}
                        />

                        {/* Play Button Overlay */}
                        <Pressable style={styles.playOverlay} onPress={togglePlay}>
                            <View style={styles.playButton}>
                                {isPlaying ? (
                                    <Pause size={24} color="white" />
                                ) : (
                                    <Play size={24} color="white" style={{ marginLeft: 3 }} />
                                )}
                            </View>
                        </Pressable>
                    </View>

                    {/* Timeline */}
                    <GestureHandlerRootView style={styles.timelineContainer}>
                        {/* Background Track */}
                        <View style={styles.timelineTrack}>
                            {/* Selection Area */}
                            <Animated.View style={[styles.selection, selectionStyle]} />

                            {/* Left Overlay (dimmed) */}
                            <Animated.View style={[styles.overlay, styles.leftOverlay, leftOverlayStyle]} />

                            {/* Right Overlay (dimmed) */}
                            <Animated.View style={[styles.overlay, styles.rightOverlay, rightOverlayStyle]} />

                            {/* Start Handle */}
                            <GestureDetector gesture={startHandleGesture}>
                                <Animated.View style={[styles.handle, styles.startHandle, startHandleStyle]}>
                                    <View style={styles.handleBar} />
                                </Animated.View>
                            </GestureDetector>

                            {/* End Handle */}
                            <GestureDetector gesture={endHandleGesture}>
                                <Animated.View style={[styles.handle, styles.endHandle, endHandleStyle]}>
                                    <View style={styles.handleBar} />
                                </Animated.View>
                            </GestureDetector>
                        </View>

                        {/* Time Labels */}
                        <View style={styles.timeLabels}>
                            <Text style={styles.timeText}>{formatTime(pixelsToTime(trimStartX.value))}</Text>
                            <View style={styles.durationBadge}>
                                <Clock size={12} color={COLORS.textSecondary} />
                                <Text style={styles.durationText}>{formatTime(trimmedDuration)}</Text>
                            </View>
                            <Text style={styles.timeText}>{formatTime(pixelsToTime(trimEndX.value + HANDLE_WIDTH))}</Text>
                        </View>
                    </GestureHandlerRootView>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <Pressable style={styles.resetButton} onPress={handleReset}>
                            <RotateCcw size={18} color={COLORS.textSecondary} />
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </Pressable>

                        <Pressable style={styles.applyButton} onPress={handleApply}>
                            <Check size={18} color="white" />
                            <Text style={styles.applyButtonText}>Apply Trim</Text>
                        </Pressable>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

VideoTrimSheet.displayName = 'VideoTrimSheet';

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: COLORS.sheetBg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 40,
        height: 4,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(240,66,28,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 24,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineContainer: {
        marginBottom: 24,
    },
    timelineTrack: {
        height: 48,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    selection: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(240,66,28,0.2)',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: COLORS.primary,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    leftOverlay: {
        left: 0,
    },
    rightOverlay: {
        right: 0,
    },
    handle: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: HANDLE_WIDTH,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startHandle: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    endHandle: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    handleBar: {
        width: 3,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    timeText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
    },
    durationText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    resetButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
    },
    resetButtonText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    applyButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
