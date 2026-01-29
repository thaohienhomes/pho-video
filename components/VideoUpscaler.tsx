"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Maximize2,
    Loader2,
    Sparkles,
    Check,
    Film,
    Zap,
    Crown,
    Star,
    Download,
    ArrowLeftRight,
    Grid3X3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeforeAfterSlider, SideBySideComparison } from "@/components/BeforeAfterSlider"
import { cn } from "@/lib/utils"

interface VideoUpscalerProps {
    videoUrl: string
    onUpscaleComplete?: (upscaledUrl: string) => void
}

// Upscaler models with tiers
const UPSCALE_MODELS = [
    {
        id: "topaz",
        name: "Topaz Premium",
        description: "Hollywood-grade quality",
        cost: { 2: 100, 4: 200 },
        tier: "premium",
        icon: Crown,
        color: "from-amber-500 to-yellow-500",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/40",
    },
    {
        id: "seedvr",
        name: "SeedVR",
        description: "ByteDance technology",
        cost: { 2: 50, 4: 100 },
        tier: "pro",
        icon: Star,
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/40",
    },
    {
        id: "flashvsr",
        name: "FlashVSR",
        description: "Real-time fast",
        cost: { 2: 30, 4: 60 },
        tier: "fast",
        icon: Zap,
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/40",
    },
    {
        id: "standard",
        name: "Standard",
        description: "Basic upscaling",
        cost: { 2: 25, 4: 50 },
        tier: "basic",
        icon: Film,
        color: "from-gray-500 to-gray-600",
        bgColor: "bg-white/10",
        borderColor: "border-white/20",
    },
]

type ScaleFactor = 2 | 4
type CompareMode = "slider" | "side"

export function VideoUpscaler({ videoUrl, onUpscaleComplete }: VideoUpscalerProps) {
    const [selectedModel, setSelectedModel] = useState("standard")
    const [scale, setScale] = useState<ScaleFactor>(2)
    const [isUpscaling, setIsUpscaling] = useState(false)
    const [progress, setProgress] = useState(0)
    const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null)
    const [compareMode, setCompareMode] = useState<CompareMode>("slider")

    const currentModel = UPSCALE_MODELS.find(m => m.id === selectedModel)!
    const estimatedCost = currentModel.cost[scale] * 1000

    const handleUpscale = async () => {
        setIsUpscaling(true)
        setProgress(0)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90))
        }, 1000)

        try {
            const response = await fetch("/api/ai/upscale-premium", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl,
                    model: selectedModel,
                    scale,
                }),
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Upscale failed")
            }

            const data = await response.json()
            setProgress(100)
            setUpscaledUrl(data.videoUrl)
            onUpscaleComplete?.(data.videoUrl)
        } catch (error) {
            console.error("Upscale error:", error)
            clearInterval(progressInterval)
        } finally {
            setIsUpscaling(false)
        }
    }

    const handleReset = () => {
        setUpscaledUrl(null)
        setProgress(0)
    }

    return (
        <div className="w-full rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Premium Video Upscaler</h3>
                        <p className="text-sm text-white/50">Enhance video resolution up to 4K</p>
                    </div>
                </div>

                {/* Compare Mode Toggle (shown only when upscaled) */}
                {upscaledUrl && (
                    <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setCompareMode("slider")}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                compareMode === "slider"
                                    ? "bg-primary/20 text-primary"
                                    : "text-white/50 hover:text-white"
                            )}
                            title="Slider comparison"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCompareMode("side")}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                compareMode === "side"
                                    ? "bg-primary/20 text-primary"
                                    : "text-white/50 hover:text-white"
                            )}
                            title="Side by side"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Before/After Comparison (show when upscaled) */}
                <AnimatePresence>
                    {upscaledUrl && !isUpscaling && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {compareMode === "slider" ? (
                                <BeforeAfterSlider
                                    beforeSrc={videoUrl}
                                    afterSrc={upscaledUrl}
                                    beforeLabel="Original"
                                    afterLabel={`${scale}x Enhanced`}
                                    type="video"
                                />
                            ) : (
                                <SideBySideComparison
                                    beforeSrc={videoUrl}
                                    afterSrc={upscaledUrl}
                                    beforeLabel="Original"
                                    afterLabel={`${scale}x Enhanced`}
                                    type="video"
                                />
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <a
                                    href={upscaledUrl}
                                    download
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Enhanced
                                </a>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 transition-colors"
                                >
                                    Upscale Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Settings (hide when upscaled) */}
                {!upscaledUrl && (
                    <>
                        {/* Scale Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/70">
                                Scale Factor
                            </label>
                            <div className="flex gap-3">
                                {([2, 4] as ScaleFactor[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setScale(s)}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl border transition-all",
                                            scale === s
                                                ? "bg-primary/20 border-primary text-primary"
                                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                                        )}
                                    >
                                        <span className="text-2xl font-bold">{s}x</span>
                                        <p className="text-xs mt-1 opacity-60">
                                            {s === 2 ? "720p → 1440p" : "720p → 4K"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Model Selection Grid */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/70">
                                Quality Tier
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {UPSCALE_MODELS.map((model) => {
                                    const Icon = model.icon
                                    const isSelected = selectedModel === model.id

                                    return (
                                        <motion.button
                                            key={model.id}
                                            onClick={() => setSelectedModel(model.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "relative p-4 rounded-xl border transition-all text-left",
                                                isSelected
                                                    ? `${model.bgColor} ${model.borderColor} ring-1 ring-white/20`
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}

                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                                                `bg-gradient-to-br ${model.color}`
                                            )}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>

                                            <h4 className="font-medium text-white">{model.name}</h4>
                                            <p className="text-xs text-white/50 mt-1">{model.description}</p>

                                            <div className="mt-3 pt-2 border-t border-white/10">
                                                <span className="text-sm font-medium text-white/70">
                                                    {model.cost[scale]}K Phở
                                                </span>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Progress Bar (when upscaling) */}
                        <AnimatePresence>
                            {isUpscaling && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/70">Upscaling with {currentModel.name}...</span>
                                        <span className="text-white font-medium">{progress}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full bg-gradient-to-r", currentModel.color)}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 text-center">
                                        This may take 1-3 minutes depending on video length
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Upscale Button */}
                        <Button
                            onClick={handleUpscale}
                            disabled={isUpscaling || !videoUrl}
                            className={cn(
                                "w-full h-14 font-semibold text-lg rounded-2xl transition-all",
                                `bg-gradient-to-r ${currentModel.color} hover:opacity-90 shadow-lg`
                            )}
                        >
                            {isUpscaling ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Enhancing Video...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Upscale to {scale}x
                                    <span className="ml-2 text-sm opacity-70">
                                        ({estimatedCost / 1000}K Phở)
                                    </span>
                                </>
                            )}
                        </Button>

                        {/* No video warning */}
                        {!videoUrl && (
                            <p className="text-center text-sm text-amber-400/80">
                                ⚠️ Select a video from your gallery first
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
