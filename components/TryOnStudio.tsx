"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    Shirt,
    User,
    Sparkles,
    Download,
    Loader2,
    AlertCircle,
    ImageIcon,
    Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import confetti from "canvas-confetti"

interface TryOnStudioProps {
    className?: string
}

type GarmentType = "auto" | "tops" | "bottoms" | "one-pieces"

const GARMENT_TYPES: { value: GarmentType; label: string; icon: string }[] = [
    { value: "auto", label: "Auto Detect", icon: "✨" },
    { value: "tops", label: "Tops", icon: "👕" },
    { value: "bottoms", label: "Bottoms", icon: "👖" },
    { value: "one-pieces", label: "One-Pieces", icon: "👗" },
]

const TRYON_COST = 75 // 75K points

export function TryOnStudio({ className }: TryOnStudioProps) {
    const [modelImage, setModelImage] = useState<string | null>(null)
    const [garmentImage, setGarmentImage] = useState<string | null>(null)
    const [garmentType, setGarmentType] = useState<GarmentType>("auto")
    const [isGenerating, setIsGenerating] = useState(false)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Handle file upload
    const handleFileUpload = useCallback(
        (type: "model" | "garment") => (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file")
                return
            }

            const reader = new FileReader()
            reader.onload = () => {
                const base64 = reader.result as string
                if (type === "model") {
                    setModelImage(base64)
                } else {
                    setGarmentImage(base64)
                }
            }
            reader.readAsDataURL(file)
        },
        []
    )

    // Handle drop
    const handleDrop = useCallback(
        (type: "model" | "garment") => (e: React.DragEvent) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (!file?.type.startsWith("image/")) return

            const reader = new FileReader()
            reader.onload = () => {
                const base64 = reader.result as string
                if (type === "model") {
                    setModelImage(base64)
                } else {
                    setGarmentImage(base64)
                }
            }
            reader.readAsDataURL(file)
        },
        []
    )

    // Generate try-on
    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) {
            toast.error("Please upload both model and garment images")
            return
        }

        setIsGenerating(true)
        setError(null)
        setResultImage(null)

        try {
            const response = await fetch("/api/ai/try-on", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelImageUrl: modelImage,
                    garmentImageUrl: garmentImage,
                    garmentType,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Try-on generation failed")
            }

            setResultImage(data.imageUrl)
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { y: 0.8 },
                colors: ["#F0421C", "#ffffff"],
            })
            toast.success("Virtual try-on complete!", {
                description: `Used ${TRYON_COST}K Phở Points`,
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : "Generation failed"
            setError(message)
            toast.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    // Download result
    const handleDownload = () => {
        if (!resultImage) return
        const link = document.createElement("a")
        link.href = resultImage
        link.download = `pho-tryon-${Date.now()}.png`
        link.click()
    }

    return (
        <div className={cn("h-full flex flex-col", className)}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Virtual Try-on</h2>
                        <p className="text-sm text-white/50">
                            See how clothes look on you with AI
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Upload Zones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Model Image Upload */}
                        <div className="space-y-3">
                            <Label className="text-sm text-white/60 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Photo (Full Body)
                            </Label>
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop("model")}
                                className={cn(
                                    "relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                                    modelImage
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                                )}
                            >
                                {modelImage ? (
                                    <img
                                        src={modelImage}
                                        alt="Model"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                        <Upload className="w-8 h-8 text-white/40 mb-2" />
                                        <span className="text-sm text-white/40">
                                            Drop or click to upload
                                        </span>
                                        <span className="text-xs text-white/30 mt-1">
                                            Full body photo works best
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload("model")}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {modelImage && (
                                    <button
                                        onClick={() => setModelImage(null)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/60 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Garment Image Upload */}
                        <div className="space-y-3">
                            <Label className="text-sm text-white/60 flex items-center gap-2">
                                <Shirt className="w-4 h-4" />
                                Garment Photo
                            </Label>
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop("garment")}
                                className={cn(
                                    "relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                                    garmentImage
                                        ? "border-pink-500/50 bg-pink-500/5"
                                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                                )}
                            >
                                {garmentImage ? (
                                    <img
                                        src={garmentImage}
                                        alt="Garment"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                        <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
                                        <span className="text-sm text-white/40">
                                            Drop or click to upload
                                        </span>
                                        <span className="text-xs text-white/30 mt-1">
                                            Flat-lay or on-model photo
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload("garment")}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {garmentImage && (
                                    <button
                                        onClick={() => setGarmentImage(null)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/60 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Garment Type Selector */}
                    <div className="space-y-3">
                        <Label className="text-sm text-white/60">Garment Type</Label>
                        <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GARMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cost Badge */}
                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="text-sm text-white/60">Cost:</span>
                        <span className="text-lg font-bold text-primary">{TRYON_COST}K Points</span>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={!modelImage || !garmentImage || isGenerating}
                        className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-lg font-bold"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Try-on
                            </>
                        )}
                    </Button>

                    {/* Result Display */}
                    <AnimatePresence>
                        {resultImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-4"
                            >
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                                    <img
                                        src={resultImage}
                                        alt="Try-on Result"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <Button
                                    onClick={handleDownload}
                                    className="w-full bg-primary hover:bg-primary/90"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Result
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
