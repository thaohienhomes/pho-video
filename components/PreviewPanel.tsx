"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Download, Share2, RotateCcw, Clapperboard, Clock, RefreshCw, Play, CheckCircle, XCircle, Coins, ImageIcon, Type, Sparkles, Zap, Loader2, Wand2, Music } from "lucide-react"

// ... (existing imports)

interface Generation {
    id: string
    prompt: string
    imageUrl: string | null
    videoUrl: string | null
    audioUrl?: string | null // New field
    upscaledUrl: string | null
    model: string
    status: string
    cost: number
    createdAt: string
}


// ... (code removed)
import { cn } from "@/lib/utils"
import { formatPhoPoints } from "@/lib/pho-points"
import { getLastFrameAsBase64 } from "@/lib/video-utils"
import { VideoComparison } from "./VideoComparison"

interface Generation {
    id: string
    prompt: string
    imageUrl: string | null
    videoUrl: string | null
    upscaledUrl: string | null
    model: string
    status: string
    cost: number
    createdAt: string
}

interface PreviewPanelProps {
    videoUrl: string | null  // For newly generated videos (before saved to DB)
    isGenerating: boolean
    selectedGeneration?: Generation | null  // Selected from history
    onGenerationSelect?: (generation: Generation) => void  // When history item clicked
    onUpscaleComplete?: (upscaledUrl: string) => void
    onExtendVideo?: (imageBase64: string, originalPrompt: string) => void  // For Story Mode extension
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    "kling-2.6-pro": "Kling 2.6",
    "wan-2.6": "Wan 2.6",
    "ltx-video": "LTX",
}

