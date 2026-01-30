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
    Settings2,
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
}

type GarmentType = "auto" | "tops" | "bottoms" | "one-pieces"
type QualityMode = "performance" | "balanced" | "quality"

const GARMENT_TYPES: { value: GarmentType; label: string; icon: string }[] = [
    { value: "auto", label: "Auto Detect", icon: "✨" },
    { value: "tops", label: "Tops", icon: "👕" },
    { value: "bottoms", label: "Bottoms", icon: "👖" },
    { value: "one-pieces", label: "One-Pieces", icon: "👗" },
]

const QUALITY_MODES: { value: QualityMode; label: string; icon: typeof Zap; description: string; time: string }[] = [
    { value: "performance", label: "Fast", icon: Zap, description: "Quick result", time: "~5s" },
    { value: "balanced", label: "Balanced", icon: Scale, description: "Best value", time: "~10s" },
    { value: "quality", label: "Quality", icon: Crown, description: "Best result", time: "~20s" },
]

// Sample garments for quick demo
const SAMPLE_GARMENTS = [
    { id: "1", name: "White T-Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { id: "2", name: "Blue Dress", type: "one-pieces" as GarmentType, url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { id: "3", name: "Black Jacket", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { id: "4", name: "Denim Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
]

// Sample model images for quick demo
const SAMPLE_MODELS = [
    { id: "m1", name: "Model 1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" },
    { id: "m2", name: "Model 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" },
    { id: "m3", name: "Model 3", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" },
]

const TIPS = [
    { icon: Camera, text: "Use a full-body, front-facing photo for best results" },
    { icon: Sun, text: "Good lighting helps AI understand body shape" },
    { icon: Maximize, text: "Flat-lay garment photos work better than folded" },
]

const BASE_COST = 75 // 75K points per sample

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
    const [qualityMode, setQualityMode] = useState<QualityMode>("balanced")
    const [numSamples, setNumSamples] = useState(1)
    const [seed, setSeed] = useState<number | null>(null)
    const [useSeed, setUseSeed] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [resultImages, setResultImages] = useState<string[]>([])
    const [selectedResultIndex, setSelectedResultIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [tipsOpen, setTipsOpen] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isDraggingModel, setIsDraggingModel] = useState(false)
    const [isDraggingGarment, setIsDraggingGarment] = useState(false)
    const [saved, setSaved] = useState(false)
    const [comparePosition, setComparePosition] = useState(50)
    const [showCompare, setShowCompare] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
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
        setGarmentImage(null)
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
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Shirt className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Virtual Try-on</h2>
                        <p className="text-sm text-white/50">See how clothes look on you with AI</p>
                    </div>
                </div>
                {/* Cost Badge */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-rose-500/10 border border-primary/30">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{totalCost}K Points</span>
                        {numSamples > 1 && (
                            <span className="text-xs text-white/40">({BASE_COST}K × {numSamples})</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="flex-1 overflow-hidden flex">
                {/* Column 1: Model Photo */}
                <div className="w-1/3 p-4 border-r border-white/10 flex flex-col">
                    <Label className="text-sm text-white/60 flex items-center gap-2 mb-3">
                        <User className="w-4 h-4" />
                        Your Photo (Full Body)
                    </Label>
                    <motion.div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                        onDragLeave={() => setIsDraggingModel(false)}
                        onDrop={handleDrop("model")}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                            "relative flex-1 min-h-[300px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                            modelImage
                                ? "border-primary/50 bg-primary/5"
                                : isDraggingModel
                                    ? "border-primary bg-primary/20 scale-[1.02]"
                                    : "border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/40"
                        )}
                    >
                        {modelImage ? (
                            <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                        ) : (
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                <motion.div
                                    animate={{ y: isDraggingModel ? -5 : 0 }}
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center mb-3"
                                >
                                    <Upload className="w-7 h-7 text-primary" />
                                </motion.div>
                                <span className="text-sm font-medium text-white/60">Drop or click to upload</span>
                                <span className="text-xs text-white/40 mt-1">Full body photo works best</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload("model")} className="hidden" />
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
                    {/* Sample Models */}
                    <div className="mt-3">
                        <Label className="text-xs text-white/40 mb-2 block">Or try samples:</Label>
                        <div className="flex gap-2">
                            {SAMPLE_MODELS.map((sample) => (
                                <motion.button
                                    key={sample.id}
                                    onClick={() => handleSampleClick("model", sample)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "flex-1 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all",
                                        modelImage === sample.url
                                            ? "border-primary ring-2 ring-primary/30"
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Garment Photo */}
                <div className="w-1/3 p-4 border-r border-white/10 flex flex-col">
                    <Label className="text-sm text-white/60 flex items-center gap-2 mb-3">
                        <Shirt className="w-4 h-4" />
                        Garment Photo
                    </Label>
                    <motion.div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                        onDragLeave={() => setIsDraggingGarment(false)}
                        onDrop={handleDrop("garment")}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                            "relative flex-1 min-h-[300px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                            garmentImage
                                ? "border-pink-500/50 bg-pink-500/5"
                                : isDraggingGarment
                                    ? "border-pink-500 bg-pink-500/20 scale-[1.02]"
                                    : "border-white/20 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/40"
                        )}
                    >
                        {garmentImage ? (
                            <img src={garmentImage} alt="Garment" className="w-full h-full object-cover" />
                        ) : (
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                <motion.div
                                    animate={{ y: isDraggingGarment ? -5 : 0 }}
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-3"
                                >
                                    <ImageIcon className="w-7 h-7 text-pink-400" />
                                </motion.div>
                                <span className="text-sm font-medium text-white/60">Drop or click to upload</span>
                                <span className="text-xs text-white/40 mt-1">Flat-lay or on-model photo</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload("garment")} className="hidden" />
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
                    {/* Sample Garments */}
                    <div className="mt-3">
                        <Label className="text-xs text-white/40 mb-2 block">Or try samples:</Label>
                        <div className="flex gap-2">
                            {SAMPLE_GARMENTS.map((sample) => (
                                <motion.button
                                    key={sample.id}
                                    onClick={() => handleSampleClick("garment", sample)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "flex-1 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all",
                                        garmentImage === sample.url
                                            ? "border-pink-500 ring-2 ring-pink-500/30"
                                            : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Settings + Result */}
                <div className="w-1/3 p-4 flex flex-col overflow-y-auto">
                    {/* Tips Section */}
                    <button
                        onClick={() => setTipsOpen(!tipsOpen)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors mb-4"
                    >
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-medium text-amber-200">Tips for Best Results</span>
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
                                className="overflow-hidden mb-4"
                            >
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                    {TIPS.map((tip, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                                <tip.icon className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <span className="text-xs text-white/70">{tip.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Settings */}
                    <div className="space-y-4">
                        {/* Garment Type */}
                        <div className="space-y-2">
                            <Label className="text-xs text-white/60">Garment Type</Label>
                            <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                                <SelectTrigger className="bg-white/5 border-white/10 backdrop-blur-sm h-9 text-sm">
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

                        {/* Quality Mode */}
                        <div className="space-y-2">
                            <Label className="text-xs text-white/60">Quality Mode</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {QUALITY_MODES.map((mode) => (
                                    <motion.button
                                        key={mode.value}
                                        onClick={() => setQualityMode(mode.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "p-2 rounded-xl border transition-all text-center",
                                            qualityMode === mode.value
                                                ? "bg-primary/20 border-primary/50 text-white"
                                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                                        )}
                                    >
                                        <mode.icon className={cn(
                                            "w-4 h-4 mx-auto mb-1",
                                            qualityMode === mode.value ? "text-primary" : "text-white/40"
                                        )} />
                                        <div className="text-xs font-medium">{mode.label}</div>
                                        <div className="text-[10px] text-white/40">{mode.time}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Number of Samples */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-white/60">Results</Label>
                                <span className="text-xs font-medium text-primary">{numSamples}x</span>
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

                        {/* Seed Control */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <button
                                onClick={() => setUseSeed(!useSeed)}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                    useSeed
                                        ? "bg-primary/20 border border-primary/50"
                                        : "bg-white/10 border border-white/10"
                                )}
                            >
                                <Lock className={cn("w-3 h-3", useSeed ? "text-primary" : "text-white/40")} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-white/80">Seed</div>
                            </div>
                            {useSeed && (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={seed || ""}
                                        onChange={(e) => setSeed(parseInt(e.target.value) || null)}
                                        placeholder="Auto"
                                        className="w-16 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/30"
                                    />
                                    <Button variant="ghost" size="icon" onClick={handleRandomSeed} className="h-7 w-7 text-white/60 hover:text-white">
                                        <Shuffle className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mt-4"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <motion.div className="mt-4" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                            onClick={handleGenerate}
                            disabled={!modelImage || !garmentImage || isGenerating}
                            className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-base font-bold shadow-lg shadow-pink-500/20 disabled:shadow-none"
                        >
                            {isGenerating ? (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">{LOADING_STEPS[loadingStep]}</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Try-on
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Result Display */}
                    <AnimatePresence>
                        {resultImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="mt-4 space-y-3"
                            >
                                {/* Result Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        {resultImages.length > 1 ? `${resultImages.length} Results` : "Result Ready!"}
                                    </h3>
                                    <div className="flex gap-1">
                                        {modelImage && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowCompare(!showCompare)}
                                                className={cn("h-7 text-xs text-white/60 hover:text-white", showCompare && "bg-white/10")}
                                            >
                                                <Scale className="w-3 h-3 mr-1" />
                                                Compare
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-white/60 hover:text-white">
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Reset
                                        </Button>
                                    </div>
                                </div>

                                {/* Multi-result thumbnails */}
                                {resultImages.length > 1 && (
                                    <div className="flex gap-2 justify-center">
                                        {resultImages.map((img, i) => (
                                            <motion.button
                                                key={i}
                                                onClick={() => setSelectedResultIndex(i)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={cn(
                                                    "w-12 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                                    selectedResultIndex === i
                                                        ? "border-primary ring-2 ring-primary/30"
                                                        : "border-white/20 hover:border-white/40"
                                                )}
                                            >
                                                <img src={img} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Result Image with Compare Slider */}
                                <motion.div
                                    ref={compareRef}
                                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl cursor-crosshair"
                                    whileHover={{ scale: 1.01 }}
                                    onMouseMove={showCompare ? handleCompareMove : undefined}
                                >
                                    {showCompare && modelImage ? (
                                        <>
                                            <div className="absolute inset-0">
                                                <img src={modelImage} alt="Before" className="w-full h-full object-cover" />
                                                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-[10px] text-white/80">Before</div>
                                            </div>
                                            <div
                                                className="absolute inset-0 overflow-hidden"
                                                style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                                            >
                                                <img src={currentResult} alt="After" className="w-full h-full object-cover" />
                                                <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 text-[10px] text-white/80">After</div>
                                            </div>
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                                                style={{ left: `${comparePosition}%` }}
                                            >
                                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                                                    <ChevronLeft className="w-2 h-2 text-black" />
                                                    <ChevronRight className="w-2 h-2 text-black" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img src={currentResult} alt="Try-on Result" className="w-full h-full object-cover" />
                                    )}
                                </motion.div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2">
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
