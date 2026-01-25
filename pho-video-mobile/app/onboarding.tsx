import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Zap, Film, Sparkles, Gift } from 'lucide-react-native';
import { OnboardingSlide } from '../components/OnboardingSlide';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@pho_onboarding_completed';

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    text: '#FFFFFF',
    textMuted: '#737373',
};

const SLIDES = [
    {
        id: 1,
        title: 'AI Models, One App',
        description: 'Access Kling, Luma, Runway, and more without juggling multiple subscriptions.',
        badges: ['🎬 Kling', '✨ Luma', '🎥 Runway', '🌊 Mochi'],
    },
    {
        id: 2,
        title: 'Cinematic in Seconds',
        description: 'Transform your ideas into stunning videos with AI-powered generation.',
        icon: <Film size={80} color={COLORS.primary} strokeWidth={1.5} />,
    },
    {
        id: 3,
        title: 'Start Free, Scale Fast',
        description: 'Get 100 free credits to start. Upgrade anytime for unlimited creativity.',
        icon: <Gift size={80} color={COLORS.primary} strokeWidth={1.5} />,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(slideIndex);
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const handleGetStarted = () => {
        completeOnboarding();
    };

    const goToNextSlide = () => {
        if (currentIndex < SLIDES.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: (currentIndex + 1) * width,
                animated: true,
            });
        } else {
            handleGetStarted();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Phở</Text>
                    <Text style={styles.logoAccent}>Video</Text>
                </View>

                {/* Carousel */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={styles.carousel}
                    contentContainerStyle={styles.carouselContent}
                >
                    {SLIDES.map((slide) => (
                        <OnboardingSlide
                            key={slide.id}
                            title={slide.title}
                            description={slide.description}
                            badges={slide.badges}
                            icon={slide.icon}
                        />
                    ))}
                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* CTA Button */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={goToNextSlide}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.ctaText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        {currentIndex !== SLIDES.length - 1 && (
                            <Sparkles size={20} color="white" style={{ marginLeft: 8 }} />
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 16,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        color: COLORS.textMuted,
        fontSize: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    logoText: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: 'bold',
    },
    logoAccent: {
        color: COLORS.primary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    carousel: {
        flex: 1,
    },
    carouselContent: {
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dotActive: {
        width: 24,
        backgroundColor: COLORS.primary,
    },
    ctaContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    ctaButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
