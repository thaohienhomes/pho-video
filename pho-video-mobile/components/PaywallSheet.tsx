import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Zap, Check, Star, ShieldCheck, Crown } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#F0421C',
    background: '#0A0A0A',
    surface: '#171717',
    surfaceSelected: 'rgba(240,66,28,0.1)',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    border: 'rgba(255,255,255,0.1)',
};

const PACKAGES = [
    { id: 'starter', name: 'Starter', price: '$4.99', credits: 200, emoji: '⚡', popular: false },
    { id: 'pro', name: 'Pro Creator', price: '$14.99', credits: 1000, emoji: '🔥', popular: true, bonus: '20% Extra' },
    { id: 'elite', name: 'Elite', price: '$29.99', credits: 2500, emoji: '👑', popular: false },
];

export interface PaywallSheetRef {
    open: () => void;
    close: () => void;
}

export const PaywallSheet = forwardRef<PaywallSheetRef>((_, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);

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
                opacity={0.8}
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: COLORS.background }}
            handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
            <BottomSheetScrollView contentContainerStyle={styles.container}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Zap size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Bung Năng Lượng Phở</Text>
                    <Text style={styles.subtitle}>Sở hữu thêm Credits để tạo ra những thước phim 8K AI không giới hạn.</Text>
                </Animated.View>

                {/* Benefits */}
                <View style={styles.benefitsArea}>
                    {[
                        'Xóa Watermark thương hiệu',
                        'Ưu tiên hàng chờ generation',
                        'Tải video chất lượng 4K/8K',
                        'Mở khóa Advance Pose Control'
                    ].map((benefit, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInUp.delay(300 + i * 50)}
                            style={styles.benefitRow}
                        >
                            <ShieldCheck size={18} color={COLORS.primary} />
                            <Text style={styles.benefitText}>{benefit}</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Packages */}
                <View style={styles.packagesContainer}>
                    {PACKAGES.map((pkg, i) => (
                        <Animated.View
                            key={pkg.id}
                            entering={FadeInUp.delay(500 + i * 100)}
                            style={[
                                styles.packageItem,
                                pkg.popular && styles.packageItemPopular
                            ]}
                        >
                            {pkg.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>MUỐN NHẤT</Text>
                                </View>
                            )}
                            <View style={styles.packageHeader}>
                                <Text style={styles.packageName}>{pkg.name}</Text>
                                <Text style={styles.packagePrice}>{pkg.price}</Text>
                            </View>
                            <View style={styles.packageMain}>
                                <Text style={styles.creditValue}>{pkg.credits}⚡</Text>
                                {pkg.bonus && <Text style={styles.bonusText}>+{pkg.bonus}</Text>}
                            </View>
                            <Pressable style={[styles.buyButton, pkg.popular && styles.buyButtonPopular]}>
                                <Text style={styles.buyButtonText}>Chọn Gói</Text>
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>

                <Text style={styles.disclaimer}>
                    Thanh toán an toàn qua Apple App Store. Tự động cộng credits ngay lập tức.
                </Text>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

PaywallSheet.displayName = "PaywallSheet";

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(240,66,28,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 12,
    },
    benefitsArea: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '48%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12,
    },
    benefitText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    },
    packagesContainer: {
        gap: 16,
        marginBottom: 24,
    },
    packageItem: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    packageItemPopular: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(240,66,28,0.05)',
        borderWidth: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    packageName: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    packagePrice: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    packageMain: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 16,
    },
    creditValue: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: '900',
    },
    bonusText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    buyButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    buyButtonPopular: {
        backgroundColor: COLORS.primary,
    },
    buyButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 12,
        lineHeight: 18,
    },
});
