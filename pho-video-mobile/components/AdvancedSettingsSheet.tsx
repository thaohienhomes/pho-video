import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Sparkles, Check, Image as ImageIcon, Layers, X, Trash2 } from 'lucide-react-native';
import { Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn } from 'react-native-reanimated';

interface AdvancedSettingsSheetProps {
    selectedModel: string;
    onSelectModel: (model: string) => void;
    aspectRatio: string;
    onSelectAspectRatio: (ratio: string) => void;
    duration: number;
    onSelectDuration: (duration: number) => void;
    magicPrompt: boolean;
    onToggleMagicPrompt: (enabled: boolean) => void;
    controlImage: string | null;
    onSelectControlImage: (uri: string | null) => void;
    controlType: 'none' | 'pose' | 'depth';
    onSelectControlType: (type: 'none' | 'pose' | 'depth') => void;
    onApply: () => void;
}

export interface AdvancedSettingsSheetRef {
    open: () => void;
    close: () => void;
}

const MODELS = [
    { id: 'kling', name: 'Kling', description: 'Fast & Cinematic', emoji: '🎬' },
    { id: 'luma', name: 'Luma', description: 'Realistic', emoji: '✨' },
    { id: 'runway', name: 'Runway', description: 'Professional', emoji: '🎥' },
];

const ASPECT_RATIOS = [
    { id: '16:9', label: '16:9', description: 'Landscape', width: 64, height: 36 },
    { id: '9:16', label: '9:16', description: 'Portrait', width: 36, height: 64 },
    { id: '1:1', label: '1:1', description: 'Square', width: 48, height: 48 },
];

const DURATIONS = [
    { value: 5, credits: 50 },
    { value: 10, credits: 100 },
    { value: 15, credits: 150 },
];

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

const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => {
    const knobPosition = useSharedValue(value ? 24 : 0);

    React.useEffect(() => {
        knobPosition.value = withSpring(value ? 24 : 0, {
            damping: 15,
            stiffness: 150,
        });
    }, [value, knobPosition]);

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: knobPosition.value }],
    }));

    return (
        <TouchableOpacity
            style={[
                styles.toggleTrack,
                { backgroundColor: value ? COLORS.primary : '#525252' }
            ]}
            onPress={onToggle}
            activeOpacity={0.8}
        >
            <Animated.View style={[styles.toggleKnob, knobStyle]} />
        </TouchableOpacity>
    );
};

