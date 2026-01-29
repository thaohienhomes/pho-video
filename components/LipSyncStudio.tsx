"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
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
    Upload,
    Mic,
    Play,
    Loader2,
    ImageIcon,
    AudioLines,
    Sparkles,
    Volume2,
    Download,
    Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LipSyncStudioProps {
    onComplete?: (videoUrl: string) => void
}

export function LipSyncStudio({ onComplete }: LipSyncStudioProps) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-pink-500/30 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Lip Sync / Talking Head</h2>
                    <p className="text-sm text-white/50">Transform portraits into talking videos</p>
                </div>
            </div>

            {/* Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div
                    {...imageDropzone.getRootProps()}
                    className={cn(
                        "relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer",
                        "hover:border-primary/50 hover:bg-primary/5",
                        imageDropzone.isDragActive ? "border-primary bg-primary/10" : "border-white/20",
                        sourceImage && "border-solid border-primary/30"
                    )}
                >
                    <input {...imageDropzone.getInputProps()} />
                    {sourceImage ? (
                        <img
                            src={sourceImage}
                            alt="Portrait"
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <ImageIcon className="w-10 h-10 text-white/30 mb-3" />
                            <p className="text-sm text-white/60 font-medium">Upload Portrait</p>
                            <p className="text-xs text-white/40 mt-1">Front-facing recommended</p>
                        </div>
                    )}
                </div>

                {/* Audio Upload */}
                <div
                    {...audioDropzone.getRootProps()}
                    className={cn(
                        "relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer",
                        "hover:border-primary/50 hover:bg-primary/5",
                        audioDropzone.isDragActive ? "border-primary bg-primary/10" : "border-white/20",
                        audioUrl && "border-solid border-primary/30"
                    )}
                >
                    <input {...audioDropzone.getInputProps()} />
                    {audioUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <AudioLines className="w-10 h-10 text-primary mb-3" />
                            <p className="text-sm text-white font-medium">{audioFile?.name}</p>
                            <p className="text-xs text-white/40 mt-1">{audioDuration}s duration</p>
                            <audio src={audioUrl} controls className="mt-3 w-full max-w-[200px]" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <Volume2 className="w-10 h-10 text-white/30 mb-3" />
                            <p className="text-sm text-white/60 font-medium">Upload Audio</p>
                            <p className="text-xs text-white/40 mt-1">MP3, WAV, M4A (max 30s)</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/10">
                <h3 className="text-sm font-medium text-white">Settings</h3>

                {/* Expression Scale */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs text-white/60">Expression Scale</Label>
                        <span className="text-xs text-primary">{expressionScale.toFixed(1)}</span>
                    </div>
                    <Slider
                        value={[expressionScale]}
                        onValueChange={([val]) => setExpressionScale(val)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-primary"
                    />
                </div>

                {/* Preprocess Mode */}
                <div className="space-y-2">
                    <Label className="text-xs text-white/60">Preprocess Mode</Label>
                    <Select value={preprocess} onValueChange={setPreprocess}>
                        <SelectTrigger className="bg-black/30 border-white/10 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="crop">Crop (Headshot)</SelectItem>
                            <SelectItem value="extcrop">Extended Crop</SelectItem>
                            <SelectItem value="resize">Resize</SelectItem>
                            <SelectItem value="full">Full Frame</SelectItem>
                            <SelectItem value="extfull">Extended Full</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={stillMode}
                            onCheckedChange={setStillMode}
                            className="data-[state=checked]:bg-primary"
                        />
                        <Label className="text-xs text-white/60">Still Mode</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={enhanceFace}
                            onCheckedChange={setEnhanceFace}
                            className="data-[state=checked]:bg-primary"
                        />
                        <Label className="text-xs text-white/60">Enhance Face</Label>
                    </div>
                </div>
            </div>

            {/* Cost & Generate */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/20 to-orange-500/10 border border-primary/30">
                <div>
                    <p className="text-sm text-white/60">Estimated Cost</p>
                    <p className="text-xl font-bold text-primary">{estimatedCost}K pts</p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={!sourceImage || !audioUrl || isGenerating}
                    className="bg-primary hover:bg-primary/90 px-6"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate
                        </>
                    )}
                </Button>
            </div>

            {/* Result */}
            {resultVideoUrl && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">Result</h3>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50">
                        <video
                            src={resultVideoUrl}
                            controls
                            autoPlay
                            loop
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resultVideoUrl, "_blank")}
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(resultVideoUrl)
                                toast.success("Link copied!")
                            }}
                        >
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
