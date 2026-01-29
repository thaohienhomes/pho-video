import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Clipboard } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Globe, Lock, Link2, Copy, Check, Share2, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ShareSheetProps {
    videoId: string;
    videoTitle: string;
    isPublic: boolean;
    onVisibilityChange?: (isPublic: boolean) => void;
}

export interface ShareSheetRef {
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
    success: '#22C55E',
};

export const ShareSheet = forwardRef<ShareSheetRef, ShareSheetProps>(
    ({ videoId, videoTitle, isPublic, onVisibilityChange }, ref) => {
        const bottomSheetModalRef = useRef<BottomSheetModal>(null);
        const snapPoints = useMemo(() => ['45%'], []);

        const [visibility, setVisibility] = useState(isPublic);
        const [copied, setCopied] = useState(false);

        const shareUrl = `https://pho.video/video/${videoId}`;

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

        const handleVisibilityChange = async () => {
            const newVisibility = !visibility;
            setVisibility(newVisibility);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onVisibilityChange?.(newVisibility);
        };

        const handleCopyLink = async () => {
            Clipboard.setString(shareUrl);
            setCopied(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => setCopied(false), 2000);
        };

        const handleNativeShare = async () => {
            try {
                await Share.share({
                    message: `Check out this AI video: ${videoTitle}\n${shareUrl}`,
                    url: shareUrl,
                    title: videoTitle,
                });
            } catch (error) {
                console.error('Share failed:', error);
            }
        };

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
                            <Share2 size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Share Video</Text>
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                {videoTitle || 'Untitled Video'}
                            </Text>
                        </View>
                    </View>

                    {/* Visibility Toggle */}
                    <Pressable
                        style={styles.visibilityButton}
                        onPress={handleVisibilityChange}
                    >
                        <View style={[
                            styles.visibilityIcon,
                            visibility && styles.visibilityIconPublic
                        ]}>
                            {visibility ? (
                                <Globe size={20} color={COLORS.success} />
                            ) : (
                                <Lock size={20} color={COLORS.textMuted} />
                            )}
                        </View>
                        <View style={styles.visibilityText}>
                            <Text style={styles.visibilityLabel}>
                                {visibility ? 'Public' : 'Private'}
                            </Text>
                            <Text style={styles.visibilityHint}>
                                {visibility
                                    ? 'Anyone can view and remix'
                                    : 'Only you can see this'}
                            </Text>
                        </View>
                        <View style={[
                            styles.toggle,
                            visibility && styles.toggleActive
                        ]}>
                            <View style={[
                                styles.toggleDot,
                                visibility && styles.toggleDotActive
                            ]} />
                        </View>
                    </Pressable>

                    {/* Copy Link */}
                    <Pressable
                        style={styles.actionButton}
                        onPress={handleCopyLink}
                    >
                        <View style={styles.actionIcon}>
                            {copied ? (
                                <Check size={20} color={COLORS.success} />
                            ) : (
                                <Link2 size={20} color={COLORS.text} />
                            )}
                        </View>
                        <Text style={[
                            styles.actionText,
                            copied && styles.actionTextSuccess
                        ]}>
                            {copied ? 'Link Copied!' : 'Copy Link'}
                        </Text>
                    </Pressable>

                    {/* Native Share */}
                    <Pressable
                        style={styles.actionButton}
                        onPress={handleNativeShare}
                    >
                        <View style={styles.actionIcon}>
                            <MessageCircle size={20} color={COLORS.text} />
                        </View>
                        <Text style={styles.actionText}>Share via...</Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

ShareSheet.displayName = 'ShareSheet';

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
        marginBottom: 24,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
        maxWidth: 200,
    },
    visibilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 16,
    },
    visibilityIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    visibilityIconPublic: {
        backgroundColor: 'rgba(34,197,94,0.15)',
    },
    visibilityText: {
        flex: 1,
    },
    visibilityLabel: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
    visibilityHint: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 2,
    },
    toggleActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    toggleDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.textMuted,
    },
    toggleDotActive: {
        backgroundColor: COLORS.text,
        marginLeft: 'auto',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        marginBottom: 12,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '500',
    },
    actionTextSuccess: {
        color: COLORS.success,
    },
});
