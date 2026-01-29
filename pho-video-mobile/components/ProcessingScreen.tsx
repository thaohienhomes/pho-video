import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    Animated,
    Easing,
    Modal,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X, Film, Sparkles, Eye } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
};

const TIPS = [
    "✨ AI is analyzing your prompt for optimal visuals...",
    "🎬 Generating cinematic motion sequences...",
    "🎨 Applying style enhancements...",
    "🔧 Rendering high-quality frames...",
    "🎯 Optimizing video for smoothness...",
    "🚀 Almost there! Final touches in progress...",
];

interface ProcessingScreenProps {
    visible: boolean;
    progress: number;
    estimatedTime?: number;
    onCancel?: () => void;
    onMinimize?: () => void;
    prompt?: string;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
    visible,
    progress,
    estimatedTime,
    onCancel,
    onMinimize,
    prompt,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [showMinimizeButton, setShowMinimizeButton] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            const rotation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            rotation.start();
            return () => rotation.stop();
        }
    }, [visible, rotateAnim]);

    useEffect(() => {
        if (visible) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [visible, pulseAnim]);

    useEffect(() => {
        const tipInterval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 4000);
        return () => clearInterval(tipInterval);
    }, []);

    useEffect(() => {
        if (visible) {
            setShowMinimizeButton(false);
            const timer = setTimeout(() => {
                setShowMinimizeButton(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const circumference = 2 * Math.PI * 75;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            statusBarTranslucent
        >
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <StatusBar style="light" />

                {/* Header with close button */}
                <View style={styles.header}>
                    {progress < 10 && onCancel && (
                        <Pressable
                            style={styles.closeButton}
                            onPress={onCancel}
                        >
                            <X color="white" size={22} />
                        </Pressable>
                    )}
                </View>

                {/* Main Content - Centered */}
                <View style={styles.mainContent}>
                    {/* Progress Ring */}
                    <View style={styles.progressContainer}>
                        <Svg width={160} height={160}>
                            <Circle
                                cx={80}
                                cy={80}
                                r={75}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth={5}
                                fill="transparent"
                            />
                            <Circle
                                cx={80}
                                cy={80}
                                r={75}
                                stroke={COLORS.primary}
                                strokeWidth={5}
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 80 80)"
                            />
                        </Svg>

                        {/* Rotating glow dot */}
                        <Animated.View
                            style={[
                                styles.rotatingGlow,
                                { transform: [{ rotate: rotateInterpolate }] }
                            ]}
                        >
                            <View style={styles.glowDot} />
                        </Animated.View>

                        {/* Center content */}
                        <Animated.View
                            style={[
                                styles.centerContent,
                                { transform: [{ scale: pulseAnim }] }
                            ]}
                        >
                            <Film size={36} color={COLORS.primary} strokeWidth={1.5} />
                            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                        </Animated.View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Developing your masterpiece...</Text>

                    {/* Estimated time */}
                    {estimatedTime !== undefined && estimatedTime > 0 && (
                        <Text style={styles.estimatedTime}>~{estimatedTime} seconds remaining</Text>
                    )}

                    {/* Tip */}
                    <View style={styles.tipContainer}>
                        <Sparkles size={14} color={COLORS.primary} />
                        <Text style={styles.tipText}>{TIPS[currentTipIndex]}</Text>
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Prompt preview */}
                    {prompt && (
                        <View style={styles.promptPreview}>
                            <Text style={styles.promptLabel}>YOUR PROMPT</Text>
                            <Text style={styles.promptText} numberOfLines={2}>{prompt}</Text>
                        </View>
                    )}

                    {/* Browse button */}
                    {showMinimizeButton && progress >= 50 && onMinimize && (
                        <Pressable
                            style={styles.minimizeButton}
                            onPress={onMinimize}
                        >
                            <Eye size={18} color="white" />
                            <Text style={styles.minimizeButtonText}>Browse while you wait</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    progressContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    rotatingGlow: {
        position: 'absolute',
        width: 160,
        height: 160,
        alignItems: 'center',
    },
    glowDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 6,
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        gap: 4,
    },
    progressText: {
        color: COLORS.text,
        fontSize: 26,
        fontWeight: 'bold',
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    estimatedTime: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 20,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(240,66,28,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        maxWidth: '90%',
    },
    tipText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        flex: 1,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 16 : 24,
        gap: 16,
        alignItems: 'center',
    },
    promptPreview: {
        alignItems: 'center',
        width: '100%',
    },
    promptLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    promptText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    minimizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 28,
        marginTop: 8,
    },
    minimizeButtonText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
});