export function PreviewPanel({
    videoUrl,
    isGenerating,
    selectedGeneration,
    onGenerationSelect,
    onUpscaleComplete,
    onExtendVideo
}: PreviewPanelProps) {
    const t = useTranslations("studio.preview")
    const tHistory = useTranslations("studio.history")

    const [activeTab, setActiveTab] = useState("preview")
    const [generations, setGenerations] = useState<Generation[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)

    // Upscale state
    const [isUpscaling, setIsUpscaling] = useState(false)
    const [localUpscaledUrl, setLocalUpscaledUrl] = useState<string | null>(null)
    const [upscaleError, setUpscaleError] = useState<string | null>(null)

    // Extend (Story Mode) state
    const [isExtending, setIsExtending] = useState(false)
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
    const [upscaleTier, setUpscaleTier] = useState<'fast' | 'cinematic'>('fast')

    // Derive values from selectedGeneration or props
    const currentGenerationId = selectedGeneration?.id || null
    const displayVideoUrl = selectedGeneration?.videoUrl || videoUrl
    const displayUpscaledUrl = localUpscaledUrl || selectedGeneration?.upscaledUrl || null
    const canUpscale = currentGenerationId &&
        selectedGeneration?.status === 'completed' &&
        !displayUpscaledUrl &&
        !isUpscaling
    const canExtend = displayVideoUrl && !isGenerating && !isExtending

    // Auto-switch to preview when generating or when video arrives
    useEffect(() => {
        if (isGenerating || videoUrl) {
            setActiveTab("preview")
        }
    }, [isGenerating, videoUrl])

    // Fetch history when switching to history tab
    const fetchHistory = useCallback(async () => {
        try {
            setIsLoadingHistory(true)
            setHistoryError(null)
            const response = await fetch("/api/generations")
            if (!response.ok) {
                throw new Error("Failed to fetch history")
            }
            const data = await response.json()
            // API returns { generations: [...] }
            setGenerations(data.generations || [])
        } catch (err) {
            setHistoryError("Failed to load history")
            console.error(err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [])

    // Fetch when tab changes to history
    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory()
        }
    }, [activeTab, fetchHistory])

    // Reset local upscaled URL when generation changes
    useEffect(() => {
        setLocalUpscaledUrl(null)
        setUpscaleError(null)
    }, [selectedGeneration?.id])

    const handleDownload = () => {
        // Download upscaled version if available, otherwise original
        const urlToDownload = displayUpscaledUrl || displayVideoUrl
        if (urlToDownload) {
            window.open(urlToDownload, '_blank')
        }
    }

    const handleUpscale = async (tier: 'fast' | 'cinematic' = 'fast') => {
        if (!currentGenerationId) {
            setUpscaleError("No generation selected for upscaling")
            return
        }

        try {
            setIsUpscaling(true)
            setUpscaleError(null)

            const response = await fetch("/api/upscale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    generationId: currentGenerationId,
                    tier
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Upscaling failed")
            }

            setLocalUpscaledUrl(data.upscaledUrl)
            if (onUpscaleComplete) {
                onUpscaleComplete(data.upscaledUrl)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Upscaling failed"
            setUpscaleError(errorMessage)
            console.error("Upscale error:", err)
        } finally {
            setIsUpscaling(false)
        }
    }

    const handleExtend = async () => {
        const videoToExtend = displayUpscaledUrl || displayVideoUrl
        if (!videoToExtend) {
            console.error("[Extend] No video URL available")
            return
        }

        try {
            setIsExtending(true)
            console.log("[Extend] Extracting last frame from:", videoToExtend)

            // Extract the last frame as base64
            const frameBase64 = await getLastFrameAsBase64(videoToExtend)
            console.log("[Extend] Frame extracted successfully")

            // Get the original prompt for context
            const originalPrompt = selectedGeneration?.prompt || ""

            // Call the callback to switch to I2V mode with the extracted frame
            if (onExtendVideo) {
                onExtendVideo(frameBase64, originalPrompt)
            }
        } catch (error) {
            console.error("[Extend] Failed to extract frame:", error)
        } finally {
            setIsExtending(false)
        }
    }

    const handleGenerateAudio = async () => {
        if (!currentGenerationId || !selectedGeneration || isGeneratingAudio) return

        setIsGeneratingAudio(true)
        try {
            const res = await fetch("/api/audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    generationId: currentGenerationId,
                    prompt: "Cinematic sound effects and background music", // Simple default for MVP
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Update generation with new audio URL
            const updatedGen = { ...selectedGeneration, audioUrl: data.audioUrl }

            // Assume onGenerationSelect will handle update or we rely on fetchHistory re-sync
            // But since we have local state 'generations', let's update it.
            setGenerations(prev => prev.map(g => g.id === updatedGen.id ? updatedGen : g))

            // If we have an external handler for selection update (optional but good)
            if (onGenerationSelect && activeTab === 'history') {
                // Force refresh of selected item if needed
            }

        } catch (err) {
            console.error("Failed to generate audio:", err)
        } finally {
            setIsGeneratingAudio(false)
        }
    }

    const handleHistorySelect = (gen: Generation) => {
        if (gen.status === "completed" && gen.videoUrl) {
            if (onGenerationSelect) {
                onGenerationSelect(gen)
            }
            setActiveTab("preview")
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-3 h-3 text-green-500" />
            case "failed":
                return <XCircle className="w-3 h-3 text-red-500" />
            default:
                return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
        }
    }

    return (
        <div className="w-[480px] glass-sidebar p-6 overflow-y-auto">
            <Card className="glass-panel border-white/10">
                <CardHeader className="pb-3">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="preview" className="flex-1 gap-2">
                                <Film className="w-4 h-4" />
                                {t("title")}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-1 gap-2">
                                <Clock className="w-4 h-4" />
                                {tHistory("title")}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent>
                    {/* Preview Tab */}
                    {activeTab === "preview" && (
                        <>
                            <div className="aspect-video bg-black/50 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 relative">
                                {isGenerating ? (
                                    <div className="absolute inset-0 developing-placeholder animate-shimmer flex flex-col items-center justify-center">
                                        <div className="relative z-10 flex flex-col items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center animate-developing">
                                                <Clapperboard className="w-10 h-10 text-primary" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-lg text-white">{t("status_developing")}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{t("status_rendering")}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{t("eta_hint")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : displayVideoUrl ? (
                                    displayUpscaledUrl ? (
                                        <VideoComparison
                                            originalUrl={displayVideoUrl}
                                            upscaledUrl={displayUpscaledUrl}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <video src={displayVideoUrl} controls className="w-full h-full object-contain" autoPlay loop>
                                            {t("video_unsupported")}
                                        </video>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Film className="w-10 h-10 text-primary/50" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{t("no_video_title")}</p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{t("no_video_desc")}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {displayVideoUrl && !isGenerating && (
                                <>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex gap-2">
                                            <Button onClick={handleDownload} className="flex-1 btn-vermilion">
                                                <Download className="w-4 h-4 mr-2" />
                                                {t("download_button")}
                                            </Button>
                                            <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                                                <Share2 className="w-4 h-4 mr-2" />
                                                {t("share_button")}
                                            </Button>
                                        </div>

                                        {/* Audio Player if available */}
                                        {selectedGeneration?.audioUrl && (
                                            <div className="mb-3 p-2 rounded-lg bg-black/40 border border-white/10 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-slow">
                                                    <Music className="w-4 h-4 text-primary" />
                                                </div>
                                                <audio
                                                    controls
                                                    src={selectedGeneration.audioUrl}
                                                    className="h-8 w-full opacity-90"
                                                // autoPlay // Optional: Auto-play might be annoying
                                                />
                                            </div>
                                        )}

                                        {/* Tiered Upscale UI */}
                                        {canUpscale && (
                                            <div className="space-y-3 border border-purple-500/20 rounded-xl p-3 bg-purple-500/[0.03]">
                                                <div className="flex p-1 rounded-lg bg-black/40 border border-white/10">
                                                    <button
                                                        onClick={() => setUpscaleTier('fast')}
                                                        className={cn(
                                                            "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                                                            upscaleTier === 'fast' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                                                        )}
                                                    >
                                                        ⚡ Fast
                                                    </button>
                                                    <button
                                                        onClick={() => setUpscaleTier('cinematic')}
                                                        className={cn(
                                                            "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5",
                                                            upscaleTier === 'cinematic' ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(240,66,28,0.2)]" : "text-white/40 hover:text-white/60"
                                                        )}
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        Cinematic
                                                    </button>
                                                </div>

                                                <Button
                                                    onClick={() => handleUpscale(upscaleTier)}
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full border-purple-500/30 transition-all duration-300",
                                                        upscaleTier === 'cinematic'
                                                            ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                                                            : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                                                    )}
                                                >
                                                    {upscaleTier === 'fast' ? (
                                                        <>
                                                            <Zap className="w-4 h-4 mr-2" />
                                                            ⚡ Fast Upscale (10 pts)
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            🎬 Cinematic 4K (25 pts)
                                                        </>
                                                    )}
                                                </Button>
                                                <p className="text-[10px] text-center text-muted-foreground italic">
                                                    {upscaleTier === 'fast' ? "Quick resolution boost" : "Enhanced details & creative refinement"}
                                                </p>
                                            </div>
                                        )}

                                        {/* Upscaling in Progress */}
                                        {isUpscaling && (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="w-full border-purple-500/30 bg-purple-500/10 text-purple-300"
                                            >
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Enhancing to 4K...
                                            </Button>
                                        )}

                                        {/* 4K Ready Badge */}
                                        {displayUpscaledUrl && (
                                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-medium text-purple-300">✨ 4K Ready</span>
                                            </div>
                                        )}

                                        {/* Extend Video (Story Mode) Button */}
                                        {canExtend && !isExtending && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleExtend}
                                                    variant="outline"
                                                    className="flex-1 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200"
                                                >
                                                    <Wand2 className="w-4 h-4 mr-2" />
                                                    Extend (Story)
                                                </Button>
                                                <Button
                                                    onClick={handleGenerateAudio}
                                                    disabled={isGeneratingAudio || !!selectedGeneration?.audioUrl}
                                                    variant="outline"
                                                    className="flex-1 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200"
                                                >
                                                    {isGeneratingAudio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Music className="w-4 h-4 mr-2" />}
                                                    {selectedGeneration?.audioUrl ? "Audio Added" : "Add Sound (5 pts)"}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Extending in Progress */}
                                        {isExtending && (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="w-full border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                            >
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Preparing last frame...
                                            </Button>
                                        )}

                                        {/* Upscale Error */}
                                        {upscaleError && (
                                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                                                {upscaleError}
                                            </div>
                                        )}

                                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-white">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            {t("regenerate_button")}
                                        </Button>
                                    </div>
                                    <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-sm font-medium">{t("success_title")}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{t("success_desc")}</p>
                                    </div>
                                </>
                            )}

                            {!videoUrl && !isGenerating && (
                                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-muted-foreground">
                                        {t.rich('tip_desc', {
                                            strong: (chunks) => <strong className="text-white/80">{chunks}</strong>
                                        })}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* History Tab */}
                    {activeTab === "history" && (
                        <div className="space-y-3">
                            {/* Refresh Button */}
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchHistory}
                                    disabled={isLoadingHistory}
                                    className="text-xs text-muted-foreground hover:text-white"
                                >
                                    <RefreshCw className={cn("w-3 h-3 mr-1", isLoadingHistory && "animate-spin")} />
                                    Refresh
                                </Button>
                            </div>

                            {/* Loading State */}
                            {isLoadingHistory && (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {/* Error State */}
                            {historyError && (
                                <div className="text-sm text-red-400 p-4 bg-red-500/10 rounded-lg">
                                    {historyError}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoadingHistory && !historyError && generations.length === 0 && (
                                <div className="text-center py-8 text-white/40 text-sm">
                                    {tHistory("empty")}
                                </div>
                            )}

                            {/* History List */}
                            {!isLoadingHistory && !historyError && generations.length > 0 && (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                    {generations.map((gen) => (
                                        <button
                                            key={gen.id}
                                            onClick={() => handleHistorySelect(gen)}
                                            disabled={!gen.videoUrl || gen.status !== "completed"}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg transition-all",
                                                "border border-white/5 bg-white/5",
                                                gen.status === "completed" && gen.videoUrl
                                                    ? "hover:bg-white/10 hover:border-primary/30 cursor-pointer"
                                                    : "opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    {gen.status === "completed" ? (
                                                        <Play className="w-4 h-4 text-primary" />
                                                    ) : (
                                                        getStatusIcon(gen.status)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white/80 truncate mb-1">{gen.prompt}</p>
                                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                                        <span className="flex items-center gap-1">
                                                            {gen.imageUrl ? <ImageIcon className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                                                            {MODEL_DISPLAY_NAMES[gen.model] || gen.model}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Coins className="w-3 h-3" />
                                                            {formatPhoPoints(gen.cost)}
                                                        </span>
                                                        <span>{formatDate(gen.createdAt)}</span>
                                                        {getStatusIcon(gen.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
