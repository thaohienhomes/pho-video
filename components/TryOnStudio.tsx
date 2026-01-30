"use client"

import { useState, useCallback, useRef } from "react"
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
    Zap,
    Scale,
    Crown,
    Shuffle,
    Lock,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Star,
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
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import confetti from "canvas-confetti"

interface TryOnStudioProps {
    className?: string
    onBackToModes?: () => void
}

type GarmentType = "auto" | "tops" | "bottoms" | "one-pieces"
type QualityMode = "performance" | "balanced" | "quality"

const GARMENT_TYPES: { value: GarmentType; label: string; icon: string }[] = [
    { value: "auto", label: "Auto Detect", icon: "✨" },
    { value: "tops", label: "Tops", icon: "👕" },
    { value: "bottoms", label: "Bottoms", icon: "👖" },
    { value: "one-pieces", label: "One-Pieces", icon: "👗" },
]

const QUALITY_MODES: { value: QualityMode; label: string; icon: typeof Zap; time: string }[] = [
    { value: "performance", label: "Fast", icon: Zap, time: "~5s" },
    { value: "balanced", label: "Balanced", icon: Scale, time: "~10s" },
    { value: "quality", label: "Quality", icon: Crown, time: "~20s" },
]

// Sample garments for quick demo
const SAMPLE_GARMENTS = [
    { id: "1", name: "White T-Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { id: "2", name: "Floral Dress", type: "one-pieces" as GarmentType, url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { id: "3", name: "Denim Jacket", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { id: "4", name: "Blue Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
]

// Sample model images for quick demo
const SAMPLE_MODELS = [
    { id: "m1", name: "Model 1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" },
    { id: "m2", name: "Model 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" },
    { id: "m3", name: "Model 3", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" },
]

const BASE_COST = 75 // 75K points per sample

const LOADING_STEPS = [
    "Analyzing your photo...",
    "Processing garment...",
    "Fitting clothes with AI...",
    "Rendering final result...",
]

export function TryOnStudio({ className, onBackToModes }: TryOnStudioProps) {
    const [modelImage, setModelImage] = useState<string | null>(null)
    const [garmentImage, setGarmentImage] = useState<string | null>(null)
    const [garmentType, setGarmentType] = useState<GarmentType>("auto")
    const [qualityMode, setQualityMode] = useState<QualityMode>("balanced")
    const [numSamples, setNumSamples] = useState(1)
    const [seed, setSeed] = useState<number | null>(null)
    const [useSeed, setUseSeed] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [resultImages, setResultImages] = useState<string[]>([])
    const [selectedResultIndex, setSelectedResultIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isDraggingModel, setIsDraggingModel] = useState(false)
    const [isDraggingGarment, setIsDraggingGarment] = useState(false)
    const [saved, setSaved] = useState(false)
    const [comparePosition, setComparePosition] = useState(50)
    const [showCompare, setShowCompare] = useState(false)
    const compareRef = useRef<HTMLDivElement>(null)

    const totalCost = BASE_COST * numSamples

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

    // Handle sample click
    const handleSampleClick = (type: "model" | "garment", sample: { url: string; name: string; type?: GarmentType }) => {
        if (type === "model") {
            setModelImage(sample.url)
        } else {
            setGarmentImage(sample.url)
            if (sample.type) setGarmentType(sample.type)
        }
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
        setResultImages([])
        setLoadingStep(0)
        setSaved(false)
        setShowCompare(false)

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
                    mode: qualityMode,
                    numSamples,
                    ...(useSeed && seed !== null && { seed }),
                }),
            })

            clearInterval(stepInterval)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Try-on generation failed")
            }

            setResultImages(data.imageUrls || [])
            setSelectedResultIndex(0)

            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ["#F0421C", "#EC4899", "#ffffff"],
            })
            toast.success(`Generated ${data.imageUrls?.length || 1} result(s)! 🎉`, {
                description: `Used ${totalCost}K Phở Points`,
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
    const handleDownload = (index?: number) => {
        const imgUrl = resultImages[index ?? selectedResultIndex]
        if (!imgUrl) return
        const link = document.createElement("a")
        link.href = imgUrl
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
        setResultImages([])
        setError(null)
        setShowCompare(false)
    }

    // Random seed
    const handleRandomSeed = () => {
        setSeed(Math.floor(Math.random() * 1000000))
    }

    // Compare slider mouse move
    const handleCompareMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!compareRef.current) return
        const rect = compareRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        setComparePosition((x / rect.width) * 100)
    }

    const currentResult = resultImages[selectedResultIndex]

    return (
        <div className={cn("h-full flex flex-col", className)}>
            {/* Compact Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                {/* Back Button */}
                <motion.button
                    onClick={onBackToModes}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Modes</span>
                </motion.button>

                {/* Title */}
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Shirt className="w-5 h-5 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white">Virtual Try-on</h2>
                </div>

                {/* Cost Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-rose-500/20 border border-primary/30">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm font-bold text-primary">{totalCost}K Points</span>
                </div>
            </div>

            {/* Main Content - 2 Columns */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                    {/* Left Column - Model Photo */}
                    <div className="flex-1 flex flex-col">
                        <Label className="text-sm text-white/60 flex items-center gap-2 mb-3">
                            <User className="w-4 h-4" />
                            Your Photo
                        </Label>
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                            onDragLeave={() => setIsDraggingModel(false)}
                            onDrop={handleDrop("model")}
                            whileHover={{ scale: 1.005 }}
                            className={cn(
                                "relative flex-1 min-h-[280px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                                modelImage
                                    ? "border-pink-500/50 bg-pink-500/5"
                                    : isDraggingModel
                                        ? "border-pink-500 bg-pink-500/20 scale-[1.01]"
                                        : "border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:border-white/40"
                            )}
                        >
                            {modelImage ? (
                                <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <motion.div
                                        animate={{ y: isDraggingModel ? -8 : 0, scale: isDraggingModel ? 1.1 : 1 }}
                                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4 border border-pink-500/30"
                                    >
                                        <Upload className="w-8 h-8 text-pink-400" />
                                    </motion.div>
                                    <span className="text-base font-medium text-white/70">Drop or click to upload</span>
                                    <span className="text-sm text-white/40 mt-1">Full body photo works best</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("model")} className="hidden" />
                                </label>
                            )}
                            {modelImage && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setModelImage(null)}
                                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/80 transition-colors"
                                >
                                    ✕
                                </motion.button>
                            )}
                        </motion.div>
                        {/* Sample Models */}
                        <div className="mt-4">
                            <Label className="text-xs text-white/40 mb-2 block">Or try samples:</Label>
                            <div className="flex gap-3">
                                {SAMPLE_MODELS.map((sample) => (
                                    <motion.button
                                        key={sample.id}
                                        onClick={() => handleSampleClick("model", sample)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "flex-1 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shadow-lg",
                                            modelImage === sample.url
                                                ? "border-pink-500 ring-2 ring-pink-500/30 shadow-pink-500/20"
                                                : "border-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Garment Photo */}
                    <div className="flex-1 flex flex-col">
                        <Label className="text-sm text-white/60 flex items-center gap-2 mb-3">
                            <Shirt className="w-4 h-4" />
                            Garment Photo
                        </Label>
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                            onDragLeave={() => setIsDraggingGarment(false)}
                            onDrop={handleDrop("garment")}
                            whileHover={{ scale: 1.005 }}
                            className={cn(
                                "relative flex-1 min-h-[280px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                                garmentImage
                                    ? "border-orange-500/50 bg-orange-500/5"
                                    : isDraggingGarment
                                        ? "border-orange-500 bg-orange-500/20 scale-[1.01]"
                                        : "border-white/20 bg-gradient-to-br from-white/5 to-transparent hover:border-white/40"
                            )}
                        >
                            {garmentImage ? (
                                <img src={garmentImage} alt="Garment" className="w-full h-full object-cover" />
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <motion.div
                                        animate={{ y: isDraggingGarment ? -8 : 0, scale: isDraggingGarment ? 1.1 : 1 }}
                                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center mb-4 border border-orange-500/30"
                                    >
                                        <Shirt className="w-8 h-8 text-orange-400" />
                                    </motion.div>
                                    <span className="text-base font-medium text-white/70">Drop or click to upload</span>
                                    <span className="text-sm text-white/40 mt-1">Flat lay or on-model photo</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("garment")} className="hidden" />
                                </label>
                            )}
                            {garmentImage && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setGarmentImage(null)}
                                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/80 transition-colors"
                                >
                                    ✕
                                </motion.button>
                            )}
                        </motion.div>
                        {/* Sample Garments */}
                        <div className="mt-4">
                            <Label className="text-xs text-white/40 mb-2 block">Or try samples:</Label>
                            <div className="flex gap-3">
                                {SAMPLE_GARMENTS.map((sample) => (
                                    <motion.button
                                        key={sample.id}
                                        onClick={() => handleSampleClick("garment", sample)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "flex-1 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shadow-lg",
                                            garmentImage === sample.url
                                                ? "border-orange-500 ring-2 ring-orange-500/30 shadow-orange-500/20"
                                                : "border-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result Display (when generated) */}
                <AnimatePresence>
                    {resultImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mx-6 mb-4 overflow-hidden"
                        >
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        {resultImages.length > 1 ? `${resultImages.length} Results Generated!` : "Result Ready!"}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-white/60 hover:text-white">
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            New Try-on
                                        </Button>
                                    </div>
                                </div>
                                {/* Result Thumbnails */}
                                <div className="flex gap-3 items-center">
                                    {resultImages.map((img, i) => (
                                        <motion.div
                                            key={i}
                                            ref={i === selectedResultIndex ? compareRef : undefined}
                                            onClick={() => {
                                                setSelectedResultIndex(i)
                                                setShowCompare(!showCompare)
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            className={cn(
                                                "relative h-32 aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                                                selectedResultIndex === i
                                                    ? "border-green-500 ring-2 ring-green-500/30"
                                                    : "border-white/20 hover:border-white/40"
                                            )}
                                            onMouseMove={showCompare && selectedResultIndex === i ? handleCompareMove : undefined}
                                        >
                                            {showCompare && selectedResultIndex === i && modelImage ? (
                                                <>
                                                    <img src={modelImage} alt="Before" className="w-full h-full object-cover" />
                                                    <div
                                                        className="absolute inset-0 overflow-hidden"
                                                        style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                                                    >
                                                        <img src={img} alt="After" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div
                                                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                                                        style={{ left: `${comparePosition}%` }}
                                                    />
                                                </>
                                            ) : (
                                                <img src={img} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                                            )}
                                        </motion.div>
                                    ))}
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 ml-auto">
                                        <Button onClick={() => handleDownload()} size="sm" className="bg-primary hover:bg-primary/90 h-8 text-xs">
                                            <Download className="w-3 h-3 mr-1" />
                                            Download
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleShare} className="border-white/20 hover:bg-white/10 h-8 text-xs">
                                            <Share2 className="w-3 h-3 mr-1" />
                                            Share
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSave}
                                            disabled={saved}
                                            className={cn(
                                                "h-8 text-xs border-white/20",
                                                saved ? "bg-green-500/20 border-green-500/50 text-green-400" : "hover:bg-white/10"
                                            )}
                                        >
                                            {saved ? <><Check className="w-3 h-3 mr-1" /> Saved</> : <><BookmarkPlus className="w-3 h-3 mr-1" /> Save</>}
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-white/40 mt-2">Click result to compare before/after</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mx-6 mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Settings Bar */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-gradient-to-r from-white/[0.02] to-white/[0.05] backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        {/* Garment Type */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] text-white/40 uppercase tracking-wider">Garment Type</Label>
                            <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 backdrop-blur-sm h-9 text-sm">
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

                        {/* Divider */}
                        <div className="h-10 w-px bg-white/10" />

                        {/* Quality Mode */}
                        <div className="flex flex-col gap-1">
                            <Label className="text-[10px] text-white/40 uppercase tracking-wider">Quality Mode</Label>
                            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                                {QUALITY_MODES.map((mode) => (
                                    <motion.button
                                        key={mode.value}
                                        onClick={() => setQualityMode(mode.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                                            qualityMode === mode.value
                                                ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                : "text-white/50 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <mode.icon className="w-3 h-3" />
                                        {mode.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-10 w-px bg-white/10" />

                        {/* Results Slider */}
                        <div className="flex flex-col gap-1 w-32">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-white/40 uppercase tracking-wider">Results</Label>
                                <span className="text-xs font-bold text-primary">{numSamples}x</span>
                            </div>
                            <Slider
                                value={[numSamples]}
                                onValueChange={([v]) => setNumSamples(v)}
                                min={1}
                                max={4}
                                step={1}
                                className="py-1"
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-10 w-px bg-white/10" />

                        {/* Seed Control */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                onClick={() => setUseSeed(!useSeed)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all border",
                                    useSeed
                                        ? "bg-primary/20 border-primary/50 text-primary"
                                        : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30"
                                )}
                            >
                                <Lock className="w-4 h-4" />
                            </motion.button>
                            {useSeed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex items-center gap-1"
                                >
                                    <input
                                        type="text"
                                        value={seed || ""}
                                        onChange={(e) => setSeed(parseInt(e.target.value) || null)}
                                        placeholder="Seed"
                                        className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/20 text-xs text-white placeholder:text-white/30"
                                    />
                                    <Button variant="ghost" size="icon" onClick={handleRandomSeed} className="h-7 w-7 text-white/60 hover:text-white">
                                        <Shuffle className="w-3 h-3" />
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Generate Button */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleGenerate}
                                disabled={!modelImage || !garmentImage || isGenerating}
                                className="h-11 px-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-base font-bold shadow-lg shadow-pink-500/30 disabled:shadow-none"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{LOADING_STEPS[loadingStep]}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Try-on
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
