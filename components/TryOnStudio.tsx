"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload,
    Shirt,
    Sparkles,
    Download,
    Loader2,
    ArrowLeft,
    Star,
    Lock,
    Shuffle
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

const SAMPLE_MODELS = [
    { id: "m1", name: "Model 1", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
    { id: "m2", name: "Model 2", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80" },
    { id: "m3", name: "Model 3", url: "https://images.unsplash.com/photo-1529139574466-a302d2d3e73b?w=400&q=80" },
]

const SAMPLE_GARMENTS = [
    { id: "g1", name: "Dress", type: "one-pieces" as GarmentType, url: "https://plus.unsplash.com/premium_photo-1673356301535-ca9082f42a63?w=400&q=80" },
    { id: "g2", name: "Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=400&q=80" },
    { id: "g3", name: "Jacket", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80" },
    { id: "g4", name: "Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" },
]

const LOADING_STEPS = ["Analyzing...", "Fitting...", "Rendering..."]

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
    const [loadingStep, setLoadingStep] = useState(0)
    const [isDraggingModel, setIsDraggingModel] = useState(false)
    const [isDraggingGarment, setIsDraggingGarment] = useState(false)

    const handleFileUpload = useCallback(
        (type: "model" | "garment") => (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return
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
            const file = e.dataTransfer.files[0]
            if (!file) return
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

    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) return
        setIsGenerating(true)
        setResultImages([])

        // Simulating generation for UI preview
        const stepInterval = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length)
        }, 1500)

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
            if (!response.ok) throw new Error(data.error)
            setResultImages(data.imageUrls || [])
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 }, colors: ["#F472B6", "#FB923C"] })
        } catch (error) {
            clearInterval(stepInterval)
            toast.error("Generation failed")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = resultImages[selectedResultIndex]
        link.download = `tryon-${Date.now()}.png`
        link.click()
    }

    const handleRandomSeed = () => setSeed(Math.floor(Math.random() * 1000000))

    return (
        <div className={cn("h-full w-full bg-[#050505] flex items-center justify-center p-6 overflow-hidden font-sans", className)}>
            {/* Main Mockup Container Frame */}
            <div className="w-full max-w-[1400px] h-full rounded-[32px] border border-white/10 bg-[#0A0A0A] px-8 py-6 flex flex-col relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)]">

                {/* 1. Header */}
                <header className="flex-shrink-0 flex items-center justify-between mb-6">
                    {/* Back Button */}
                    <button onClick={onBackToModes} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <ArrowLeft className="w-4 h-4 text-white/70 group-hover:text-white" />
                        <span className="text-sm font-medium text-white/70 group-hover:text-white">Back to Modes</span>
                    </button>

                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 blur-lg bg-pink-500/50" />
                            <Shirt className="w-8 h-8 text-pink-400 relative z-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Try-on</h1>
                    </div>

                    {/* Points Badge */}
                    <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF512F] to-[#DD2476] shadow-[0_0_20px_rgba(221,36,118,0.4)] flex items-center gap-2">
                        <Star className="w-4 h-4 fill-white text-white" />
                        <span className="text-sm font-bold text-white">75K Points</span>
                    </div>
                </header>

                {/* 2. Main Columns */}
                <div className="flex-1 flex gap-8 min-h-0 mb-20 pb-4 relative z-0">
                    {/* Left Column - Your Photo */}
                    <div className="flex-1 bg-[#111] rounded-3xl border border-white/5 flex flex-col p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                            <h2 className="text-xl font-bold text-white">Your Photo</h2>
                            {modelImage && <button onClick={() => setModelImage(null)} className="text-xs text-red-400 font-medium hover:text-red-300">CLEAR</button>}
                        </div>

                        {/* Outer Dashed Zone */}
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                            onDragLeave={() => setIsDraggingModel(false)}
                            onDrop={handleDrop("model")}
                            className={cn(
                                "flex-1 min-h-0 relative z-10 border-2 border-dashed rounded-2xl flex items-center justify-center p-8 transition-colors cursor-pointer",
                                isDraggingModel ? "border-pink-500 bg-pink-500/10" : "border-pink-500/20 hover:border-pink-500/40"
                            )}
                        >
                            {modelImage ? (
                                <img src={modelImage} className="max-w-full max-h-full object-contain rounded-lg drop-shadow-2xl" />
                            ) : (
                                /* Inner Dashed Zone */
                                <div className="w-[200px] h-[280px] border border-dashed border-pink-500/30 rounded-xl flex flex-col items-center justify-center relative">
                                    <div className="absolute inset-0 blur-[60px] bg-pink-500/20 rounded-full scale-75" />

                                    {/* Icon */}
                                    <div className="relative mb-4">
                                        <Upload className="w-12 h-12 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
                                    </div>
                                    <p className="text-white/60 font-medium text-center text-sm">
                                        Drop or click<br />to upload
                                    </p>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("model")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            )}
                        </motion.div>

                        {/* Samples */}
                        <div className="mt-6 relative z-10">
                            <p className="text-sm text-white/50 mb-3 font-medium">Or try samples:</p>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {SAMPLE_MODELS.map((sample, i) => (
                                    <button
                                        key={sample.id}
                                        onClick={() => setModelImage(sample.url)}
                                        className={cn(
                                            "w-20 h-28 flex-shrink-0 object-cover rounded-xl border-2 cursor-pointer transition-all hover:scale-105 overflow-hidden",
                                            modelImage === sample.url ? "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={sample.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Garment Photo */}
                    <div className="flex-1 bg-[#111] rounded-3xl border border-white/5 flex flex-col p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                            <h2 className="text-xl font-bold text-white">Garment Photo</h2>
                            {garmentImage && <button onClick={() => setGarmentImage(null)} className="text-xs text-red-400 font-medium hover:text-red-300">CLEAR</button>}
                        </div>

                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                            onDragLeave={() => setIsDraggingGarment(false)}
                            onDrop={handleDrop("garment")}
                            className={cn(
                                "flex-1 min-h-0 relative z-10 border-2 border-dashed rounded-2xl flex items-center justify-center p-8 transition-colors cursor-pointer",
                                isDraggingGarment ? "border-orange-500 bg-orange-500/10" : "border-orange-500/20 hover:border-orange-500/40"
                            )}
                        >
                            {garmentImage ? (
                                <img src={garmentImage} className="max-w-full max-h-full object-contain rounded-lg drop-shadow-2xl" />
                            ) : (
                                <div className="w-[200px] h-[280px] border border-dashed border-orange-500/30 rounded-xl flex flex-col items-center justify-center relative">
                                    <div className="absolute inset-0 blur-[60px] bg-orange-500/20 rounded-full scale-75" />

                                    <div className="relative mb-4">
                                        <Shirt className="w-12 h-12 text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                                    </div>
                                    <p className="text-white/60 font-medium text-center text-sm">
                                        Drop or click<br />to upload
                                    </p>
                                    <input type="file" accept="image/*" onChange={handleFileUpload("garment")} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            )}
                        </motion.div>

                        <div className="mt-6 relative z-10">
                            <p className="text-sm text-white/50 mb-3 font-medium">Or try samples:</p>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {SAMPLE_GARMENTS.map((sample, i) => (
                                    <button
                                        key={sample.id}
                                        onClick={() => { setGarmentImage(sample.url); if (sample.type) setGarmentType(sample.type) }}
                                        className={cn(
                                            "w-20 h-28 flex-shrink-0 object-cover rounded-xl border-2 cursor-pointer transition-all hover:scale-105 overflow-hidden",
                                            garmentImage === sample.url ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={sample.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Floating Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-[80px] w-[90%] rounded-[24px] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center px-6 gap-6 z-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

                    {/* Garment Type */}
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Garment Type</label>
                        <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                            <SelectTrigger className="h-9 bg-[#1A1A1A] border-white/10 rounded-lg text-white/90 text-sm focus:ring-pink-500/50">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="auto">Auto Detect</SelectItem>
                                <SelectItem value="tops">Top / Shirt</SelectItem>
                                <SelectItem value="bottoms">Bottom / Pants</SelectItem>
                                <SelectItem value="one-pieces">Dress / Full</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Quality */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Quality</label>
                        <div className="flex bg-[#1A1A1A] p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setQualityMode("performance")}
                                className={cn("px-3 py-1 rounded-md text-[11px] transition-all", qualityMode === "performance" ? "bg-white/20 text-white" : "text-white/50")}
                            >Fast</button>
                            <button
                                onClick={() => setQualityMode("balanced")}
                                className={cn("px-3 py-1 rounded-md text-[11px] transition-all", qualityMode === "balanced" ? "bg-[#3E2323] text-[#FF9A9E] shadow-sm font-semibold" : "text-white/50")}
                            >Balanced</button>
                            <button
                                onClick={() => setQualityMode("quality")}
                                className={cn("px-3 py-1 rounded-md text-[11px] transition-all", qualityMode === "quality" ? "bg-white/20 text-white" : "text-white/50")}
                            >Quality</button>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Results Slider */}
                    <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between">
                            <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Results</label>
                            <span className="text-[11px] text-white/90 font-bold">{numSamples}</span>
                        </div>
                        <Slider
                            value={[numSamples]}
                            onValueChange={([v]) => setNumSamples(v)}
                            max={4}
                            min={1}
                            step={1}
                            className="[&>.absolute]:bg-gradient-to-r from-pink-500 to-orange-500"
                        />
                        <div className="flex justify-between text-[8px] text-white/20">
                            <span>1</span><span>2</span><span>3</span><span>4</span>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Seed */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Seed</label>
                            <div className="flex items-center gap-2">
                                <div className="h-9 flex items-center px-3 rounded-lg bg-[#1A1A1A] border border-white/5 w-24 relative overflow-hidden group">
                                    {useSeed ? (
                                        <input
                                            value={seed || ""}
                                            onChange={(e) => setSeed(parseInt(e.target.value) || null)}
                                            className="w-full bg-transparent text-xs text-white outline-none font-mono"
                                            placeholder="Random"
                                        />
                                    ) : (
                                        <span className="text-xs text-white/30 font-mono">Random</span>
                                    )}
                                </div>
                                <button onClick={() => setUseSeed(!useSeed)} className={cn("p-2 rounded-lg border transition-all", useSeed ? "border-pink-500 text-pink-500" : "border-white/10 text-white/20 hover:text-white")}>
                                    <Lock className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Generate Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerate}
                        disabled={isGenerating || !modelImage || !garmentImage}
                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] hover:from-[#ff8da1] hover:to-[#fdb5e4] text-black font-bold text-base shadow-[0_0_30px_rgba(255,154,158,0.4)] flex items-center gap-2 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-black" />}
                        {isGenerating ? LOADING_STEPS[loadingStep] : "Generate Try-on"}
                    </motion.button>
                </div>

                {/* Result Overlay */}
                <AnimatePresence>
                    {resultImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col p-8 rounded-[32px]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-green-400 fill-green-400" />
                                    Amazing Result!
                                </h1>
                                <div className="flex gap-2">
                                    <Button onClick={handleDownload} className="bg-white text-black hover:bg-white/90 rounded-xl h-10 font-bold">
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </Button>
                                    <Button variant="outline" onClick={() => setResultImages([])} className="rounded-xl h-10 border-white/20 text-white hover:bg-white/10">
                                        New Try-on
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-8 min-h-0">
                                <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                                    <img src={resultImages[selectedResultIndex]} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                </div>
                                <div className="w-80 flex flex-col gap-4 overflow-y-auto">
                                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Variations</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {resultImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedResultIndex(i)}
                                                className={cn(
                                                    "aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                                                    selectedResultIndex === i ? "border-green-500 shadow-lg shadow-green-500/20" : "border-white/10"
                                                )}
                                            >
                                                <img src={img} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
