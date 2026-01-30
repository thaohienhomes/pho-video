"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    Shirt,
    Sparkles,
    Download,
    Loader2,
    AlertCircle,
    RefreshCw,
    Shuffle,
    Lock,
    ArrowLeft,
    Star,
    Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

const GARMENT_TYPES = [
    { value: "auto", label: "Auto Detect", icon: "✨" },
    { value: "tops", label: "Tops", icon: "👕" },
    { value: "bottoms", label: "Bottoms", icon: "👖" },
    { value: "one-pieces", label: "One-Pieces", icon: "👗" },
]

const QUALITY_MODES = [
    { value: "performance", label: "Fast" },
    { value: "balanced", label: "Balanced" },
    { value: "quality", label: "Quality" },
]

const SAMPLE_GARMENTS = [
    { id: "1", name: "White T-Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { id: "2", name: "Floral Dress", type: "one-pieces" as GarmentType, url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { id: "3", name: "Denim Jacket", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { id: "4", name: "Blue Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
]

const SAMPLE_MODELS = [
    { id: "m1", name: "Model 1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400" },
    { id: "m2", name: "Model 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" },
    { id: "m3", name: "Model 3", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" },
]

const BASE_COST = 75
const LOADING_STEPS = ["Analyzing your photo...", "Processing garment...", "Fitting clothes with AI...", "Rendering final result..."]

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

    const totalCost = BASE_COST * numSamples

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
                if (type === "model") setModelImage(reader.result as string)
                else {
                    setGarmentImage(reader.result as string)
                    setGarmentType("auto")
                }
            }
            reader.readAsDataURL(file)
        },
        []
    )

    const handleDrop = useCallback(
        (type: "model" | "garment") => (e: React.DragEvent) => {
            e.preventDefault()
            if (type === "model") setIsDraggingModel(false)
            else setIsDraggingGarment(false)
            const file = e.dataTransfer.files[0]
            if (!file?.type.startsWith("image/")) return
            const reader = new FileReader()
            reader.onload = () => {
                if (type === "model") setModelImage(reader.result as string)
                else {
                    setGarmentImage(reader.result as string)
                    setGarmentType("auto")
                }
            }
            reader.readAsDataURL(file)
        },
        []
    )

    const handleSampleClick = (type: "model" | "garment", sample: { url: string; name: string; type?: GarmentType }) => {
        if (type === "model") setModelImage(sample.url)
        else {
            setGarmentImage(sample.url)
            if (sample.type) setGarmentType(sample.type)
        }
    }

    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) {
            toast.error("Please upload both model and garment images")
            return
        }
        setIsGenerating(true)
        setError(null)
        setResultImages([])
        setLoadingStep(0)

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
            if (!response.ok) throw new Error(data.error || "Try-on generation failed")
            setResultImages(data.imageUrls || [])
            setSelectedResultIndex(0)
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#F0421C", "#EC4899", "#ffffff"] })
            toast.success(`Generated ${data.imageUrls?.length || 1} result(s)! 🎉`)
        } catch (err) {
            clearInterval(stepInterval)
            const message = err instanceof Error ? err.message : "Generation failed"
            setError(message)
            toast.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        const imgUrl = resultImages[selectedResultIndex]
        if (!imgUrl) return
        const link = document.createElement("a")
        link.href = imgUrl
        link.download = `pho-tryon-${Date.now()}.png`
        link.click()
        toast.success("Image downloaded!")
    }

    const handleRandomSeed = () => setSeed(Math.floor(Math.random() * 1000000))

    return (
        <div className={cn("h-full flex flex-col bg-[#0A0A0A] overflow-hidden", className)}>
            {/* ========== COMPACT HEADER (h-14) ========== */}
            <div className="flex-shrink-0 h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[#0D0D0D]/50 backdrop-blur-sm">
                <motion.button
                    onClick={onBackToModes}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white text-xs font-medium"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </motion.button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <Shirt className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight">Virtual Try-on</h1>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-xs font-bold text-primary">{totalCost}K</span>
                </div>
            </div>

            {/* ========== MAIN CONTENT (Flexible Height) ========== */}
            <div className="flex-1 min-h-0 p-4 flex gap-4 overflow-hidden">
                {/* ===== LEFT: MODEL ===== */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 relative group">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <h2 className="text-sm font-semibold text-white/90">Your Photo</h2>
                        {modelImage && (
                            <button onClick={() => setModelImage(null)} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                        )}
                    </div>

                    {/* Upload Zone - Flexible Height */}
                    <motion.div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                        onDragLeave={() => setIsDraggingModel(false)}
                        onDrop={handleDrop("model")}
                        className={cn(
                            "flex-1 min-h-0 relative rounded-xl overflow-hidden transition-all border-2 border-dashed flex flex-col items-center justify-center",
                            modelImage ? "border-pink-500/30 bg-black/40" :
                                isDraggingModel ? "border-pink-500 bg-pink-500/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                        )}
                    >
                        {modelImage ? (
                            <img src={modelImage} alt="Model" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-pink-500/20 group-hover:scale-110 transition-all">
                                    <Upload className="w-6 h-6 text-white/40 group-hover:text-pink-400 transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-white/60">Upload Photo</span>
                                <span className="text-xs text-white/30 mt-1">Full body (3:4)</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload("model")} className="hidden" />
                            </label>
                        )}
                    </motion.div>

                    {/* Compact Samples Row */}
                    <div className="h-16 mt-3 flex-shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
                        <span className="text-xs text-white/30 font-medium whitespace-nowrap">Presets:</span>
                        {SAMPLE_MODELS.map((sample) => (
                            <button
                                key={sample.id}
                                onClick={() => handleSampleClick("model", sample)}
                                className={cn(
                                    "h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden border transition-all",
                                    modelImage === sample.url ? "border-pink-500 ring-1 ring-pink-500/50" : "border-white/10 opacity-60 hover:opacity-100"
                                )}
                            >
                                <img src={sample.url} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== RIGHT: GARMENT ===== */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 relative group">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <h2 className="text-sm font-semibold text-white/90">Garment Photo</h2>
                        {garmentImage && (
                            <button onClick={() => setGarmentImage(null)} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                        )}
                    </div>

                    {/* Upload Zone */}
                    <motion.div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                        onDragLeave={() => setIsDraggingGarment(false)}
                        onDrop={handleDrop("garment")}
                        className={cn(
                            "flex-1 min-h-0 relative rounded-xl overflow-hidden transition-all border-2 border-dashed flex flex-col items-center justify-center",
                            garmentImage ? "border-orange-500/30 bg-black/40" :
                                isDraggingGarment ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                        )}
                    >
                        {garmentImage ? (
                            <img src={garmentImage} alt="Garment" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all">
                                    <Shirt className="w-6 h-6 text-white/40 group-hover:text-orange-400 transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-white/60">Upload Garment</span>
                                <span className="text-xs text-white/30 mt-1">Flat lay (3:4)</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload("garment")} className="hidden" />
                            </label>
                        )}
                    </motion.div>

                    {/* Compact Samples Row */}
                    <div className="h-16 mt-3 flex-shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
                        <span className="text-xs text-white/30 font-medium whitespace-nowrap">Presets:</span>
                        {SAMPLE_GARMENTS.map((sample) => (
                            <button
                                key={sample.id}
                                onClick={() => handleSampleClick("garment", sample)}
                                className={cn(
                                    "h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden border transition-all",
                                    garmentImage === sample.url ? "border-orange-500 ring-1 ring-orange-500/50" : "border-white/10 opacity-60 hover:opacity-100"
                                )}
                            >
                                <img src={sample.url} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== RESULT OVERLAY (Animate In) ===== */}
                <AnimatePresence>
                    {resultImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-4 z-50 bg-[#0A0A0A]/95 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-green-400" />
                                    Result Ready!
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setResultImages([])} className="hover:bg-white/10">✕ Close</Button>
                            </div>

                            <div className="flex-1 flex gap-6 min-h-0">
                                <div className="flex-1 bg-black/50 rounded-xl overflow-hidden border border-white/10 p-2 flex items-center justify-center">
                                    <img src={resultImages[selectedResultIndex]} className="max-w-full max-h-full object-contain rounded-lg" />
                                </div>
                                <div className="w-64 flex flex-col gap-3">
                                    <h3 className="text-sm font-medium text-white/60">Variations</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {resultImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedResultIndex(i)}
                                                className={cn(
                                                    "aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all",
                                                    selectedResultIndex === i ? "border-green-500" : "border-white/10 hover:border-white/30"
                                                )}
                                            >
                                                <img src={img} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-auto space-y-2">
                                        <Button onClick={handleDownload} className="w-full bg-white text-black hover:bg-white/90">
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ========== BOTTOM CONTROL BAR (Compact) ========== */}
            <div className="flex-shrink-0 h-16 bg-[#0D0D0D] border-t border-white/5 px-6 flex items-center gap-6 z-10">
                {/* Garment Type */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Garment Type</label>
                    <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                        <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {GARMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-px h-8 bg-white/5" />

                {/* Quality */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Quality</label>
                    <div className="flex bg-white/5 rounded-md p-0.5 border border-white/10">
                        {QUALITY_MODES.map(m => (
                            <button
                                key={m.value}
                                onClick={() => setQualityMode(m.value as QualityMode)}
                                className={cn(
                                    "px-3 py-1 rounded text-[10px] font-medium transition-all",
                                    qualityMode === m.value ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-8 bg-white/5" />

                {/* Samples Count */}
                <div className="flex flex-col gap-1 w-24">
                    <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Count</label>
                        <span className="text-[10px] text-primary font-bold">{numSamples}</span>
                    </div>
                    <Slider value={[numSamples]} onValueChange={([v]) => setNumSamples(v)} min={1} max={4} step={1} className="h-4" />
                </div>

                <div className="flex-1" />

                {/* Generate Button (Prominent) */}
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !modelImage || !garmentImage}
                    className="h-10 px-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-900/20 text-sm font-semibold"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGenerating ? "Processing..." : "Generate Try-on"}
                </Button>
            </div>
        </div>
    )
}