export const AdvancedSettingsSheet = forwardRef<AdvancedSettingsSheetRef, AdvancedSettingsSheetProps>(
    (
        {
            selectedModel,
            onSelectModel,
            aspectRatio,
            onSelectAspectRatio,
            duration,
            onSelectDuration,
            magicPrompt,
            onToggleMagicPrompt,
            controlImage,
            onSelectControlImage,
            controlType,
            onSelectControlType,
            onApply,
        },
        ref
    ) => {
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
                    opacity={0.7}
                    pressBehavior="close"
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
                enablePanDownToClose
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Advanced Settings</Text>
                        <Text style={styles.headerSubtitle}>Fine-tune your video generation</Text>
                    </View>

                    {/* Model Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>AI MODEL</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {MODELS.map((model) => {
                                const isSelected = selectedModel === model.id;
                                return (
                                    <TouchableOpacity
                                        key={model.id}
                                        style={[
                                            styles.modelCard,
                                            isSelected && styles.modelCardSelected,
                                            { marginRight: 12 }
                                        ]}
                                        onPress={() => onSelectModel(model.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modelIcon, isSelected && styles.modelIconSelected]}>
                                            <Text style={styles.modelEmoji}>{model.emoji}</Text>
                                        </View>
                                        <View style={styles.modelInfo}>
                                            <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
                                                {model.name}
                                            </Text>
                                            <Text style={[styles.modelDesc, isSelected && styles.modelDescSelected]}>
                                                {model.description}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.selectedBadge}>
                                                <Check size={12} color="white" strokeWidth={3} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Aspect Ratio */}
                    <View style={[styles.section, styles.sectionBorder]}>
                        <Text style={styles.sectionLabel}>ASPECT RATIO</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {ASPECT_RATIOS.map((ratio, index) => {
                                const isSelected = aspectRatio === ratio.id;
                                return (
                                    <TouchableOpacity
                                        key={ratio.id}
                                        style={[
                                            styles.ratioCard,
                                            isSelected && styles.ratioCardSelected,
                                            { marginRight: index < ASPECT_RATIOS.length - 1 ? 12 : 0 }
                                        ]}
                                        onPress={() => onSelectAspectRatio(ratio.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.ratioRect,
                                                { width: ratio.width, height: ratio.height },
                                                isSelected && styles.ratioRectSelected
                                            ]}
                                        />
                                        <Text style={[styles.ratioLabel, isSelected && styles.ratioLabelSelected]}>
                                            {ratio.label}
                                        </Text>
                                        <Text style={[styles.ratioDesc, isSelected && styles.ratioDescSelected]}>
                                            {ratio.description}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Duration */}
                    <View style={[styles.section, styles.sectionBorder]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>DURATION</Text>
                            <Text style={styles.creditHint}>
                                ~{DURATIONS.find((d) => d.value === duration)?.credits || 50} credits
                            </Text>
                        </View>
                        <View style={styles.segmentedControl}>
                            {DURATIONS.map((d) => {
                                const isSelected = duration === d.value;
                                return (
                                    <TouchableOpacity
                                        key={d.value}
                                        style={[
                                            styles.segment,
                                            isSelected && styles.segmentSelected
                                        ]}
                                        onPress={() => onSelectDuration(d.value)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                                            {d.value}s
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.creditRow}>
                            {DURATIONS.map((d) => (
                                <Text key={d.value} style={styles.creditLabel}>
                                    {d.credits} ⚡
                                </Text>
                            ))}
                        </View>
                    </View>

                    {/* Magic Prompt */}
                    <View style={[styles.section, styles.sectionBorder]}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleLeft}>
                                <View style={styles.toggleIcon}>
                                    <Sparkles size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.toggleInfo}>
                                    <Text style={styles.toggleTitle}>Magic Prompt</Text>
                                    <Text style={styles.toggleDesc}>AI-enhance your description</Text>
                                </View>
                            </View>
                            <ToggleSwitch value={magicPrompt} onToggle={() => onToggleMagicPrompt(!magicPrompt)} />
                        </View>
                    </View>

                    <View style={[styles.section, styles.sectionBorder]}>
                        <Text style={styles.sectionLabel}>STRUCTURE CONTROL</Text>
                        <Text style={styles.sectionDesc}>Guide the layout with a pose or depth reference image</Text>

                        <View style={styles.controlTypeGrid}>
                            {(['none', 'pose', 'depth'] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.controlTypeItem,
                                        controlType === type && styles.controlTypeItemActive
                                    ]}
                                    onPress={() => onSelectControlType(type)}
                                >
                                    <View style={[
                                        styles.controlTypeIcon,
                                        controlType === type && styles.controlTypeIconActive
                                    ]}>
                                        {type === 'none' && <X size={20} color={controlType === type ? '#FFF' : COLORS.textSecondary} />}
                                        {type === 'pose' && <ImageIcon size={20} color={controlType === type ? '#FFF' : COLORS.textSecondary} />}
                                        {type === 'depth' && <Layers size={20} color={controlType === type ? '#FFF' : COLORS.textSecondary} />}
                                    </View>
                                    <Text style={[
                                        styles.controlTypeText,
                                        controlType === type && styles.controlTypeTextActive
                                    ]}>
                                        {type.charAt(0) + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {controlType !== 'none' && (
                            <Animated.View entering={FadeIn} style={styles.imageSelectionArea}>
                                {controlImage ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image
                                            source={{ uri: controlImage }}
                                            style={styles.imagePreview}
                                            alt="Control Reference"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => onSelectControlImage(null)}
                                        >
                                            <Trash2 size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.uploadBox}
                                        onPress={() => onSelectControlImage('placeholder')} // Will be handled by ImagePicker in Parent
                                    >
                                        <ImageIcon size={32} color={COLORS.textSecondary} />
                                        <Text style={styles.uploadText}>Select {controlType} image</Text>
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        )}
                    </View>

                    {/* Bottom Spacer */}
                    <View style={{ height: 40 }} />

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                onApply();
                                bottomSheetModalRef.current?.dismiss();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.applyButtonText}>Apply Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => bottomSheetModalRef.current?.dismiss()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    }
);

AdvancedSettingsSheet.displayName = 'AdvancedSettingsSheet';

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
    sheetContainer: {
        flex: 1,
        backgroundColor: COLORS.sheetBg,
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 200, // Increased to ensure visibility
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    sectionBorder: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    sectionLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    creditHint: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    modelCard: {
        width: 128,
        height: 160,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
    },
    modelCardSelected: {
        backgroundColor: 'rgba(240,66,28,0.15)',
        borderColor: COLORS.primary,
    },
    modelIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modelIconSelected: {
        backgroundColor: 'rgba(240,66,28,0.2)',
    },
    modelEmoji: {
        fontSize: 24,
    },
    modelInfo: {
        gap: 2,
    },
    modelName: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modelNameSelected: {
        color: COLORS.text,
    },
    modelDesc: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    modelDescSelected: {
        color: COLORS.textSecondary,
    },
    selectedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        backgroundColor: COLORS.primary,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratioCard: {
        width: 110,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    ratioCardSelected: {
        backgroundColor: 'rgba(240,66,28,0.15)',
        borderColor: COLORS.primary,
    },
    ratioRect: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    ratioRectSelected: {
        backgroundColor: 'rgba(240,66,28,0.4)',
        borderColor: COLORS.primary,
    },
    ratioLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    ratioLabelSelected: {
        color: COLORS.primary,
    },
    ratioDesc: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    ratioDescSelected: {
        color: COLORS.textSecondary,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    segmentSelected: {
        backgroundColor: COLORS.primary,
    },
    segmentText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: 'bold',
    },
    segmentTextSelected: {
        color: COLORS.text,
    },
    creditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 10,
    },
    creditLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    toggleIcon: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(240,66,28,0.15)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleInfo: {
        flex: 1,
    },
    toggleTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    toggleDesc: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    toggleTrack: {
        width: 56,
        height: 32,
        borderRadius: 16,
        padding: 4,
        justifyContent: 'center',
    },
    toggleKnob: {
        width: 24,
        height: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        backgroundColor: COLORS.sheetBg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    applyButtonText: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
    sectionDesc: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 16,
    },
    controlTypeGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    controlTypeItem: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    controlTypeItemActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(240,66,28,0.05)',
    },
    controlTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    controlTypeIconActive: {
        backgroundColor: COLORS.primary,
    },
    controlTypeText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    controlTypeTextActive: {
        color: COLORS.text,
    },
    imageSelectionArea: {
        marginTop: 4,
    },
    uploadBox: {
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    imagePreviewContainer: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
