"use client"

import { useState, useCallback, useEffect } from "react"
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
    Shuffle,
    Film,
    Share2,
    Trophy,
    Heart,
    LayoutGrid,
    Bookmark,
    History,
    Clock
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
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider"

interface TryOnStudioProps {
    className?: string
    onBackToModes?: () => void
    onNavigateToVideo?: (image: string) => void
}

type GarmentType = "auto" | "tops" | "bottoms" | "one-pieces"
type QualityMode = "performance" | "balanced" | "quality"
type TabMode = "upload" | "wardrobe"

// Mock Wardrobe Data
const INITIAL_WARDROBE = [
    { id: "w1", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", type: "tops", name: "Leather Jacket" },
    { id: "w2", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80", type: "one-pieces", name: "Summer Dress" },
    { id: "w3", url: "https://images.unsplash.com/photo-1542272454315-1471717e0697?w=400&q=80", type: "bottoms", name: "Ripped Jeans" },
]

// Full-body model images for VTON (required for body pose detection)
const SAMPLE_MODELS = [
    { id: "m1", name: "Model 1", url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80" }, // Full body fashion shot
    { id: "m2", name: "Model 2", url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80" }, // Full body standing pose
    { id: "m3", name: "Model 3", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" }, // Full body runway style
]

const SAMPLE_GARMENTS = [
    { id: "g1", name: "T-Shirt", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" },
    { id: "g2", name: "Dress", type: "one-pieces" as GarmentType, url: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80" },
    { id: "g3", name: "Denim", type: "tops" as GarmentType, url: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80" },
    { id: "g4", name: "Jeans", type: "bottoms" as GarmentType, url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" },
]

const LOADING_STEPS = ["Analyzing...", "Fitting...", "Rendering..."]

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 SVG GRADIENT ICONS (Neon Glass Style)
// ═══════════════════════════════════════════════════════════════════════════

const GradientDefs = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
            <linearGradient id="sunset-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF5A5A" />
                <stop offset="100%" stopColor="#FF9E5A" />
            </linearGradient>
            <linearGradient id="sunset-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF5A5A" />
                <stop offset="100%" stopColor="#FF9E5A" />
            </linearGradient>
        </defs>
    </svg>
)

const UploadIconGradient = ({ className }: { className?: string }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className={className}>
        <path
            d="M28 38V18M28 18L20 26M28 18L36 26"
            stroke="url(#sunset-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 32V42C10 44.7614 12.2386 47 15 47H41C43.7614 47 46 44.7614 46 42V32"
            stroke="url(#sunset-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
)

const HangerIconGradient = ({ className }: { className?: string }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className={className}>
        <path
            d="M28 9V14C28 16.7614 30.2386 19 33 19C35.7614 19 38 16.7614 38 14"
            stroke="url(#sunset-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M7 38L28 24L49 38V43C49 45.7614 46.7614 48 44 48H12C9.23858 48 7 45.7614 7 43V38Z"
            stroke="url(#sunset-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const TryOnTitleIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
            d="M16 5V8C16 10.2091 17.7909 12 20 12C22.2091 12 24 10.2091 24 8"
            stroke="url(#sunset-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <path
            d="M4 22L16 14L28 22V26C28 27.6569 26.6569 29 25 29H7C5.34315 29 4 27.6569 4 26V22Z"
            stroke="url(#sunset-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export function TryOnStudio({ className, onBackToModes, onNavigateToVideo }: TryOnStudioProps) {
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

    // New Feature States
    const [garmentTab, setGarmentTab] = useState<TabMode>("upload")
    const [wardrobe, setWardrobe] = useState(INITIAL_WARDROBE)
    const [isSaving, setIsSaving] = useState(false)

    // History Feature
    interface HistoryItem {
        id: string
        modelImage: string
        garmentImage: string
        resultImages: string[]
        timestamp: number
    }
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [showHistory, setShowHistory] = useState(false)

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem("pho-tryon-history")
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory)
                setHistory(parsed.slice(0, 20)) // Keep max 20 items
            } catch (e) {
                console.error("Failed to parse history", e)
            }
        }
    }, [])

    // Save to history after successful generation
    const saveToHistory = useCallback((model: string, garment: string, results: string[]) => {
        const newItem: HistoryItem = {
            id: `h-${Date.now()}`,
            modelImage: model,
            garmentImage: garment,
            resultImages: results,
            timestamp: Date.now()
        }
        setHistory(prev => {
            const updated = [newItem, ...prev].slice(0, 20) // Keep max 20
            localStorage.setItem("pho-tryon-history", JSON.stringify(updated))
            return updated
        })
    }, [])

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

    const handleAddToWardrobe = () => {
        if (!garmentImage) return
        setIsSaving(true)
        setTimeout(() => {
            const newItem = {
                id: `w-${Date.now()}`,
                url: garmentImage,
                type: garmentType as string,
                name: "New Item"
            }
            setWardrobe([newItem, ...wardrobe])
            toast.success("Saved to Digital Wardrobe!", {
                icon: <Bookmark className="w-4 h-4 text-orange-500" />
            })
            setIsSaving(false)
        }, 800)
    }

    const handleSubmitToChallenge = () => {
        toast.promise(new Promise(r => setTimeout(r, 1500)), {
            loading: "Submitting to Cyberpunk Challenge...",
            success: () => {
                confetti({ particleCount: 50, spread: 60, colors: ['#FF5A5A', '#FF9E5A'] });
                return "Submission accepted! +50 Points"
            },
            error: "Failed"
        })
    }

    const handleGenerate = async () => {
        if (!modelImage || !garmentImage) return
        setIsGenerating(true)
        setResultImages([])

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

            if (!response.ok) {
                // Handle specific validation errors
                const errorMsg = data.error || "Generation failed"
                if (errorMsg.includes("body pose") || errorMsg.includes("detect body")) {
                    toast.error("❌ Cannot detect body in photo. Please use a clear full-body image.")
                } else if (errorMsg.includes("Insufficient")) {
                    toast.error(`❌ ${errorMsg}. Need ${data.required?.toLocaleString()} points.`)
                } else {
                    toast.error(`❌ ${errorMsg}`)
                }
                setIsGenerating(false)
                return
            }

            if (!data.imageUrls?.length) {
                setResultImages([modelImage])
                toast.warning("Demo Mode: Using placeholder")
            } else {
                setResultImages(data.imageUrls || [])
                // Save to history
                if (modelImage && garmentImage) {
                    saveToHistory(modelImage, garmentImage, data.imageUrls)
                }
            }

            confetti({ particleCount: 120, spread: 80, origin: { y: 0.8 }, colors: ["#FF5A5A", "#FF9E5A", "#ffffff"] })
        } catch (error) {
            clearInterval(stepInterval)
            console.error("API Error", error)
            setResultImages([modelImage])
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

    const handleShare = async () => {
        const imageUrl = resultImages[selectedResultIndex]
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Virtual Try-on Fit',
                    text: 'Check out this AI-generated outfit from Phở Video!',
                    url: imageUrl,
                })
            } catch (err) {
                console.error('Share failed', err)
            }
        } else {
            navigator.clipboard.writeText(imageUrl)
            toast.success("Link copied to clipboard!")
        }
    }

    return (
        <div className={cn(
            "h-full w-full flex items-center justify-center p-6 overflow-hidden font-sans relative",
            "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF5A5A]/10 via-[#0a0a0a] to-[#050505]",
            className
        )}>
            <GradientDefs />

            <div className="w-full max-w-[1400px] h-full rounded-[32px] border border-[#FF5A5A]/20 bg-[#0A0A0A]/95 px-8 py-6 flex flex-col relative shadow-[0_0_80px_-15px_rgba(255,90,90,0.3),0_0_120px_-30px_rgba(255,158,90,0.2)] backdrop-blur-sm">

                {/* ═══════════════════════════════════════════════════════════════════════════
                    1. HEADER - Neon Glass Style
                ═══════════════════════════════════════════════════════════════════════════ */}
                <header className="flex-shrink-0 flex items-center justify-between mb-6">
                    {/* Back Button - Glass Effect */}
                    <button
                        onClick={onBackToModes}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Back to Modes</span>
                    </button>

                    {/* Title with Gradient Icon */}
                    <div className="flex items-center gap-3">
                        <TryOnTitleIcon />
                        <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Try-on</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* History Button */}
                        {history.length > 0 && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all",
                                    showHistory
                                        ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <History className="w-4 h-4" />
                                <span className="text-sm font-medium">{history.length}</span>
                            </button>
                        )}

                        {/* Points Badge - Sunset Gradient with Glow */}
                        <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF5A5A] to-[#FF9E5A] shadow-[0_0_25px_rgba(255,90,90,0.5)] flex items-center gap-2 border border-white/20">
                            <Star className="w-4 h-4 fill-white text-white" />
                            <span className="text-sm font-bold text-white">75K Points</span>
                        </div>
                    </div>
                </header>

                {/* Challenge Banner */}
                <div className="mb-4 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-yellow-500">Weekly Challenge: Cyberpunk Streetwear</h3>
                        <p className="text-xs text-white/60">Generate a fit to win 50K Points. Ends in 2 days.</p>
                    </div>
                    <div className="ml-auto">
                        <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-white/40">#CYBER2077</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    2. MAIN COLUMNS - Upload Zones
                ═══════════════════════════════════════════════════════════════════════════ */}
                <div className="flex-1 flex gap-6 min-h-0 mb-24 pb-4 relative z-0">

                    {/* ─────────────────────────────────────────────────────────────────────
                        LEFT COLUMN - Your Photo
                    ───────────────────────────────────────────────────────────────────── */}
                    <div className="flex-1 bg-gradient-to-b from-[#151515] to-[#0d0d0d] rounded-2xl border border-white/10 flex flex-col p-6 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                        {/* Ambient inner glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,90,90,0.08)_0%,transparent_60%)] pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                            <h2 className="text-lg font-bold text-white">Your Photo</h2>
                            {modelImage && (
                                <button
                                    onClick={() => setModelImage(null)}
                                    className="text-xs text-red-400 font-medium hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Dropzone with Glowing Dashed Border */}
                        <motion.div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingModel(true) }}
                            onDragLeave={() => setIsDraggingModel(false)}
                            onDrop={handleDrop("model")}
                            className={cn(
                                "flex-1 min-h-0 relative z-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                                isDraggingModel
                                    ? "shadow-[0_0_40px_rgba(255,90,90,0.4)] bg-[#FF5A5A]/5"
                                    : "bg-[radial-gradient(closest-side,rgba(255,90,90,0.1)_0%,transparent_80%)]"
                            )}
                            style={{
                                backgroundImage: isDraggingModel
                                    ? `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23FF5A5A' stroke-width='2.5' stroke-dasharray='10%2c 6' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`
                                    : `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23FF5A5A66' stroke-width='2' stroke-dasharray='10%2c 6' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`
                            }}
                        >
                            {modelImage ? (
                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                    <img src={modelImage} className="max-w-full max-h-full object-contain rounded-xl drop-shadow-2xl" alt="Model" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center relative">
                                    {/* Strong Inner Glow Effect */}
                                    <div className="absolute inset-0 blur-[80px] bg-gradient-to-b from-[#FF5A5A]/30 via-[#FF9E5A]/15 to-transparent rounded-full scale-150" />

                                    <div className="relative mb-4">
                                        <UploadIconGradient />
                                    </div>
                                    <p className="text-white/60 font-medium text-center text-sm relative z-10">
                                        Drop or click<br />to upload
                                    </p>
                                    <p className="text-white/30 text-center text-[10px] mt-2 relative z-10">
                                        📷 Full-body photo required
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload("model")}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                </div>
                            )}
                        </motion.div>

                        {/* Sample Thumbnails with Glow Selection */}
                        <div className="mt-5 relative z-10">
                            <p className="text-sm text-white/50 mb-3 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF5A5A] to-[#FF9E5A]" />
                                Or try samples:
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {SAMPLE_MODELS.map((sample) => (
                                    <button
                                        key={sample.id}
                                        onClick={() => setModelImage(sample.url)}
                                        className={cn(
                                            "w-[72px] h-[96px] flex-shrink-0 rounded-xl cursor-pointer transition-all overflow-hidden relative",
                                            modelImage === sample.url
                                                ? "ring-2 ring-[#FF5A5A] ring-offset-2 ring-offset-[#0a0a0a] shadow-[0_0_20px_rgba(255,90,90,0.5)] scale-105 z-10"
                                                : "border border-white/10 opacity-70 hover:opacity-100 hover:scale-105"
                                        )}
                                    >
                                        <img src={sample.url} className="w-full h-full object-cover" alt={sample.name} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────────────
                        RIGHT COLUMN - Garment Photo
                    ───────────────────────────────────────────────────────────────────── */}
                    <div className="flex-1 bg-gradient-to-b from-[#151515] to-[#0d0d0d] rounded-2xl border border-white/10 flex flex-col p-6 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                        {/* Ambient inner glow - Orange tint for garment */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,158,90,0.08)_0%,transparent_60%)] pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 relative z-10 w-full">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-white">Garment</h2>
                                {/* Tab Switcher */}
                                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => setGarmentTab("upload")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                            garmentTab === "upload" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={() => setGarmentTab("wardrobe")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1",
                                            garmentTab === "wardrobe" ? "bg-orange-500/20 text-orange-400" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        <Bookmark className="w-3 h-3" /> Wardrobe
                                    </button>
                                </div>
                            </div>
                            {garmentImage && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddToWardrobe}
                                        disabled={isSaving}
                                        className="text-xs text-orange-400 font-medium hover:text-orange-300 bg-orange-500/10 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bookmark className="w-3 h-3 fill-orange-400" />} Save
                                    </button>
                                    <button
                                        onClick={() => setGarmentImage(null)}
                                        className="text-xs text-red-400 font-medium hover:text-red-300 bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {garmentTab === "upload" ? (
                            <>
                                {/* Dropzone with Glowing Dashed Border */}
                                <motion.div
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingGarment(true) }}
                                    onDragLeave={() => setIsDraggingGarment(false)}
                                    onDrop={handleDrop("garment")}
                                    className={cn(
                                        "flex-1 min-h-0 relative z-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                                        isDraggingGarment
                                            ? "shadow-[0_0_40px_rgba(255,158,90,0.4)] bg-[#FF9E5A]/5"
                                            : "bg-[radial-gradient(closest-side,rgba(255,158,90,0.1)_0%,transparent_80%)]"
                                    )}
                                    style={{
                                        backgroundImage: isDraggingGarment
                                            ? `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23FF9E5A' stroke-width='2.5' stroke-dasharray='10%2c 6' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`
                                            : `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23FF9E5A66' stroke-width='2' stroke-dasharray='10%2c 6' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`
                                    }}
                                >
                                    {garmentImage ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <img src={garmentImage} className="max-w-full max-h-full object-contain rounded-xl drop-shadow-2xl" alt="Garment" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center relative">
                                            {/* Strong Inner Glow Effect */}
                                            <div className="absolute inset-0 blur-[80px] bg-gradient-to-b from-[#FF9E5A]/30 via-[#FF5A5A]/15 to-transparent rounded-full scale-150" />

                                            <div className="relative mb-4">
                                                <HangerIconGradient />
                                            </div>
                                            <p className="text-white/60 font-medium text-center text-sm relative z-10">
                                                Drop or click<br />to upload
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload("garment")}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            />
                                        </div>
                                    )}
                                </motion.div>

                                {/* Sample Thumbnails with Glow Selection */}
                                <div className="mt-5 relative z-10">
                                    <p className="text-sm text-white/50 mb-3 font-medium flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF9E5A] to-[#FF5A5A]" />
                                        Or try samples:
                                    </p>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                        {SAMPLE_GARMENTS.map((sample) => (
                                            <button
                                                key={sample.id}
                                                onClick={() => { setGarmentImage(sample.url); if (sample.type) setGarmentType(sample.type) }}
                                                className={cn(
                                                    "w-[72px] h-[96px] flex-shrink-0 rounded-xl cursor-pointer transition-all overflow-hidden relative",
                                                    garmentImage === sample.url
                                                        ? "ring-2 ring-[#FF9E5A] ring-offset-2 ring-offset-[#0a0a0a] shadow-[0_0_20px_rgba(255,158,90,0.5)] scale-105 z-10"
                                                        : "border border-white/10 opacity-70 hover:opacity-100 hover:scale-105"
                                                )}
                                            >
                                                <img src={sample.url} className="w-full h-full object-cover" alt={sample.name} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Wardrobe Grid */
                            <div className="flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {wardrobe.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setGarmentImage(item.url); if (item.type) setGarmentType(item.type as GarmentType) }}
                                            className={cn(
                                                "aspect-[3/4] rounded-xl relative overflow-hidden group border-2 transition-all hover:scale-105",
                                                garmentImage === item.url
                                                    ? "border-[#FF9E5A] shadow-[0_0_20px_rgba(255,158,90,0.4)]"
                                                    : "border-white/5 hover:border-white/20"
                                            )}
                                        >
                                            <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <span className="text-[10px] text-white font-bold">{item.name}</span>
                                                <span className="text-[9px] text-white/60 capitalize">{item.type}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {/* Add New Placeholder */}
                                    <button
                                        onClick={() => setGarmentTab("upload")}
                                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all">
                                            <Upload className="w-4 h-4 text-white/40" />
                                        </div>
                                        <span className="text-xs text-white/40 font-medium">Add New</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    3. BOTTOM FLOATING CONTROL BAR - Glassmorphism Enhanced
                ═══════════════════════════════════════════════════════════════════════════ */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-[80px] w-[92%] rounded-2xl bg-white/[0.03] backdrop-blur-3xl border border-white/15 flex items-center px-6 gap-5 z-20 shadow-[0_-5px_40px_-10px_rgba(255,90,90,0.15),0_20px_60px_-10px_rgba(0,0,0,0.8)]">
                    {/* Top edge highlight for glass effect */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Garment Type */}
                    <div className="flex flex-col gap-1.5 min-w-[130px]">
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider pl-1">Garment Type</label>
                        <Select value={garmentType} onValueChange={(v) => setGarmentType(v as GarmentType)}>
                            <SelectTrigger className="h-10 bg-zinc-900 border-white/10 rounded-xl text-white/90 text-sm focus:ring-0 focus:border-orange-500/50 hover:bg-zinc-800 transition-colors">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                                <SelectItem value="auto">✨ Auto Detect</SelectItem>
                                <SelectItem value="tops">👕 Top / Shirt</SelectItem>
                                <SelectItem value="bottoms">👖 Bottom / Pants</SelectItem>
                                <SelectItem value="one-pieces">👗 Dress / Full</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Quality Mode Toggle */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider pl-1">Quality</label>
                        <div className="flex bg-zinc-900 p-1 rounded-full border border-white/5">
                            <button
                                onClick={() => setQualityMode("performance")}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-medium transition-all",
                                    qualityMode === "performance" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                Fast
                            </button>
                            <button
                                onClick={() => setQualityMode("balanced")}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-medium transition-all",
                                    qualityMode === "balanced"
                                        ? "bg-gradient-to-r from-[#FF5A5A]/20 to-[#FF9E5A]/20 text-orange-200 border border-orange-500/30"
                                        : "text-zinc-500 hover:text-white"
                                )}
                            >
                                Balanced
                            </button>
                            <button
                                onClick={() => setQualityMode("quality")}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-medium transition-all",
                                    qualityMode === "quality" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                Quality
                            </button>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Results Slider */}
                    <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between px-1">
                            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Results</label>
                            <span className="text-[10px] text-white/90 font-bold bg-white/10 px-1.5 rounded">{numSamples}</span>
                        </div>
                        <Slider
                            value={[numSamples]}
                            onValueChange={([v]) => setNumSamples(v)}
                            max={4}
                            min={1}
                            step={1}
                            className="[&>.absolute]:bg-gradient-to-r from-[#FF5A5A] to-[#FF9E5A] py-1"
                        />
                        <div className="flex justify-between text-[8px] text-white/20 px-1 font-mono">
                            <span>1</span><span>2</span><span></span><span>4</span>
                        </div>
                    </div>

                    <div className="w-px h-10 bg-white/10" />

                    {/* Seed */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider pl-1">Seed</label>
                            <div className="flex items-center gap-2">
                                <div className="h-10 flex items-center px-3 rounded-xl bg-zinc-900 border border-white/5 w-24 relative overflow-hidden group hover:border-white/20 transition-colors">
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
                                <button
                                    onClick={() => setUseSeed(!useSeed)}
                                    className={cn(
                                        "p-2.5 rounded-xl border transition-all",
                                        useSeed
                                            ? "border-orange-500 text-orange-500 bg-orange-500/10"
                                            : "border-white/10 text-white/20 hover:text-white bg-zinc-900"
                                    )}
                                >
                                    <Lock className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Generate Button - NEON SUNSET with Pulse Glow */}
                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 0 60px rgba(255,90,90,0.6), 0 0 100px rgba(255,158,90,0.3)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGenerate}
                        disabled={isGenerating || !modelImage || !garmentImage}
                        className={cn(
                            "h-12 px-8 rounded-xl bg-gradient-to-r from-[#FF5A5A] to-[#FF9E5A] hover:from-[#FF4040] hover:to-[#FF8530]",
                            "text-white font-bold text-base flex items-center gap-2.5 transition-all",
                            "border border-white/30 shadow-[0_0_50px_rgba(255,90,90,0.5),0_0_80px_rgba(255,158,90,0.25)]",
                            "disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed",
                            !isGenerating && modelImage && garmentImage && "animate-pulse-subtle"
                        )}
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 fill-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />}
                        {isGenerating ? LOADING_STEPS[loadingStep] : "Generate Try-on"}
                    </motion.button>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    RESULT OVERLAY
                ═══════════════════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {resultImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, scale: 1, backdropFilter: "blur(20px)" }}
                            exit={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 z-50 bg-[#0A0A0A]/90 flex flex-col p-8 rounded-[32px]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-[#FF9E5A] fill-[#FF9E5A]" />
                                    Your Fit is Ready!
                                </h1>
                                <div className="flex gap-3">
                                    <Button onClick={handleDownload} className="bg-white text-black hover:bg-gray-200 rounded-xl h-11 px-6 font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </Button>

                                    <Button onClick={handleSubmitToChallenge} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-xl h-11 px-6 font-bold text-base border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                        <Trophy className="w-4 h-4 mr-2" /> Battle
                                    </Button>

                                    <Button onClick={handleShare} className="bg-white/10 text-white hover:bg-white/20 rounded-xl h-11 px-6 font-bold text-base border border-white/10">
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>

                                    {/* Runway Mode Button */}
                                    <Button
                                        onClick={() => onNavigateToVideo?.(resultImages[selectedResultIndex])}
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-white/20 rounded-xl h-11 px-6 font-bold text-base shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:scale-105"
                                    >
                                        <Film className="w-4 h-4 mr-2" />
                                        ✨ Runway Video
                                    </Button>

                                    <Button variant="outline" onClick={() => setResultImages([])} className="rounded-xl h-11 px-6 border-white/10 text-white hover:bg-white/10 text-base">
                                        New Try-on
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-8 min-h-0">
                                <div className="flex-1 bg-gradient-to-b from-[#111] to-black border border-white/10 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden shadow-2xl">
                                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                                    {/* Before/After Slider */}
                                    <div className="relative w-full h-full max-w-[500px] max-h-[700px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                        {modelImage && resultImages[selectedResultIndex] ? (
                                            <BeforeAfterSlider
                                                beforeSrc={modelImage}
                                                afterSrc={resultImages[selectedResultIndex]}
                                                beforeLabel="Original"
                                                afterLabel="Try-On"
                                                type="image"
                                            />
                                        ) : (
                                            <img src={resultImages[selectedResultIndex]} className="w-full h-full object-contain" alt="Result" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Variations</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {resultImages.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedResultIndex(i)}
                                                className={cn(
                                                    "aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all hover:scale-105 relative group",
                                                    selectedResultIndex === i
                                                        ? "border-[#FF9E5A] shadow-[0_0_20px_rgba(255,158,90,0.3)]"
                                                        : "border-white/10 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <img src={img} className="w-full h-full object-cover" alt={`Variation ${i + 1}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    HISTORY PANEL - Slide-in from right
                ═══════════════════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute top-0 right-0 bottom-0 w-[320px] bg-[#0d0d0d]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
                        >
                            {/* History Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                    <h3 className="text-lg font-bold text-white">History</h3>
                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60">{history.length}</span>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            {/* History Items */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer group"
                                        onClick={() => {
                                            setModelImage(item.modelImage)
                                            setGarmentImage(item.garmentImage)
                                            setResultImages(item.resultImages)
                                            setSelectedResultIndex(0)
                                            setShowHistory(false)
                                        }}
                                    >
                                        {/* Thumbnail Grid */}
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                                <img
                                                    src={item.resultImages[0]}
                                                    alt="Result"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <div className="flex gap-1">
                                                    <div className="w-8 h-10 rounded bg-white/10 overflow-hidden">
                                                        <img
                                                            src={item.modelImage}
                                                            alt="Model"
                                                            className="w-full h-full object-cover opacity-60"
                                                        />
                                                    </div>
                                                    <div className="w-8 h-10 rounded bg-white/10 overflow-hidden">
                                                        <img
                                                            src={item.garmentImage}
                                                            alt="Garment"
                                                            className="w-full h-full object-cover opacity-60"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-white/40">
                                                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-orange-400/70">{item.resultImages.length} variation{item.resultImages.length > 1 ? 's' : ''}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setHistory(prev => {
                                                        const updated = prev.filter(h => h.id !== item.id)
                                                        localStorage.setItem("pho-tryon-history", JSON.stringify(updated))
                                                        return updated
                                                    })
                                                }}
                                                className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}

                                {history.length === 0 && (
                                    <div className="text-center py-12">
                                        <History className="w-12 h-12 mx-auto text-white/20 mb-3" />
                                        <p className="text-sm text-white/40">No history yet</p>
                                        <p className="text-xs text-white/30 mt-1">Your generations will appear here</p>
                                    </div>
                                )}
                            </div>

                            {/* Clear All */}
                            {history.length > 0 && (
                                <div className="p-3 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            setHistory([])
                                            localStorage.removeItem("pho-tryon-history")
                                            setShowHistory(false)
                                        }}
                                        className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                                    >
                                        Clear All History
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
