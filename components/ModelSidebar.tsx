"use client"

import { useTranslations } from "next-intl"
import { VideoModel } from "@/types"
import { Sparkles, Zap, Star, Film, Crown, Flame, Settings2, Clock, Monitor, Hash, Smartphone, Square, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ModelSidebarProps {
    selectedModel: string
    onSelectModel: (modelId: string) => void
    duration: number[]
    setDuration: (val: number[]) => void
    resolution: string
    setResolution: (val: string) => void
    aspectRatio: string
    setAspectRatioAction: (val: string) => void
    seed: string
    setSeed: (val: string) => void
    isGenerating: boolean
}

export function ModelSidebar({
    selectedModel,
    onSelectModel,
    duration,
    setDuration,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatioAction,
    seed,
    setSeed,
    isGenerating
}: ModelSidebarProps) {
    const t = useTranslations("studio.sidebar")

    const AVAILABLE_MODELS: VideoModel[] = [
        {
            id: "kling-2.6-pro",
            name: "Kling 2.6 Pro",
            description: t("kling_desc"),
            isAvailable: true,
            provider: "wavespeed",
            tag: t("tag_cinematic"),
            tagKey: "Cinematic",
            costTier: "high",
            creditCostPerSecond: 10,
        },
        {
            id: "wan-2.6",
            name: "Wan 2.6",
            description: t("wan_desc"),
            isAvailable: true,
            provider: "wavespeed",
            tag: t("tag_realistic"),
            tagKey: "Realistic",
            costTier: "high",
            creditCostPerSecond: 8,
        },
        {
            id: "ltx-video",
            name: "LTX-Video",
            description: t("ltx_desc"),
            isAvailable: true,
            provider: "fal",
            tag: t("tag_fast"),
            tagKey: "Fast",
            costTier: "low",
            creditCostPerSecond: 2,
        },
        {
            id: "pho-grok",
            name: "Grok Audio",
            description: t("grok_desc"),
            isAvailable: true,
            provider: "fal",
            tag: t("tag_audio"),
            tagKey: "Audio",
            costTier: "high",
            creditCostPerSecond: 25,
        },
    ]

    const tagStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        Cinematic: {
            bg: "bg-primary/20",
            text: "text-primary",
            icon: <Crown className="w-3 h-3" />,
        },
        Realistic: {
            bg: "bg-blue-500/20",
            text: "text-blue-400",
            icon: <Star className="w-3 h-3" />,
        },
        Fast: {
            bg: "bg-green-500/20",
            text: "text-green-400",
            icon: <Zap className="w-3 h-3" />,
        },
        Audio: {
            bg: "bg-purple-500/20",
            text: "text-purple-400",
            icon: <Music className="w-3 h-3" />,
        },
    }

    const costTierLabels: Record<string, { label: string; color: string }> = {
        low: { label: t("cost_low"), color: "text-green-400" },
        medium: { label: t("cost_medium"), color: "text-yellow-400" },
        high: { label: t("cost_premium"), color: "text-primary" },
    }

    return (
        <div className="w-72 glass-sidebar flex flex-col h-full">
            <div className="p-6 flex-1 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t("title")}
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                    {t("subtitle")}
                </p>

                <div className="space-y-3">
                    {AVAILABLE_MODELS.map((model) => {
                        const tagStyle = tagStyles[model.tagKey as string] || tagStyles.Fast
                        const costStyle = costTierLabels[model.costTier]

                        return (
                            <button
                                key={model.id}
                                onClick={() => onSelectModel(model.id)}
                                disabled={!model.isAvailable}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl transition-all",
                                    "border border-white/5 bg-white/[0.02]",
                                    "hover:border-primary/30 hover:bg-white/[0.05]",
                                    selectedModel === model.id && "model-card-active",
                                    !model.isAvailable && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-medium text-sm">{model.name}</div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                        tagStyle.bg,
                                        tagStyle.text
                                    )}>
                                        {tagStyle.icon}
                                        {model.tag}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground mb-3">
                                    {model.description}
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">
                                        {t("provider_label")}: <span className="text-white/70 capitalize">{model.provider}</span>
                                    </span>
                                    <span className={costStyle.color}>
                                        {model.creditCostPerSecond} cr/s
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Generation Settings */}
                <div className="mt-8">
                    <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary/80 uppercase tracking-wider">
                        <Settings2 className="w-4 h-4" />
                        {t("settings_title")}
                    </h2>

                    <div className="space-y-6">
                        {/* Duration Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {t("duration_label")}
                                </label>
                                <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/10">{duration[0]}s</span>
                            </div>
                            <Slider
                                value={duration}
                                onValueChange={setDuration}
                                min={1}
                                max={10}
                                step={1}
                                disabled={isGenerating}
                                className="scale-90 origin-left w-[110%] [&>span:first-child]:bg-white/10 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&>span:first-child>span]:bg-primary transition-all hover:[&_[role=slider]]:scale-125"
                            />
                        </div>

                        {/* Resolution Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                <Monitor className="w-3 h-3" />
                                {t("resolution_label")}
                            </label>
                            <Select value={resolution} onValueChange={setResolution} disabled={isGenerating}>
                                <SelectTrigger className="bg-white/5 border-white/5 h-8 text-xs focus:ring-1 focus:ring-primary/50 text-white/90">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="480p" className="text-xs">480p - {t("res_fast")}</SelectItem>
                                    <SelectItem value="720p" className="text-xs">720p - {t("res_balanced")}</SelectItem>
                                    <SelectItem value="1080p" className="text-xs">1080p - {t("res_high")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Aspect Ratio Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                <Monitor className="w-3 h-3" />
                                {t("ratio_label")}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "16:9", icon: <Monitor className="w-3 h-3" />, label: t("ratio_16_9") },
                                    { id: "9:16", icon: <Smartphone className="w-3 h-3" />, label: t("ratio_9_16") },
                                    { id: "1:1", icon: <Square className="w-3 h-3" />, label: t("ratio_1_1") },
                                    { id: "21:9", icon: <Film className="w-3 h-3" />, label: t("ratio_21_9") },
                                ].map((ratio) => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => setAspectRatioAction(ratio.id)}
                                        disabled={isGenerating}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border",
                                            aspectRatio === ratio.id
                                                ? "bg-primary/20 border-primary text-primary shadow-sm shadow-primary/10"
                                                : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        {ratio.icon}
                                        <span className="truncate">{ratio.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seed Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                <Hash className="w-3 h-3" />
                                {t("seed_label")}
                            </label>
                            <Input
                                type="number"
                                placeholder={t("seed_random")}
                                value={seed}
                                onChange={(e) => setSeed(e.target.value)}
                                disabled={isGenerating}
                                className="bg-white/5 border-white/5 h-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/50 text-white/90 placeholder:text-white/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">{t("tip_title")}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {t.rich('tip_desc', {
                            strong: (chunks) => <strong className="text-white/80">{chunks}</strong>
                        })}
                    </p>
                </div>
            </div>
        </div>
    )
}
