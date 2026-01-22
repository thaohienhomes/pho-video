"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Film, Download, Share2, Clapperboard, Play, CheckCircle, Loader2, Wand2, Music, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLastFrameAsBase64 } from "@/lib/video-utils"
import { VideoComparison } from "./VideoComparison"
import { Generation } from "@/stores/useStudioStore"

interface WorkspacePanelProps {
    videoUrl: string | null
    isGenerating: boolean
    selectedGeneration?: Generation | null
    sessionGenerations: Generation[]  // Current session's generations for storyboard
    onGenerationSelect?: (generation: Generation) => void
    onUpscaleComplete?: (upscaledUrl: string) => void
    onExtendVideo?: (imageBase64: string, originalPrompt: string) => void
    onAnimateImage?: (imageUrl: string) => void
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    "kling-2.6-pro": "Phở Cinematic",
    "wan-2.6": "Phở Realistic",
    "ltx-video": "Phở Instant",
}

export function WorkspacePanel({
    videoUrl,
    isGenerating,
    selectedGeneration,
    sessionGenerations,
    onGenerationSelect,
    onUpscaleComplete,
    onExtendVideo,
    onAnimateImage
}: WorkspacePanelProps) {
    const t = useTranslations("studio.preview")

    // Upscale state
    const [isUpscaling, setIsUpscaling] = useState(false)
    const [localUpscaledUrl, setLocalUpscaledUrl] = useState<string | null>(null)
    const [upscaleError, setUpscaleError] = useState<string | null>(null)
    const [upscaleTier, setUpscaleTier] = useState<'fast' | 'cinematic'>('fast')

    // Extend (Story Mode) state
    const [isExtending, setIsExtending] = useState(false)
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
    const [selectedSubImageIndex, setSelectedSubImageIndex] = useState<number | null>(null)

    // Reset sub-image selection when active generation changes
    useEffect(() => {
        setSelectedSubImageIndex(null)
    }, [selectedGeneration?.id])

    // Derive values from selectedGeneration or props
    const currentGenerationId = selectedGeneration?.id || null
    const displayVideoUrl = selectedGeneration?.videoUrl || videoUrl
    const displayUpscaledUrl = localUpscaledUrl || selectedGeneration?.upscaledUrl || null
    const canUpscale = currentGenerationId &&
        selectedGeneration?.status === 'completed' &&
        !displayUpscaledUrl &&
        !isUpscaling
    const canExtend = displayVideoUrl && !isGenerating && !isExtending

    // Reset local upscaled URL when generation changes
    useEffect(() => {
        setLocalUpscaledUrl(null)
        setUpscaleError(null)
    }, [selectedGeneration?.id])

    const handleDownload = () => {
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
        if (!videoToExtend) return

        try {
            setIsExtending(true)
            const frameBase64 = await getLastFrameAsBase64(videoToExtend)
            const originalPrompt = selectedGeneration?.prompt || ""
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
                    prompt: "Cinematic sound effects and background music",
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

        } catch (err) {
            console.error("Failed to generate audio:", err)
        } finally {
            setIsGeneratingAudio(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
            {/* Main Stage */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="relative w-full max-w-4xl aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10">
                    {isGenerating || selectedGeneration?.status === 'generating' ? (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            {/* Blur Background Thumbnail if available */}
                            {selectedGeneration?.imageUrl && (
                                <img
                                    src={selectedGeneration.imageUrl}
                                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl"
                                    alt="Background"
                                />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center animate-developing">
                                        <Clapperboard className="w-10 h-10 text-primary" />
                                    </div>
                                    {/* Circular Progress Loader */}
                                    <div className="absolute -inset-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-xl text-white tracking-tight">{t("status_developing")}</h3>
                                    <p className="text-sm text-primary animate-pulse mt-1 font-medium">{t("status_rendering")}</p>
                                </div>

                                <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-primary animate-progress-loading" />
                                </div>

                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t("eta_hint")}</span>
                                </div>
                            </div>
                        </div>
                    ) : selectedGeneration?.type === "image" && (selectedGeneration.imageUrl || selectedGeneration.imageUrls) ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {selectedGeneration.imageUrls && selectedGeneration.imageUrls.length > 1 && selectedSubImageIndex === null ? (
                                /* 2x2 Grid View for Batch */
                                <div className="grid grid-cols-2 gap-4 w-full h-full">
                                    {selectedGeneration.imageUrls.map((url, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedSubImageIndex(idx)}
                                            className="group relative cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all bg-white/5"
                                        >
                                            <img
                                                src={url}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt={`${selectedGeneration.prompt} - ${idx + 1}`}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
                                                    <Sparkles className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Hero View (Single or Selected from Batch) */
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    <img
                                        src={selectedSubImageIndex !== null ? selectedGeneration.imageUrls![selectedSubImageIndex] : selectedGeneration.imageUrl!}
                                        className="w-full h-full object-contain rounded-lg shadow-2xl"
                                        alt={selectedGeneration.prompt}
                                    />
                                    {selectedSubImageIndex !== null && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setSelectedSubImageIndex(null)}
                                            className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80"
                                        >
                                            <Clapperboard className="w-4 h-4 mr-2" />
                                            Trở về Lưới (Grid)
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : displayVideoUrl ? (
                        displayUpscaledUrl ? (
                            <VideoComparison
                                originalUrl={displayVideoUrl}
                                upscaledUrl={displayUpscaledUrl}
                                className="w-full h-full"
                            />
                        ) : (
                            <video key={displayVideoUrl} src={displayVideoUrl} controls className="w-full h-full object-contain" autoPlay loop>
                                {t("video_unsupported")}
                            </video>
                        )
                    ) : (
                        /* ✨ Cinematic Empty State */
                        <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center relative">
                            {/* Ambient Glow Background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                                {/* Scanning line for extra detail */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-1/2 w-full animate-scan" />
                            </div>

                            {/* Glowing Icon Container */}
                            <div className="relative animate-float">
                                {/* Outer Glow Ring */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-full blur-xl animate-pulse" />
                                {/* Inner Ring */}
                                <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl blur-md" />
                                {/* Icon Box */}
                                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                                    <Clapperboard className="w-10 h-10 text-primary/80" />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="relative z-10 space-y-2">
                                <p className="text-lg font-semibold text-white/80 tracking-tight">{t("no_video_title")}</p>
                                <p className="text-sm text-white/40 max-w-xs leading-relaxed font-medium">{t("no_video_desc")}</p>
                            </div>

                            {/* Subtle CTA Hint */}
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 hover:bg-white/10 transition-colors cursor-default">
                                <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                                <span className="font-medium">Enter a prompt on the left to begin your journey</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons (Imaging / Animation) */}
            {selectedGeneration?.type === 'image' && (selectedGeneration.imageUrl || selectedGeneration.imageUrls) && !isGenerating && selectedGeneration?.status !== 'generating' && (
                <div className="px-6 pb-4">
                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
                        {/* Only show Animate button if a specific image is being viewed (or it's a single image) */}
                        {(selectedSubImageIndex !== null || !selectedGeneration.imageUrls || selectedGeneration.imageUrls.length <= 1) && (
                            <>
                                <Button
                                    onClick={() => window.open(selectedSubImageIndex !== null ? selectedGeneration.imageUrls![selectedSubImageIndex] : selectedGeneration.imageUrl!, '_blank')}
                                    className="btn-vermilion h-10 px-6 font-bold"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t("download_button")}
                                </Button>
                                <Button
                                    onClick={() => onAnimateImage?.(selectedSubImageIndex !== null ? selectedGeneration.imageUrls![selectedSubImageIndex] : selectedGeneration.imageUrl!)}
                                    variant="outline"
                                    className="h-10 px-6 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary animate-pulse font-bold"
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    ✨ Dùng làm Video (Animate)
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons (when video is ready) */}
            {displayVideoUrl && !isGenerating && selectedGeneration?.status !== 'generating' && (
                <div className="px-6 pb-4">
                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
                        <Button onClick={handleDownload} className="btn-vermilion h-10 px-6 font-bold">
                            <Download className="w-4 h-4 mr-2" />
                            {t("download_button")}
                        </Button>
                        <Button variant="outline" className="h-10 px-6 border-white/10 hover:bg-white/5 font-bold">
                            <Share2 className="w-4 h-4 mr-2" />
                            {t("share_button")}
                        </Button>
                        {canUpscale && !isUpscaling && (
                            <Button
                                onClick={() => handleUpscale('cinematic')}
                                variant="outline"
                                className="h-10 px-6 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)] active:scale-95 transition-all"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Phở 4K Cinematic
                            </Button>
                        )}
                        {isUpscaling && (
                            <Button disabled variant="outline" className="h-10 px-6 border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold animate-pulse">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Phở 4K Developing...
                            </Button>
                        )}
                        {canExtend && !isExtending && (
                            <Button
                                onClick={handleExtend}
                                variant="outline"
                                className="h-10 px-6 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold"
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                Extend
                            </Button>
                        )}
                        {isExtending && (
                            <Button disabled variant="outline" className="h-10 px-6 border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-bold">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Preparing...
                            </Button>
                        )}
                        <Button
                            onClick={handleGenerateAudio}
                            disabled={isGeneratingAudio || !!selectedGeneration?.audioUrl}
                            variant="outline"
                            className="h-10 px-6 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 font-bold"
                        >
                            {isGeneratingAudio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Music className="w-4 h-4 mr-2" />}
                            {selectedGeneration?.audioUrl ? "Sound Added" : "Add Phở Sound"}
                        </Button>
                    </div>
                    {upscaleError && (
                        <p className="text-center text-sm text-red-400 mt-2">{upscaleError}</p>
                    )}
                    {displayUpscaledUrl && (
                        <div className="flex items-center justify-center gap-2 mt-3 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 w-fit mx-auto">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-300">✨ 4K Ready</span>
                        </div>
                    )}
                </div>
            )}

            {/* Storyboard Dock - Film Strip Style */}
            <div className="relative flex-shrink-0">
                {/* Film Perforation Pattern - Left */}
                <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-2 pointer-events-none z-10">
                    {[...Array(5)].map((_, i) => (
                        <div key={`left-${i}`} className="w-2 h-3 rounded-sm bg-white/5 border border-white/10" />
                    ))}
                </div>

                {/* Film Perforation Pattern - Right */}
                <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-around items-center py-2 pointer-events-none z-10">
                    {[...Array(5)].map((_, i) => (
                        <div key={`right-${i}`} className="w-2 h-3 rounded-sm bg-white/5 border border-white/10" />
                    ))}
                </div>

                {/* Dock Container */}
                <div className="bg-black/50 backdrop-blur-xl border-t border-white/10 px-10 py-3">
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                        {sessionGenerations.length === 0 ? (
                            /* Enhanced Empty State */
                            <div className="flex items-center justify-center gap-4 w-full py-2">
                                <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Film className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-white/60">Storyboard</span>
                                        <span className="text-[11px] text-white/40">Your creations will appear here</span>
                                    </div>
                                </div>
                                {/* Placeholder Slots */}
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-20 h-14 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center flex-shrink-0"
                                    >
                                        <span className="text-white/20 text-xs">{i}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            sessionGenerations.map((gen) => (
                                <button
                                    key={gen.id}
                                    onClick={() => onGenerationSelect?.(gen)}
                                    className={cn(
                                        "storyboard-item group",
                                        selectedGeneration?.id === gen.id && "active",
                                        gen.status === 'failed' && "border-red-500/50 bg-red-500/5"
                                    )}
                                >
                                    {gen.videoUrl ? (
                                        <video
                                            src={gen.videoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            playsInline
                                        />
                                    ) : gen.imageUrl ? (
                                        <img
                                            src={gen.imageUrl}
                                            className={cn("w-full h-full object-cover", gen.status === 'generating' && "opacity-60")}
                                            alt={gen.prompt}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                            {gen.status === 'failed' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <Loader2 className="w-4 h-4 text-red-500/40" />
                                                    <span className="text-[6px] text-red-500/50 uppercase font-black">Error</span>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Loader2 className="w-5 h-5 text-primary/40 animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Processing Overlay for generating items */}
                                    {gen.status === 'generating' && (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 overflow-hidden">
                                            <div className="relative h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                                                <div className="absolute inset-0 bg-primary animate-progress-loading" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-primary tracking-widest animate-pulse">
                                                Processing
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {gen.status === 'completed' ? (
                                            gen.videoUrl ? <Play className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />
                                        ) : gen.status === 'generating' ? (
                                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                        ) : (
                                            <Clapperboard className="w-4 h-4 text-red-500/60" />
                                        )}
                                    </div>

                                    {/* Model Badge */}
                                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 text-[8px] font-bold bg-black/70 rounded text-white/70 border border-white/5">
                                        {MODEL_DISPLAY_NAMES[gen.model] || gen.model}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
