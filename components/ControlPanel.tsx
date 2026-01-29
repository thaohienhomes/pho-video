"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StyleSelector } from './StyleSelector'
import { STYLE_PRESETS, StylePreset } from '@/constants/styles'
import {
    Sparkles, Zap, Star, Crown, Wand2, Loader2, Type, AlertTriangle,
    Clock, Monitor, Smartphone, Square, Film, Hash, Image as ImageIcon, Coins
} from 'lucide-react'
import { CameraControls, getCameraPromptSuffix, type CameraMovement } from "@/components/CameraControls"
import { ImageDropzone } from "@/components/ImageDropzone"
import { cn } from "@/lib/utils"
import { VideoModel } from "@/types"
import { COST_PHO_POINTS, formatPhoPoints } from "@/lib/pho-points"

export type GenerationMode = 'text' | 'image' | 'generate-image'

// Define the interface for generation options
export interface VideoGenerationOptions {
    prompt: string
    imageBase64?: string
    duration: number
    resolution: string
    aspectRatio: string
    seed: number | undefined
    model: string
    count?: number             // For batch image generation
    modelId?: string           // For image model selection
    includeAudio?: boolean     // Added
    motion?: number            // Added
}

interface ControlPanelProps {
    onGenerateAction: (options: VideoGenerationOptions, thumbnailUrl?: string) => void
    isGenerating: boolean
    selectedModel: string
    onSelectModelAction: (modelId: string) => void
    initialPrompt?: string
    duration: number[]
    setDurationAction: (val: number[]) => void
    resolution: string
    setResolutionAction: (val: string) => void
    aspectRatio: string
    setAspectRatioAction: (val: string) => void
    seed: string
    setSeedAction: (val: string) => void
    extractedImage?: string | null
    onImageUsed?: () => void
}

// Phở Points cost per action (All tiers)
const PHO_POINTS_COSTS = {
    video: {
        // === FAST TIER ===
        "pho-instant": { 5: COST_PHO_POINTS.VIDEO_5S_1080P_FAST, 10: COST_PHO_POINTS.VIDEO_10S_1080P_FAST },
        "pho-fast": { 5: 40000, 10: 80000 }, // Seedance - cheapest
        // === STANDARD TIER ===
        "pho-cinematic": { 5: COST_PHO_POINTS.VIDEO_5S_1080P_PRO, 10: COST_PHO_POINTS.VIDEO_10S_1080P_PRO },
        "pho-motion": { 5: COST_PHO_POINTS.I2V_5S_1080P, 10: COST_PHO_POINTS.I2V_10S_1080P },
        "pho-motion-pro": { 5: 70000, 10: 140000 }, // Hailuo Pro
        // === PREMIUM TIER ===
        "pho-ultra": { 5: 200000, 10: 400000 }, // Veo 3.1
        "pho-sora": { 5: 250000, 10: 500000 }, // Sora 2 Pro
        // LEGACY: Backward compatibility
        "kling-2.6-pro": { 5: COST_PHO_POINTS.VIDEO_5S_1080P_PRO, 10: COST_PHO_POINTS.VIDEO_10S_1080P_PRO },
        "wan-2.6": { 5: COST_PHO_POINTS.I2V_5S_1080P, 10: COST_PHO_POINTS.I2V_10S_1080P },
        "ltx-video": { 5: COST_PHO_POINTS.VIDEO_5S_1080P_FAST, 10: COST_PHO_POINTS.VIDEO_10S_1080P_FAST },
    },
    image: {
        single: COST_PHO_POINTS.IMAGE_FLUX_PRO,
        batch: COST_PHO_POINTS.IMAGE_FLUX_BATCH_4,
    }
}

// All Fal.AI models support I2V
const I2V_SUPPORTED_MODELS = [
    "pho-instant", "pho-fast", "pho-cinematic", "pho-motion", "pho-motion-pro",
    "pho-ultra", "pho-sora", "kling-2.6-pro", "wan-2.6", "ltx-video"
]

