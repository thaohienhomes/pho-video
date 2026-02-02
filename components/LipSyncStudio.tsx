"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Mic,
    Loader2,
    ImageIcon,
    AudioLines,
    Sparkles,
    Volume2,
    Download,
    Share2,
    Upload,
    Play,
    Pause,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { StudioHeader, GlassPanel, GenerateButton } from "@/components/studio"
import { WaveformVisualizer } from "@/components/studio/WaveformVisualizer"

interface LipSyncStudioProps {
    onComplete?: (videoUrl: string) => void
}

const SAMPLE_FACES = [
    { id: "s1", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", name: "Sarah" },
    { id: "s2", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", name: "James" },
    { id: "s3", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", name: "Elena" },
    { id: "s4", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", name: "David" },
]

export function LipSyncStudio({ onComplete }: LipSyncStudioProps) {
    const t = useTranslations("lipSync")
    const tCommon = useTranslations("common")

    // State
    const [sourceImage, setSourceImage] = useState<string | null>(null)
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [audioDuration, setAudioDuration] = useState(0)
    const [expressionScale, setExpressionScale] = useState(1.0)
    const [preprocess, setPreprocess] = useState<string>("crop")
    const [stillMode, setStillMode] = useState(false)
    const [enhanceFace, setEnhanceFace] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)

    // Image dropzone
    const onImageDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setSourceImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setSourceImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const imageDropzone = useDropzone({
        onDrop: onImageDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 1,
    })

    // Audio dropzone
    const onAudioDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setAudioFile(file)
            const url = URL.createObjectURL(file)
            setAudioUrl(url)

            // Get audio duration
            const audio = new Audio(url)
            audio.onloadedmetadata = () => {
                setAudioDuration(Math.ceil(audio.duration))
            }
        }
    }, [])

    const audioDropzone = useDropzone({
        onDrop: onAudioDrop,
        accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] },
        maxFiles: 1,
    })

    // Calculate cost
    const estimatedCost = Math.ceil(Math.min(audioDuration, 30) / 10) * 50 // 50K per 10s

    // Generate
    const handleGenerate = async () => {
        if (!sourceImage || !audioUrl) {
            toast.error("Please upload both image and audio")
            return
        }

        setIsGenerating(true)
        setResultVideoUrl(null)

        try {
            // Upload image to get URL
            const imageFormData = new FormData()
            if (sourceImageFile) {
                imageFormData.append("file", sourceImageFile)
            }

            // For now, use base64 directly
            // In production, upload to cloud storage first

            const response = await fetch("/api/ai/lip-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sourceImageUrl: sourceImage, // Base64 for now
                    drivenAudioUrl: audioUrl,
                    audioDuration,
                    expressionScale,
                    preprocess,
                    stillMode,
                    enhanceFace,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Generation failed")
            }

            setResultVideoUrl(data.videoUrl)
            toast.success("Talking head generated!", {
                description: `Cost: ${data.cost / 1000}K Phở Points`,
            })
            onComplete?.(data.videoUrl)
        } catch (error) {
            toast.error("Generation failed", {
                description: error instanceof Error ? error.message : "Unknown error",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Compact Header */}
            <StudioHeader
                icon={Mic}
                title={t("title")}
                subtitle={t("subtitle")}
                accentColor="pink"
                badge="AI"
            />

            {/* Main Content - 3-Column Golden Ratio Layout (No Scroll) */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                {/* LEFT: Portrait Upload + Sample Gallery (5 cols) - NEON GLOW */}
                <div className="col-span-5 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#0F0F15] border border-[#EC4899]/20 p-4 flex flex-col gap-3 overflow-hidden shadow-[0_0_25px_rgba(236,72,153,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(236,72,153,0.15)] transition-shadow duration-500">
                    <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#F472B6] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                        Portrait
                    </h3>

                    {/* Compact Upload Zone */}
                    <div
                        {...imageDropzone.getRootProps()}
                        className={cn(
                            "relative h-32 rounded-xl flex-shrink-0 group",
                            "border-2 border-dashed transition-all duration-300 cursor-pointer",
                            "flex flex-col items-center justify-center",
                            "bg-gradient-to-br from-[#EC4899]/5 to-transparent",
                            imageDropzone.isDragActive
                                ? "border-[#EC4899] bg-[#EC4899]/15 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-[1.02]"
                                : "border-[#EC4899]/30 hover:border-[#EC4899]/60 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]",
                            sourceImage && "border-solid border-[#EC4899] shadow-[0_0_20px_rgba(236,72,153,0.25)]"
                        )}
                    >
                        <input {...imageDropzone.getInputProps()} />
                        {sourceImage ? (
                            <img src={sourceImage} alt="Portrait" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-[#EC4899] mb-2" />
                                <p className="text-xs text-white/60">Upload Portrait Image</p>
                            </>
                        )}
                    </div>

                    {/* Sample Gallery - 4 columns compact */}
                    <div className="flex-1 min-h-0">
                        <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">Sample Gallery</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {SAMPLE_FACES.map((face) => (
                                <button
                                    key={face.id}
                                    onClick={() => setSourceImage(face.url)}
                                    className={cn(
                                        "relative aspect-square rounded-xl overflow-hidden transition-all duration-300 group/face",
                                        "border-2 hover:scale-105",
                                        sourceImage === face.url
                                            ? "border-[#EC4899] ring-2 ring-[#EC4899]/40 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                                            : "border-white/10 hover:border-[#EC4899]/50 hover:shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                                    )}
                                >
                                    <img src={face.url} alt={face.name} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CENTER: Voice/Audio (4 cols) - CREATOR VIBES */}
                <div className="col-span-4 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#12121A] border border-[#EC4899]/15 p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(236,72,153,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(236,72,153,0.12)] transition-shadow duration-500">
                    <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] to-[#EC4899] uppercase tracking-wider flex items-center gap-2">
                        <AudioLines className="w-3 h-3 text-[#EC4899]" />
                        Voice / Audio
                    </h3>

                    {/* Compact Audio Upload */}
                    <div
                        {...audioDropzone.getRootProps()}
                        className={cn(
                            "relative h-24 rounded-lg flex-shrink-0",
                            "border-2 border-dashed transition-all cursor-pointer",
                            "flex flex-col items-center justify-center",
                            audioDropzone.isDragActive
                                ? "border-[#EC4899] bg-[#EC4899]/10"
                                : "border-white/20 hover:border-white/40",
                            audioUrl && "border-solid border-[#EC4899]/30 bg-[#EC4899]/5"
                        )}
                    >
                        <input {...audioDropzone.getInputProps()} />
                        {!audioUrl && (
                            <>
                                <Upload className="w-5 h-5 text-[#EC4899] mb-1" />
                                <p className="text-xs text-white/60">Upload Audio</p>
                                <p className="text-[10px] text-white/30">MP3, WAV</p>
                            </>
                        )}
                    </div>

                    {/* Audio Player (when loaded) */}
                    {audioUrl && (
                        <div className="rounded-xl bg-gradient-to-br from-[#0F0F12] to-[#080810] border border-[#EC4899]/20 p-3 space-y-2 shadow-[inset_0_0_20px_rgba(236,72,153,0.05)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AudioLines className="w-3 h-3 text-[#EC4899]" />
                                    <span className="text-xs text-white truncate max-w-[100px]">{audioFile?.name}</span>
                                </div>
                                <span className="text-[10px] text-white/50">{audioDuration}s</span>
                            </div>
                            <div className="h-8 flex items-center">
                                <WaveformVisualizer isPlaying={isPlayingAudio} count={30} height={28} color="bg-[#EC4899]" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[#EC4899] to-[#BE185D] flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.5)] hover:shadow-[0_0_18px_rgba(236,72,153,0.7)] transition-shadow"
                                >
                                    {isPlayingAudio ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
                                </button>
                                <div className="flex-1 h-1 bg-white/10 rounded-full">
                                    <div className="w-1/3 h-full bg-[#EC4899] rounded-full" />
                                </div>
                            </div>
                            <audio src={audioUrl} className="hidden" ref={(el) => { if (el) { isPlayingAudio ? el.play() : el.pause(); el.onended = () => setIsPlayingAudio(false) } }} />
                        </div>
                    )}

                    {/* Controls - Inline */}
                    <div className="flex-1 space-y-3">
                        <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Controls</h4>

                        {/* Expression Scale */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-xs text-white/60">Expression</span>
                                <span className="text-xs text-[#EC4899]">{expressionScale.toFixed(1)}x</span>
                            </div>
                            <Slider
                                value={[expressionScale]}
                                onValueChange={([val]) => setExpressionScale(val)}
                                min={0.5} max={2.0} step={0.1}
                                className="[&_[role=slider]]:bg-[#EC4899] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3"
                            />
                        </div>

                        {/* Preprocess Toggle */}
                        <div className="flex rounded-md bg-[#0F0F12] p-0.5">
                            <button
                                onClick={() => setPreprocess("crop")}
                                className={cn("flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all", preprocess === "crop" ? "bg-[#EC4899] text-white" : "text-white/50")}
                            >Crop</button>
                            <button
                                onClick={() => setPreprocess("full")}
                                className={cn("flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all", preprocess === "full" ? "bg-[#EC4899] text-white" : "text-white/50")}
                            >Full</button>
                        </div>

                        {/* Still Mode */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/60">Still Mode</span>
                            <Switch checked={stillMode} onCheckedChange={setStillMode} className="scale-75 data-[state=checked]:bg-[#EC4899]" />
                        </div>

                        {/* Face Enhance - NEW */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[#EC4899]/5 to-transparent border border-[#EC4899]/10">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-[#EC4899]" />
                                <span className="text-xs text-white/80 font-medium">Face Enhance</span>
                            </div>
                            <Switch checked={enhanceFace} onCheckedChange={setEnhanceFace} className="scale-75 data-[state=checked]:bg-[#EC4899]" />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Result Preview (3 cols) - PREMIUM GLOW */}
                <div className="col-span-3 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#0D0D12] border border-white/10 p-4 flex flex-col gap-3 shadow-[0_0_15px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#EC4899]/20 hover:shadow-[0_0_25px_rgba(236,72,153,0.1)] transition-all duration-500">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-[#EC4899]/60" />
                        Result Preview
                    </h3>

                    <div className="flex-1 rounded-xl bg-gradient-to-br from-[#0F0F12] to-[#080810] border border-dashed border-[#EC4899]/10 flex flex-col items-center justify-center min-h-[120px] hover:border-[#EC4899]/30 transition-colors">
                        {resultVideoUrl ? (
                            <video src={resultVideoUrl} className="w-full h-full object-contain rounded-lg" autoPlay loop />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                    <Play className="w-5 h-5 text-white/20" />
                                </div>
                                <p className="text-xs text-white/30">Preview</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar - ULTIMATE CREATOR CTA */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#1A1A1F] via-[#1E1A25] to-[#1A1A1F] border border-[#EC4899]/20 flex-shrink-0 shadow-[0_-5px_30px_rgba(236,72,153,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div>
                    <p className="text-[10px] text-[#EC4899]/60 uppercase tracking-wider font-medium">Cost Estimation</p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">~{estimatedCost}K <span className="text-xs font-normal text-white/40">per 10s</span></p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={!sourceImage || !audioUrl || isGenerating}
                    className={cn(
                        "h-11 px-8 rounded-xl text-sm font-bold",
                        "bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#BE185D]",
                        "hover:from-[#F472B6] hover:via-[#EC4899] hover:to-[#DB2777]",
                        "disabled:opacity-50",
                        "shadow-[0_0_25px_rgba(236,72,153,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
                        "hover:shadow-[0_0_35px_rgba(236,72,153,0.5),0_6px_20px_rgba(0,0,0,0.4)]",
                        "transition-all duration-300 hover:scale-105"
                    )}
                >
                    {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <>Generate Lip Sync<Play className="w-4 h-4 ml-2" /></>}
                </Button>
            </div>
        </div>
    )
}
