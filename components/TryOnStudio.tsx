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
    Lightbulb,
    ChevronDown,
    RefreshCw,
    Share2,
    BookmarkPlus,
    Check,
    Camera,
    Sun,
    Maximize,
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

// Sample garments for quick demo
const SAMPLE_GARMENTS = [
    { id: "1", name: "White T-Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { id: "2", name: "Blue Dress", type: "one-pieces" as GarmentType, url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { id: "3", name: "Black Jacket", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { id: "4", name: "Denim Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
]

const TIPS = [
    { icon: Camera, text: "Use a full-body, front-facing photo for best results" },
    { icon: Sun, text: "Good lighting helps AI understand body shape" },
    { icon: Maximize, text: "Flat-lay garment photos work better than folded" },
]

const TRYON_COST = 75 // 75K points

const LOADING_STEPS = [
    "Analyzing your photo...",
    "Processing garment...",
    "Fitting clothes with AI...",
    "Rendering final result...",
]

export function TryOnStudio({ className }: TryOnStudioProps) {
    const [modelImage, setModelImage] = useState<string | null>(null)
    const [garmentImage, setGarmentImage] = useState<string | null>(null)
    const [garmentType, setGarmentType] = useState<GarmentType>("auto")
    const [isGenerating, setIsGenerating] = useState(false)
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [tipsOpen, setTipsOpen] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isDraggingModel, setIsDraggingModel] = useState(false)
    const [isDraggingGarment, setIsDraggingGarment] = useState(false)
    const [saved, setSaved] = useState(false)

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
                    setGarmentType("auto")
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
            if (type === "model") setIsDraggingModel(false)
            else setIsDraggingGarment(false)

            const file = e.dataTransfer.files[0]
            if (!file?.type.startsWith("image/")) return

            const reader = new FileReader()
            reader.onload = () => {
                const base64 = reader.result as string
                if (type === "model") {
                    setModelImage(base64)
                } else {
                    setGarmentImage(base64)
                    setGarmentType("auto")
                }
            }
            reader.readAsDataURL(file)
        },
        []
    )

    // Handle sample garment click
    const handleSampleClick = (sample: typeof SAMPLE_GARMENTS[0]) => {
        setGarmentImage(sample.url)
        setGarmentType(sample.type)
        toast.success(`Selected ${sample.name}`)
    }

    // Generate try-on
    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) {
            toast.error("Please upload both model and garment images")
            return
        }

        setIsGenerating(true)
        setError(null)
        setResultImage(null)
        setLoadingStep(0)
        setSaved(false)

        // Simulate loading steps
        const stepInterval = setInterval(() => {
            setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
        }, 5000)

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

            clearInterval(stepInterval)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Try-on generation failed")
            }

            setResultImage(data.imageUrl)
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ["#F0421C", "#EC4899", "#ffffff"],
            })
            toast.success("Virtual try-on complete! 🎉", {
                description: `Used ${TRYON_COST}K Phở Points`,
            })
        } catch (err) {
            clearInterval(stepInterval)
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
        toast.success("Image downloaded!")
    }

    // Share to community (placeholder)
    const handleShare = () => {
        toast.success("Sharing feature coming soon!", {
            description: "Your try-on will be visible to the community",
        })
    }

    // Save to gallery (placeholder)
    const handleSave = () => {
        setSaved(true)
        toast.success("Saved to your gallery!")
    }

    // Try another
    const handleReset = () => {
        setResultImage(null)
        setGarmentImage(null)
        setError(null)
    }

    return (
        <div className={cn("h-full flex flex-col", className)}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Shirt className="w-5 h-5 text-white" />
                    </motion.div>
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

                    {/* Tips Section */}
                    <div>
                        <button
                            onClick={() => setTipsOpen(!tipsOpen)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                                <span className="text-sm font-medium text-amber-200">Tips for Best Results</span>
                            </div>
                            <motion.div animate={{ rotate: tipsOpen ? 180 : 0 }}>
                                <ChevronDown className="w-4 h-4 text-amber-400" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {tipsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                        {TIPS.map((tip, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                                    <tip.icon className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <span className="text-sm text-white/70">{tip.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Upload Zones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Model Image Upload */}
                        <div className="space-y-3">
                            <Label className="text-sm text-white/60 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Photo (Full Body)
                            </Label>
                            <motion.div
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                                onDragLeave={() => setIsDraggingModel(false)}
                                onDrop={handleDrop("model")}
                                whileHover={{ scale: 1.01 }}
                                className={cn(
                                    "relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                                    modelImage
                                        ? "border-primary/50 bg-primary/5"
                                        : isDraggingModel
                                            ? "border-primary bg-primary/20 scale-[1.02]"
                                            : "border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/40"
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
                                        <motion.div
                                            animate={{ y: isDraggingModel ? -5 : 0 }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center mb-3"
                                        >
                                            <Upload className="w-7 h-7 text-primary" />
                                        </motion.div>
                                        <span className="text-sm font-medium text-white/60">
                                            Drop or click to upload
                                        </span>
                                        <span className="text-xs text-white/40 mt-1">
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
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => setModelImage(null)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/80 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>

                        {/* Garment Image Upload */}
                        <div className="space-y-3">
                            <Label className="text-sm text-white/60 flex items-center gap-2">
                                <Shirt className="w-4 h-4" />
                                Garment Photo
                            </Label>
                            <motion.div
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                                onDragLeave={() => setIsDraggingGarment(false)}
                                onDrop={handleDrop("garment")}
                                whileHover={{ scale: 1.01 }}
                                className={cn(
                                    "relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                                    garmentImage
                                        ? "border-pink-500/50 bg-pink-500/5"
                                        : isDraggingGarment
                                            ? "border-pink-500 bg-pink-500/20 scale-[1.02]"
                                            : "border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/40"
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
                                        <motion.div
                                            animate={{ y: isDraggingGarment ? -5 : 0 }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-3"
                                        >
                                            <ImageIcon className="w-7 h-7 text-pink-400" />
                                        </motion.div>
                                        <span className="text-sm font-medium text-white/60">
                                            Drop or click to upload
                                        </span>
                                        <span className="text-xs text-white/40 mt-1">
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
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => setGarmentImage(null)}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/80 transition-colors"
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Sample Garments */}
                    <div className="space-y-3">
                        <Label className="text-sm text-white/60">Try Sample Garments</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {SAMPLE_GARMENTS.map((sample) => (
                                <motion.button
                                    key={sample.id}
                                    onClick={() => handleSampleClick(sample)}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all",
                                        garmentImage === sample.url
                                            ? "border-pink-500 ring-2 ring-pink-500/30"
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <img
                                        src={sample.url}
                                        alt={sample.name}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Garment Type Selector */}
                    <div className="space-y-3">
                        <Label className="text-sm text-white/60">Garment Type</Label>
                        <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                            <SelectTrigger className="bg-white/5 border-white/10 backdrop-blur-sm">
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
                    <motion.div
                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-rose-500/10 border border-primary/30"
                        whileHover={{ scale: 1.02 }}
                    >
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-sm text-white/60">Cost:</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                            {TRYON_COST}K Points
                        </span>
                    </motion.div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                            onClick={handleGenerate}
                            disabled={!modelImage || !garmentImage || isGenerating}
                            className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-lg font-bold shadow-lg shadow-pink-500/20 disabled:shadow-none"
                        >
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{LOADING_STEPS[loadingStep]}</span>
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {LOADING_STEPS.map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-colors",
                                                    i <= loadingStep ? "bg-white" : "bg-white/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Try-on
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Result Display */}
                    <AnimatePresence>
                        {resultImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="space-y-4"
                            >
                                {/* Result Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-400" />
                                        Result Ready!
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleReset}
                                        className="text-white/60 hover:text-white"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-1" />
                                        Try Another
                                    </Button>
                                </div>

                                {/* Result Image */}
                                <motion.div
                                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <img
                                        src={resultImage}
                                        alt="Try-on Result"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                </motion.div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        onClick={handleDownload}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="border-white/20 hover:bg-white/10"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={saved}
                                        className={cn(
                                            "border-white/20",
                                            saved ? "bg-green-500/20 border-green-500/50 text-green-400" : "hover:bg-white/10"
                                        )}
                                    >
                                        {saved ? (
                                            <><Check className="w-4 h-4 mr-2" /> Saved</>
                                        ) : (
                                            <><BookmarkPlus className="w-4 h-4 mr-2" /> Save</>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
