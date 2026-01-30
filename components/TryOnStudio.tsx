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
        toast.success(`Selected ${sample.name}`)
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
        <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
            {/* ========== HEADER ========== */}
            <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
                {/* Back Button */}
                <motion.button
                    onClick={onBackToModes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] border border-white/20 hover:border-white/30 transition-all text-white/80 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Modes</span>
                </motion.button>

                {/* Title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                        <Shirt className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Virtual Try-on</h1>
                </div>

                {/* Cost Badge */}
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-lg shadow-primary/30">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-sm font-bold text-white">{totalCost}K Points</span>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="grid grid-cols-2 gap-6">
                    {/* ===== LEFT: YOUR PHOTO ===== */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D]">
                        <h2 className="text-lg font-bold text-white mb-4">Your Photo</h2>

                        {/* Upload Zone - PORTRAIT ASPECT 3:4 */}
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                            onDragLeave={() => setIsDraggingModel(false)}
                            onDrop={handleDrop("model")}
                            className={cn(
                                "relative aspect-[3/4] rounded-2xl overflow-hidden transition-all cursor-pointer",
                                "border-2 border-dashed",
                                modelImage
                                    ? "border-pink-500/60"
                                    : isDraggingModel
                                        ? "border-pink-500 bg-pink-500/10"
                                        : "border-pink-500/40 hover:border-pink-500/60"
                            )}
                            style={{
                                background: modelImage ? undefined : "radial-gradient(ellipse at center, rgba(236,72,153,0.15) 0%, transparent 70%)"
                            }}
                        >
                            {modelImage ? (
                                <>
                                    <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setModelImage(null)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 blur-2xl bg-pink-500/50 rounded-full scale-150" />
                                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/40 to-rose-500/40 border border-pink-500/60 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-pink-400" />
                                        </div>
                                    </div>
                                    <span className="text-white/80 font-medium">Drop or click</span>
                                    <span className="text-white/80 font-medium">to upload</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("model")} className="hidden" />
                                </label>
                            )}
                        </motion.div>

                        {/* Samples */}
                        <p className="text-sm text-white/50 mt-5 mb-3">Or try samples:</p>
                        <div className="grid grid-cols-3 gap-3">
                            {SAMPLE_MODELS.map((sample) => (
                                <motion.button
                                    key={sample.id}
                                    onClick={() => handleSampleClick("model", sample)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        "aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                                        modelImage === sample.url
                                            ? "border-pink-500 ring-2 ring-pink-500/40"
                                            : "border-pink-500/30 hover:border-pink-500/60"
                                    )}
                                >
                                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* ===== RIGHT: GARMENT PHOTO ===== */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-[#0D0D0D]">
                        <h2 className="text-lg font-bold text-white mb-4">Garment Photo</h2>

                        {/* Upload Zone - PORTRAIT ASPECT 3:4 */}
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                            onDragLeave={() => setIsDraggingGarment(false)}
                            onDrop={handleDrop("garment")}
                            className={cn(
                                "relative aspect-[3/4] rounded-2xl overflow-hidden transition-all cursor-pointer",
                                "border-2 border-dashed",
                                garmentImage
                                    ? "border-orange-500/60"
                                    : isDraggingGarment
                                        ? "border-orange-500 bg-orange-500/10"
                                        : "border-orange-500/40 hover:border-orange-500/60"
                            )}
                            style={{
                                background: garmentImage ? undefined : "radial-gradient(ellipse at center, rgba(249,115,22,0.15) 0%, transparent 70%)"
                            }}
                        >
                            {garmentImage ? (
                                <>
                                    <img src={garmentImage} alt="Garment" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setGarmentImage(null)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 blur-2xl bg-orange-500/50 rounded-full scale-150" />
                                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/40 to-rose-500/40 border border-orange-500/60 flex items-center justify-center">
                                            <Shirt className="w-8 h-8 text-orange-400" />
                                        </div>
                                    </div>
                                    <span className="text-white/80 font-medium">Drop or click</span>
                                    <span className="text-white/80 font-medium">to upload</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("garment")} className="hidden" />
                                </label>
                            )}
                        </motion.div>

                        {/* Samples */}
                        <p className="text-sm text-white/50 mt-5 mb-3">Or try samples:</p>
                        <div className="grid grid-cols-4 gap-3">
                            {SAMPLE_GARMENTS.map((sample) => (
                                <motion.button
                                    key={sample.id}
                                    onClick={() => handleSampleClick("garment", sample)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        "aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                                        garmentImage === sample.url
                                            ? "border-orange-500 ring-2 ring-orange-500/40"
                                            : "border-orange-500/30 hover:border-orange-500/60"
                                    )}
                                >
                                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result Display */}
                <AnimatePresence>
                    {resultImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-5 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex gap-3">
                                    {resultImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedResultIndex(i)}
                                            className={cn(
                                                "w-20 h-28 rounded-xl overflow-hidden border-2",
                                                selectedResultIndex === i ? "border-green-500" : "border-white/20"
                                            )}
                                        >
                                            <img src={img} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <Button onClick={handleDownload} size="sm" className="bg-primary hover:bg-primary/90">
                                        <Download className="w-4 h-4 mr-1" /> Download
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => { setResultImages([]); setGarmentImage(null) }}>
                                        <RefreshCw className="w-4 h-4 mr-1" /> New
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
            </div>

            {/* ========== BOTTOM SETTINGS BAR - GLASSMORPHISM ========== */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    {/* Garment Type */}
                    <div>
                        <p className="text-xs text-white/40 mb-1.5">Garment Type</p>
                        <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                            <SelectTrigger className="w-[130px] bg-white/5 border-white/10 backdrop-blur h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {GARMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quality Mode */}
                    <div>
                        <p className="text-xs text-white/40 mb-1.5">Quality Mode</p>
                        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                            {QUALITY_MODES.map((mode) => (
                                <button
                                    key={mode.value}
                                    onClick={() => setQualityMode(mode.value as QualityMode)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                                        qualityMode === mode.value
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="w-28">
                        <div className="flex justify-between mb-1.5">
                            <p className="text-xs text-white/40">Results</p>
                            <span className="text-xs text-primary font-bold">{numSamples}x</span>
                        </div>
                        <Slider value={[numSamples]} onValueChange={([v]) => setNumSamples(v)} min={1} max={4} step={1} />
                        <div className="flex justify-between text-[10px] text-white/30 mt-1">
                            <span>1</span><span>2</span><span>3</span><span>4</span>
                        </div>
                    </div>

                    {/* Seed */}
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-white/40">Seed</p>
                        <button
                            onClick={() => setUseSeed(!useSeed)}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                                useSeed ? "bg-primary/20 border-primary/50" : "bg-white/5 border-white/10"
                            )}
                        >
                            <Lock className={cn("w-4 h-4", useSeed ? "text-primary" : "text-white/40")} />
                        </button>
                        {useSeed && (
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={seed || ""}
                                    onChange={(e) => setSeed(parseInt(e.target.value) || null)}
                                    placeholder="a30542..."
                                    className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white backdrop-blur"
                                />
                                <Button variant="ghost" size="icon" onClick={handleRandomSeed} className="h-7 w-7">
                                    <Shuffle className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1" />

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={!modelImage || !garmentImage || isGenerating}
                        className="h-11 px-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-base font-bold shadow-lg shadow-pink-500/30"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {LOADING_STEPS[loadingStep]}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Try-on
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
