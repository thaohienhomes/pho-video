import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronDown, ChevronUp, Monitor, Smartphone, Square, Clock, Sparkles } from "lucide-react-native";
import { STYLE_PRESETS } from "../constants/styles";

interface AdvancedSettingsProps {
    isOpen: boolean;
    onToggle: () => void;
    selectedRatio: string;
    onSelectRatio: (ratio: string) => void;
    duration: number;
    onSelectDuration: (duration: number) => void;
    selectedStyleId: string;
    onSelectStyle: (styleId: string) => void;
}

const ASPECT_RATIOS = [
    { id: "16:9", label: "16:9", icon: Monitor },
    { id: "9:16", label: "9:16", icon: Smartphone },
    { id: "1:1", label: "1:1", icon: Square },
];

export const AdvancedSettings = ({
    isOpen,
    onToggle,
    selectedRatio,
    onSelectRatio,
    duration,
    onSelectDuration,
    selectedStyleId,
    onSelectStyle,
}: AdvancedSettingsProps) => {
    return (
        <View className="bg-white/5 rounded-[20px] border border-white/10 mb-4 overflow-hidden">
            <Pressable
                className="flex-row justify-between items-center p-4"
                onPress={onToggle}
            >
                <Text className="text-white text-[14px] font-semibold">Advanced Controls</Text>
                {isOpen ? (
                    <ChevronUp size={20} color="#A3A3A3" />
                ) : (
                    <ChevronDown size={20} color="#A3A3A3" />
                )}
            </Pressable>

            {isOpen && (
                <View className="p-4 pt-0 gap-5">
                    {/* Aspect Ratio */}
                    <View className="gap-2">
                        <Text className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">Aspect Ratio</Text>
                        <View className="flex-row gap-2.5">
                            {ASPECT_RATIOS.map((ratio) => (
                                <Pressable
                                    key={ratio.id}
                                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${selectedRatio === ratio.id
                                        ? "border-primary bg-primary/10"
                                        : "border-white/10 bg-surface"
                                        }`}
                                    onPress={() => onSelectRatio(ratio.id)}
                                >
                                    <ratio.icon
                                        size={16}
                                        color={selectedRatio === ratio.id ? "#F0421C" : "#A3A3A3"}
                                    />
                                    <Text className={`text-[13px] font-medium ${selectedRatio === ratio.id ? "text-primary font-bold" : "text-gray-400"
                                        }`}>
                                        {ratio.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Duration */}
                    <View className="gap-2">
                        <Text className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">Duration</Text>
                        <View className="flex-row gap-2.5">
                            {[5, 10].map((d) => (
                                <Pressable
                                    key={d}
                                    className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${duration === d
                                        ? "border-primary bg-primary/10"
                                        : "border-white/10 bg-surface"
                                        }`}
                                    onPress={() => onSelectDuration(d)}
                                >
                                    <Clock
                                        size={16}
                                        color={duration === d ? "#F0421C" : "#A3A3A3"}
                                    />
                                    <Text className={`text-[13px] font-medium ${duration === d ? "text-primary font-bold" : "text-gray-400"
                                        }`}>
                                        {d}s
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Styles */}
                    <View className="gap-2">
                        <Text className="text-gray-400 text-[12px] font-bold uppercase tracking-wider">Style Preset</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 10, paddingRight: 10 }}
                        >
                            {STYLE_PRESETS.map((style) => (
                                <Pressable
                                    key={style.id}
                                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${selectedStyleId === style.id
                                        ? "border-primary bg-primary/10"
                                        : "border-white/10 bg-surface"
                                        }`}
                                    onPress={() => onSelectStyle(style.id)}
                                >
                                    <Sparkles
                                        size={14}
                                        color={selectedStyleId === style.id ? "#F0421C" : "#A3A3A3"}
                                    />
                                    <Text className={`text-[12px] font-medium ${selectedStyleId === style.id ? "text-primary font-semibold" : "text-gray-400"
                                        }`}>
                                        {style.id === 'none' ? 'Default' : style.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
        </View>
    );
};