export function ControlPanel({
    onGenerateAction,
    isGenerating,
    selectedModel,
    onSelectModelAction,
    initialPrompt = "",
    duration,
    setDurationAction,
    resolution,
    setResolutionAction,
    aspectRatio,
    setAspectRatioAction,
    seed,
    setSeedAction,
    extractedImage,
    onImageUsed
}: ControlPanelProps) {
    const t = useTranslations("studio.controls")
    const tMode = useTranslations("studio.mode")
    const tImage = useTranslations("studio.imageMode")
    const tT2I = useTranslations("studio.t2i")
    const tSidebar = useTranslations("studio.sidebar")
    const tStyle = useTranslations("studio.style")

    const [mode, setMode] = useState<GenerationMode>('text')
    const [includeAudio, setIncludeAudio] = useState(false)
    const [motion, setMotion] = useState([5])
    const [prompt, setPrompt] = useState(initialPrompt)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [cameraMovement, setCameraMovement] = useState<CameraMovement>('static')
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0])

    // Image Generation Specific State
    const [imageModel, setImageModel] = useState("flux-pro-v1.1")
    const [imageCount, setImageCount] = useState<1 | 4>(1)

    // Available Models - Organized by Tier
    const AVAILABLE_MODELS: VideoModel[] = [
        // === PREMIUM TIER (Enterprise) ===
        {
            id: "pho-ultra",
            name: "Phở Ultra (Veo 3.1)",
            description: "Google's flagship - Ultra-cinematic, best quality",
            isAvailable: true,
            provider: "Google Veo 3.1 via Fal.AI",
            tag: "ULTRA",
            tagKey: "Ultra",
            costTier: "high",
            creditCostPerSecond: 40,
        },
        {
            id: "pho-sora",
            name: "Phở Sora (OpenAI)",
            description: "OpenAI Sora 2 Pro - Best motion physics",
            isAvailable: true,
            provider: "OpenAI Sora 2 via Fal.AI",
            tag: "SORA",
            tagKey: "Sora",
            costTier: "high",
            creditCostPerSecond: 50,
        },
        // === STANDARD TIER (Quality balance) ===
        {
            id: "pho-cinematic",
            name: "Phở Cinematic (Pro)",
            description: tSidebar("kling_desc"),
            isAvailable: true,
            provider: "Kling 2.5 Pro via Fal.AI",
            tag: tSidebar("tag_cinematic"),
            tagKey: "Cinematic",
            costTier: "high",
            creditCostPerSecond: 15,
        },
        {
            id: "pho-motion",
            name: "Phở Motion (Smooth)",
            description: tSidebar("wan_desc"),
            isAvailable: true,
            provider: "Minimax Hailuo via Fal.AI",
            tag: "MOTION",
            tagKey: "Motion",
            costTier: "medium",
            creditCostPerSecond: 11,
        },
        // === FAST TIER (Budget-friendly) ===
        {
            id: "pho-instant",
            name: "Phở Instant (Fast)",
            description: tSidebar("ltx_desc"),
            isAvailable: true,
            provider: "LTX-2 19B via Fal.AI",
            tag: tSidebar("tag_fast"),
            tagKey: "Fast",
            costTier: "low",
            creditCostPerSecond: 10,
        },
        {
            id: "pho-fast",
            name: "Phở Fast (Budget)",
            description: "ByteDance Seedance - Cheapest option, good for drafts",
            isAvailable: true,
            provider: "ByteDance Seedance via Fal.AI",
            tag: "BUDGET",
            tagKey: "Budget",
            costTier: "low",
            creditCostPerSecond: 8,
        },
    ]

    const tagStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        Ultra: { bg: "bg-gradient-to-r from-purple-500/30 to-pink-500/30", text: "text-pink-400", icon: <Crown className="w-3 h-3" /> },
        Sora: { bg: "bg-gradient-to-r from-blue-500/30 to-cyan-500/30", text: "text-cyan-400", icon: <Star className="w-3 h-3" /> },
        Cinematic: { bg: "bg-primary/20", text: "text-primary", icon: <Crown className="w-3 h-3" /> },
        Motion: { bg: "bg-purple-500/20", text: "text-purple-400", icon: <Star className="w-3 h-3" /> },
        Fast: { bg: "bg-green-500/20", text: "text-green-400", icon: <Zap className="w-3 h-3" /> },
        Budget: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <Zap className="w-3 h-3" /> },
    }

    // Check if current model supports I2V
    const supportsI2V = I2V_SUPPORTED_MODELS.includes(selectedModel)

    // Update prompt when initialPrompt changes
    useEffect(() => {
        if (initialPrompt) setPrompt(initialPrompt)
    }, [initialPrompt])

    // Reset to text mode if model doesn't support I2V
    useEffect(() => {
        if (!supportsI2V && mode === 'image') setMode('text')
    }, [selectedModel, supportsI2V, mode])

    // Handle extracted image from Story Mode extension
    useEffect(() => {
        if (extractedImage && supportsI2V) {
            setMode('image')
            setImageBase64(extractedImage)
            if (onImageUsed) onImageUsed()
        }
    }, [extractedImage, supportsI2V, onImageUsed])

    // Calculate estimated Phở Points cost
    const estimatedCost = useMemo(() => {
        if (mode === 'generate-image') {
            return imageCount === 4 ? PHO_POINTS_COSTS.image.batch : PHO_POINTS_COSTS.image.single
        }
        const modelCosts = PHO_POINTS_COSTS.video[selectedModel as keyof typeof PHO_POINTS_COSTS.video]
            || PHO_POINTS_COSTS.video["ltx-video"]
        const durationKey = duration[0] <= 5 ? 5 : 10
        return modelCosts[durationKey as 5 | 10] || COST_PHO_POINTS.VIDEO_5S_1080P_FAST
    }, [selectedModel, duration, mode, imageCount])

    // Check if generate button should be enabled
    const canGenerate = useMemo(() => {
        if (isGenerating) return false
        if (mode === 'text') return prompt.trim().length > 0
        return imageBase64 !== null
    }, [mode, prompt, imageBase64, isGenerating])

    const handleGenerate = async () => {
        if (mode === 'generate-image') {
            if (!prompt.trim()) {
                alert(t("error_empty_prompt"))
                return
            }

            // Append style keywords if a style is selected (and it's not "None")
            let finalPrompt = prompt.trim()
            if (selectedStyle && selectedStyle.id !== 'none' && selectedStyle.promptModifier) {
                const styleName = tStyle(selectedStyle.labelKey)
                // Heuristic: Append if not already present
                if (!finalPrompt.toLowerCase().includes(styleName.toLowerCase())) {
                    finalPrompt = `${finalPrompt}, in ${styleName} style, ${selectedStyle.promptModifier}`
                }
            }

            onGenerateAction({
                prompt: finalPrompt,
                aspectRatio,
                seed: seed ? parseInt(seed) : undefined,
                model: imageModel, // Provider specific name
                modelId: imageModel,
                count: imageCount,
                duration: 0,
                resolution: "high",
            })
            return
        }

        if (mode === 'text' && !prompt.trim()) {
            alert(t("error_empty_prompt"))
            return
        }
        if (mode === 'image' && !imageBase64) return

        let finalPrompt = prompt.trim()
        if (selectedStyle.id !== 'none' && selectedStyle.promptModifier) {
            finalPrompt += `, ${selectedStyle.promptModifier}`
        }
        const cameraSuffix = getCameraPromptSuffix(cameraMovement)
        finalPrompt += cameraSuffix

        onGenerateAction({
            prompt: finalPrompt,
            imageBase64: mode === 'image' ? imageBase64 || undefined : undefined,
            duration: duration[0],
            resolution,
            aspectRatio,
            seed: seed ? parseInt(seed) : undefined,
            model: selectedModel,
            includeAudio,
            motion: motion[0],
        }, mode === 'image' ? imageBase64 || undefined : undefined)
    }

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) return
        setIsEnhancing(true)
        try {
            const response = await fetch("/api/ai/enhance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            })
            if (!response.ok) throw new Error("Failed to enhance prompt")
            const data = await response.json()
            if (data.enhancedPrompt) setPrompt(data.enhancedPrompt)
        } catch (error) {
            console.error("Enhancement error:", error)
            // No longer showing "Coming soon" - showing a generic error instead
            alert("Failed to enhance prompt. Please try again.")
        } finally {
            setIsEnhancing(false)
        }
    }

    return (
        <div className="w-80 flex flex-col h-full bg-[#0D0D0D] border-r border-white/5 flex-shrink-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Mode Switcher */}
                <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setMode('text')}
                        disabled={isGenerating}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg whitespace-nowrap",
                            "text-[10px] font-medium transition-all shrink-0",
                            mode === 'text'
                                ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(240,66,28,0.15)]"
                                : "text-white/50 hover:text-white/70",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Type className="w-3 h-3" />
                        {tMode("text_to_video")}
                    </button>
                    <button
                        onClick={() => supportsI2V && setMode('image')}
                        disabled={isGenerating || !supportsI2V}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg whitespace-nowrap",
                            "text-[10px] font-medium transition-all shrink-0",
                            !supportsI2V && "opacity-30 cursor-not-allowed",
                            mode === 'image' && supportsI2V
                                ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(240,66,28,0.15)]"
                                : "text-white/50 hover:text-white/70",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                        title={!supportsI2V ? tImage("ltx_not_supported") : undefined}
                    >
                        <ImageIcon className="w-3 h-3" />
                        {tMode("image_to_video")}
                        {!supportsI2V && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                    </button>
                    <button
                        onClick={() => setMode('generate-image')}
                        disabled={isGenerating}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg whitespace-nowrap",
                            "text-[10px] font-medium transition-all shrink-0",
                            mode === 'generate-image'
                                ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(240,66,28,0.15)]"
                                : "text-white/50 hover:text-white/70",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Sparkles className="w-3 h-3" />
                        {tMode("text_to_image")}
                    </button>
                </div>

                {/* Model Selector */}
                {mode !== 'generate-image' && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            {tSidebar("title")}
                        </h3>
                        <div className="space-y-2">
                            {AVAILABLE_MODELS.map((model) => {
                                const tagStyle = tagStyles[model.tagKey as string] || tagStyles.Fast
                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => onSelectModelAction(model.id)}
                                        disabled={!model.isAvailable || isGenerating}
                                        className={cn(
                                            "w-full text-left p-3 rounded-xl transition-all",
                                            "border border-white/5 bg-white/[0.02]",
                                            "hover:border-primary/30 hover:bg-white/[0.05]",
                                            selectedModel === model.id && "model-card-active",
                                            (!model.isAvailable || isGenerating) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{model.name}</span>
                                            <span className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                                                tagStyle.bg, tagStyle.text
                                            )}>
                                                {tagStyle.icon}
                                                {model.tag}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-white/40 line-clamp-1">{model.description}</p>
                                        <div className="flex items-center justify-between text-[10px] mt-1.5 text-white/30">
                                            <span>{model.provider}</span>
                                            <span className="text-primary">{model.creditCostPerSecond} pts/s</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Prompt / Image Input */}
                {mode === 'generate-image' ? (
                    <div className="space-y-4">
                        {/* Image Model Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" /> Model
                            </label>
                            <Select value={imageModel} onValueChange={setImageModel} disabled={isGenerating}>
                                <SelectTrigger className="bg-white/5 border-white/5 h-10 text-sm focus:ring-1 focus:ring-primary/50 text-white/90">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="flux-pro-v1.1" className="text-xs">
                                        Flux 1.1 Pro (Cinematic Realism)
                                    </SelectItem>
                                    <SelectItem value="recraft-v3" className="text-xs">
                                        Recraft V3 (Graphic & Artistic)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Image Count / Batch Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50">{tT2I("image_count_label") || "Quantity"}</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setImageCount(1)}
                                    disabled={isGenerating}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-medium transition-all border",
                                        imageCount === 1
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                    )}
                                >
                                    1 Image ({formatPhoPoints(PHO_POINTS_COSTS.image.single)})
                                </button>
                                <button
                                    onClick={() => setImageCount(4)}
                                    disabled={isGenerating}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-medium transition-all border",
                                        imageCount === 4
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                    )}
                                >
                                    4 Images ({formatPhoPoints(PHO_POINTS_COSTS.image.batch)})
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-white/60">{t("prompt_label")}</label>
                                <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 flex items-center gap-1">
                                    <Coins className="w-3 h-3" />
                                    {formatPhoPoints(estimatedCost)}
                                </span>
                            </div>
                            <div className="cockpit-textarea p-0.5">
                                <div className="relative">
                                    <textarea
                                        placeholder={t("prompt_placeholder")}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className={cn("w-full min-h-[140px] text-sm leading-relaxed resize-none bg-transparent border-none focus:outline-none focus:ring-0 p-3 pr-10 text-white placeholder:text-white/30 transition-all duration-700",
                                            isEnhancing && "bg-primary/5 blur-[0.5px]")}
                                        disabled={isGenerating}
                                    />
                                    <button
                                        onClick={handleEnhancePrompt}
                                        disabled={isGenerating || isEnhancing || !prompt.trim()}
                                        className={cn(
                                            "absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                                            isEnhancing
                                                ? "bg-primary/40 border-primary animate-pulse cursor-wait"
                                                : "bg-primary/20 hover:bg-primary/30 border-primary/20"
                                        )}
                                        title={t("enhance_button_tooltip")}
                                    >
                                        <Sparkles className={cn("w-3.5 h-3.5 text-primary", isEnhancing && "animate-spin")} />
                                    </button>
                                </div>
                            </div>
                            {/* Re-enable StyleSelector for Image mode too */}
                            <StyleSelector selectedStyleId={selectedStyle.id} onStyleSelectAction={setSelectedStyle} />
                        </div>
                    </div>
                ) : mode === 'text' ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-white/60">{t("prompt_label")}</label>
                            <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                ~{formatPhoPoints(estimatedCost)}
                            </span>
                        </div>
                        <div className="cockpit-textarea p-0.5">
                            <div className="relative">
                                <textarea
                                    placeholder={t("prompt_placeholder")}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full min-h-[120px] text-sm leading-relaxed resize-none bg-transparent border-none focus:outline-none focus:ring-0 p-3 pr-10 text-white placeholder:text-white/30"
                                    disabled={isGenerating}
                                />
                                <button
                                    onClick={handleEnhancePrompt}
                                    disabled={isGenerating || isEnhancing || !prompt.trim()}
                                    className={cn(
                                        "absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                                        isEnhancing
                                            ? "bg-primary/40 border-primary animate-pulse cursor-wait"
                                            : "bg-primary/20 hover:bg-primary/30 border-primary/20"
                                    )}
                                    title={t("enhance_button_tooltip")}
                                >
                                    <Sparkles className={cn("w-3.5 h-3.5 text-primary", isEnhancing && "animate-spin")} />
                                </button>
                            </div>
                        </div>
                        <StyleSelector selectedStyleId={selectedStyle.id} onStyleSelectAction={setSelectedStyle} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <ImageDropzone value={imageBase64} onImageSelect={setImageBase64} disabled={isGenerating} />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-white/60">{tImage("prompt_label")} <span className="text-white/30">({tImage("prompt_optional")})</span></label>
                            <textarea
                                placeholder={tImage("prompt_placeholder")}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full min-h-[60px] text-xs resize-none bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 p-2.5 text-white placeholder:text-white/30"
                                disabled={isGenerating}
                            />
                        </div>
                        <div className="flex justify-end">
                            <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                ~{formatPhoPoints(estimatedCost)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Settings */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                    {/* Duration */}
                    {mode !== 'generate-image' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> {tSidebar("duration_label")}
                                </label>
                                <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/10">{duration[0]}s</span>
                            </div>
                            <Slider
                                value={duration}
                                onValueChange={setDurationAction}
                                min={1}
                                max={10}
                                step={1}
                                disabled={isGenerating}
                            />
                        </div>
                    )}

                    {/* Motion Intensity */}
                    {mode !== 'generate-image' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" /> {tSidebar("motion_label")}
                                </label>
                                <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/10">
                                    {motion[0] === 1 ? tSidebar("motion_low") : motion[0] === 10 ? tSidebar("motion_high") : motion[0]}
                                </span>
                            </div>
                            <Slider
                                value={motion}
                                onValueChange={setMotion}
                                min={1}
                                max={10}
                                step={1}
                                disabled={isGenerating}
                                className="[&>span:first-child]:bg-white/10 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&>span:first-child>span]:bg-primary"
                            />
                        </div>
                    )}

                    {/* Sound FX Toggle */}
                    {mode !== 'generate-image' && (
                        <div className="space-y-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-white/80 flex items-center gap-2">
                                        <Film className="w-3.5 h-3.5 text-primary" />
                                        {tSidebar("sound_fx_label")}
                                    </label>
                                    <p className="text-[10px] text-white/40 leading-relaxed">
                                        {tSidebar("sound_fx_desc")}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={includeAudio}
                                        onChange={(e) => setIncludeAudio(e.target.checked)}
                                        disabled={isGenerating}
                                    />
                                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Resolution */}
                    {mode !== 'generate-image' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                <Monitor className="w-3 h-3" /> {tSidebar("resolution_label")}
                            </label>
                            <Select value={resolution} onValueChange={setResolutionAction} disabled={isGenerating}>
                                <SelectTrigger className="bg-white/5 border-white/5 h-10 text-sm focus:ring-1 focus:ring-primary/50 text-white/90">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="480p" className="text-xs">480p - {tSidebar("res_fast")}</SelectItem>
                                    <SelectItem value="720p" className="text-xs">720p - {tSidebar("res_balanced")}</SelectItem>
                                    <SelectItem value="1080p" className="text-xs">1080p - {tSidebar("res_high")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Aspect Ratio */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/50">{tSidebar("ratio_label")}</label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: "16:9", icon: <Monitor className="w-3 h-3" /> },
                                { id: "9:16", icon: <Smartphone className="w-3 h-3" /> },
                                { id: "1:1", icon: <Square className="w-3 h-3" /> },
                                { id: "21:9", icon: <Film className="w-3 h-3" /> },
                            ].map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => setAspectRatioAction(ratio.id)}
                                    disabled={isGenerating}
                                    className={cn(
                                        "flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] transition-all border",
                                        aspectRatio === ratio.id
                                            ? "bg-primary/20 border-primary text-primary shadow-sm shadow-primary/10"
                                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {ratio.icon}
                                    <span>{ratio.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seed */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                            <Hash className="w-3 h-3" /> {tSidebar("seed_label")}
                        </label>
                        <Input
                            type="number"
                            placeholder={tSidebar("seed_random")}
                            value={seed}
                            onChange={(e) => setSeedAction(e.target.value)}
                            disabled={isGenerating}
                            className="bg-white/5 border-white/5 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 text-white/90 placeholder:text-white/20"
                        />
                    </div>

                    {/* Camera Controls */}
                    {mode !== 'generate-image' && (
                        <CameraControls value={cameraMovement} onValueChange={setCameraMovement} disabled={isGenerating} />
                    )}
                </div>
            </div>

            {/* Generate Button - Pinned to bottom */}
            <div className="p-4 border-t border-white/5">
                <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full h-12 text-base font-bold btn-generate rounded-xl shadow-2xl transition-all hover:scale-[1.02]"
                    size="lg"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {mode === 'generate-image' ? tT2I("generating_state") : t("generating_state")}
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            {mode === 'generate-image'
                                ? `${tT2I("generate_button_prefix") || "Tạo"} ${imageCount} ${tT2I("generate_button_suffix") || "Ảnh"} (${formatPhoPoints(estimatedCost)})`
                                : t("generate_button")}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
