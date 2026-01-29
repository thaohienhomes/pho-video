import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Palette, Check, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface StylePreset {
    id: string;
    name: string;
    keywords: string[];
    description: string;
    category: 'cinematic' | 'artistic' | 'minimal' | 'vibrant';
}

interface StylePresetsSheetProps {
    currentPrompt?: string;
    onApplyStyle?: (styledPrompt: string, style: StylePreset) => void;
}

export interface StylePresetsSheetRef {
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

const STYLE_PRESETS: StylePreset[] = [
    {
        id: 'style-noir',
        name: 'Film Noir',
        keywords: ['high contrast', 'black and white', 'dramatic shadows', 'cinematic noir'],
        description: 'Classic black & white',
        category: 'cinematic',
    },
    {
        id: 'style-vibrant',
        name: 'Vibrant Pop',
        keywords: ['vibrant colors', 'saturated', 'bold', 'pop art style'],
        description: 'Bold, saturated colors',
        category: 'vibrant',
    },
    {
        id: 'style-pastel',
        name: 'Soft Pastel',
        keywords: ['soft pastel colors', 'dreamy', 'ethereal', 'gentle lighting'],
        description: 'Soft, dreamy tones',
        category: 'artistic',
    },
    {
        id: 'style-cinematic',
        name: 'Hollywood Epic',
        keywords: ['cinematic', 'anamorphic lens flares', 'epic scale', 'movie quality'],
        description: 'Blockbuster movie look',
        category: 'cinematic',
    },
    {
        id: 'style-anime',
        name: 'Anime Style',
        keywords: ['anime style', 'cel shading', 'Japanese animation', 'vibrant'],
        description: 'Japanese anime look',
        category: 'artistic',
    },
    {
        id: 'style-retro',
        name: 'Retro VHS',
        keywords: ['VHS grain', 'retro', '80s aesthetic', 'scan lines', 'vintage'],
        description: 'Nostalgic 80s effect',
        category: 'artistic',
    },
    {
        id: 'style-minimal',
        name: 'Clean Minimal',
        keywords: ['clean', 'minimal', 'white background', 'simple', 'elegant'],
        description: 'Simple and clean',
        category: 'minimal',
    },
    {
        id: 'style-neon',
        name: 'Neon Glow',
        keywords: ['neon lights', 'glowing', 'cyberpunk', 'pink and blue neon'],
        description: 'Vibrant neon effects',
        category: 'vibrant',
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    cinematic: '#F59E0B',
    artistic: '#A855F7',
    minimal: '#6B7280',
    vibrant: '#0EA5E9',
};

export const StylePresetsSheet = forwardRef<StylePresetsSheetRef, StylePresetsSheetProps>(
    ({ currentPrompt = '', onApplyStyle }, ref) => {
        const bottomSheetModalRef = useRef<BottomSheetModal>(null);
        const snapPoints = useMemo(() => ['60%'], []);
        const [selectedId, setSelectedId] = useState<string | null>(null);

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

        const handleApplyStyle = (style: StylePreset) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSelectedId(style.id);

            const styledPrompt = currentPrompt
                ? `${currentPrompt}, ${style.keywords.join(', ')}`
                : style.keywords.join(', ');

            onApplyStyle?.(styledPrompt, style);

            // Dismiss after selection
            setTimeout(() => {
                bottomSheetModalRef.current?.dismiss();
            }, 300);
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
                            <Palette size={20} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Style Presets</Text>
                            <Text style={styles.headerSubtitle}>
                                Apply a style to enhance your prompt
                            </Text>
                        </View>
                    </View>

                    {/* Styles Grid */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.gridContainer}
                    >
                        <View style={styles.grid}>
                            {STYLE_PRESETS.map((style) => (
                                <Pressable
                                    key={style.id}
                                    style={[
                                        styles.styleCard,
                                        selectedId === style.id && styles.styleCardSelected,
                                    ]}
                                    onPress={() => handleApplyStyle(style)}
                                >
                                    {/* Category Indicator */}
                                    <View
                                        style={[
                                            styles.categoryDot,
                                            { backgroundColor: CATEGORY_COLORS[style.category] }
                                        ]}
                                    />

                                    {/* Selected Check */}
                                    {selectedId === style.id && (
                                        <View style={styles.checkMark}>
                                            <Check size={14} color="white" />
                                        </View>
                                    )}

                                    <Text style={styles.styleName}>{style.name}</Text>
                                    <Text style={styles.styleDesc} numberOfLines={1}>
                                        {style.description}
                                    </Text>

                                    {/* Keywords Preview */}
                                    <View style={styles.keywordsRow}>
                                        {style.keywords.slice(0, 2).map((keyword, i) => (
                                            <View key={i} style={styles.keywordPill}>
                                                <Text style={styles.keywordText}>{keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

StylePresetsSheet.displayName = 'StylePresetsSheet';

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
        paddingHorizontal: 20,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    gridContainer: {
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    styleCard: {
        width: '47%',
        padding: 14,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    styleCardSelected: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    categoryDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    checkMark: {
        position: 'absolute',
        top: -6,
        left: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    styleName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    styleDesc: {
        color: COLORS.textSecondary,
        fontSize: 11,
        marginBottom: 10,
    },
    keywordsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    keywordPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
    },
    keywordText: {
        color: COLORS.textMuted,
        fontSize: 9,
    },
});
