"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import {
    Film,
    Sparkles,
    Settings2,
    Wand2,
    ImageIcon,
    Upload,
    Clock,
    Loader2,
    AlertCircle,
    Keyboard,
    X,
    Play,
    Zap
} from "lucide-react"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { PhoPointsBalance } from "@/components/PhoPointsBalance"
import { ModeSelector, CreationMode, CREATION_MODES } from "@/components/ModeSelector"
import { CollapsibleSection, CollapsibleToggle } from "@/components/CollapsibleSection"
import { CameraControls, CameraMovement, getCameraPromptSuffix } from "@/components/CameraControls"
import { WorkspacePanel } from "@/components/WorkspacePanel"
import { SoundStudio } from "@/components/SoundStudio"
import { VideoUpscaler } from "@/components/VideoUpscaler"
import { StoryboardWizard } from "@/components/StoryboardWizard"
import { useStudioStore } from "@/stores/useStudioStore"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Smart defaults per mode
const MODE_DEFAULTS = {
    video: { model: "pho-instant", duration: 5, aspectRatio: "16:9" },
    image: { model: "flux-pro-v1.1", aspectRatio: "1:1", batch: 1 },
    audio: { musicModel: "minimax", duration: 30 },
    upscale: { model: "standard", scale: 2 },
    story: { scenes: 3, duration: 5 },
    magic: {},
}

// Video models
const VIDEO_MODELS = [
    { id: "pho-instant", name: "Phở Instant", cost: 50, description: "Fast & balanced", tag: "Popular" },
    { id: "pho-cinematic", name: "Phở Cinematic", cost: 75, description: "Best quality", tag: "Pro" },
    { id: "pho-fast", name: "Phở Fast", cost: 40, description: "Budget-friendly", tag: "" },
    { id: "pho-motion", name: "Phở Motion", cost: 60, description: "Best for I2V", tag: "I2V" },
]

// Image models  
const IMAGE_MODELS = [
    { id: "flux-pro-v1.1", name: "Flux Pro", cost: 20, description: "Photorealistic" },
    { id: "recraft-v3", name: "Recraft V3", cost: 25, description: "Artistic styles" },
]

// Magic presets with actions
const MAGIC_PRESETS = [
    {
        id: "cinematic",
        icon: Film,
        label: "Cinematic Promo",
        description: "16:9 video, best quality, 5s",
        color: "from-primary to-orange-500",
        mode: "video",
        settings: { model: "pho-cinematic", aspectRatio: "16:9", duration: 5 }
    },
    {
        id: "product",
        icon: ImageIcon,
        label: "Product Shot",
        description: "1:1 image, studio lighting",
        color: "from-blue-500 to-cyan-500",
        mode: "image",
        settings: { model: "flux-pro-v1.1", aspectRatio: "1:1" }
    },
    {
        id: "tiktok",
        icon: Play,
        label: "TikTok/Reel",
        description: "9:16 vertical, fast",
        color: "from-pink-500 to-rose-500",
        mode: "video",
        settings: { model: "pho-instant", aspectRatio: "9:16", duration: 5 }
    },
    {
        id: "quick",
        icon: Zap,
        label: "Quick Test",
        description: "Fastest generation",
        color: "from-green-500 to-emerald-500",
        mode: "video",
        settings: { model: "pho-fast", aspectRatio: "16:9", duration: 5 }
    },
]

export default function Studio2Page() {
    const t = useTranslations("studio")
    const tc = useTranslations("common")
    const { user } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Mode state
    const [selectedMode, setSelectedMode] = useState<CreationMode>("video")
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Video settings
    const [videoModel, setVideoModel] = useState("pho-instant")
    const [duration, setDuration] = useState([5])
    const [aspectRatio, setAspectRatio] = useState("16:9")
    const [magicPrompt, setMagicPrompt] = useState(true)
    const [isImageToVideo, setIsImageToVideo] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [cameraMotion, setCameraMotion] = useState<CameraMovement>('static')
    const [motionIntensity, setMotionIntensity] = useState(0.5)

    // Image settings
    const [imageModel, setImageModel] = useState("flux-pro-v1.1")
    const [imageBatch, setImageBatch] = useState(1)

    // Store
    const {
        generations,
        activeItem,
        fetchGenerations,
        addGhostGeneration,
        completeGeneration,
        failGeneration,
        setActiveItem,
    } = useStudioStore()

    useEffect(() => {
        fetchGenerations()
    }, [fetchGenerations])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Enter to generate
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && prompt.trim() && !isGenerating) {
                e.preventDefault()
                handleGenerate()
            }
            // Escape to clear error
            if (e.key === "Escape" && error) {
                setError(null)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [prompt, isGenerating, error])

    // Current mode config
    const currentMode = CREATION_MODES.find(m => m.id === selectedMode)!

    // Calculate cost
    const getEstimatedCost = () => {
        switch (selectedMode) {
            case "video":
                const vModel = VIDEO_MODELS.find(m => m.id === videoModel)
                return (vModel?.cost || 50) * 1000
            case "image":
                const iModel = IMAGE_MODELS.find(m => m.id === imageModel)
                return (iModel?.cost || 20) * imageBatch * 1000
            default:
                return 50000
        }
    }

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        setError(null)
        const tempId = `temp-${Date.now()}`

        try {
            if (selectedMode === "video") {
                addGhostGeneration(tempId, prompt, videoModel, "video")

                const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt,
                        model: videoModel,
                        duration: duration[0],
                        aspectRatio,
                        magicPrompt,
                        ...(isImageToVideo && uploadedImage ? { image: uploadedImage } : {}),
                    }),
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error || "Video generation failed")

                completeGeneration(tempId, data.videoUrl, data.creditsUsed, "video")
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 }, colors: ['#F0421C', '#ffffff'] })

            } else if (selectedMode === "image") {
                addGhostGeneration(tempId, prompt, imageModel, "image")

                const response = await fetch("/api/generate-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt,
                        model: imageModel,
                        batch: imageBatch,
                    }),
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error || "Image generation failed")

                completeGeneration(tempId, data.imageUrl || data.imageUrls, data.creditsUsed, "image")
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 }, colors: ['#3B82F6', '#ffffff'] })
            }
        } catch (err) {
            console.error("Generation error:", err)
            setError(err instanceof Error ? err.message : "Generation failed. Please try again.")
            failGeneration(tempId)
        } finally {
            setIsGenerating(false)
        }
    }, [prompt, selectedMode, videoModel, duration, aspectRatio, magicPrompt, isImageToVideo, uploadedImage, imageModel, imageBatch])

    // Handle magic preset click
    const handleMagicPreset = (preset: typeof MAGIC_PRESETS[0]) => {
        if (preset.mode === "video") {
            setSelectedMode("video")
            setVideoModel(preset.settings.model || "pho-instant")
            setAspectRatio(preset.settings.aspectRatio || "16:9")
            if (preset.settings.duration) setDuration([preset.settings.duration])
        } else if (preset.mode === "image") {
            setSelectedMode("image")
            setImageModel(preset.settings.model || "flux-pro-v1.1")
            setAspectRatio(preset.settings.aspectRatio || "1:1")
        }
    }

    // Handle image upload for I2V
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setUploadedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Render mode-specific content
    const renderModeContent = () => {
        switch (selectedMode) {
            case "video":
            case "image":
                return (
                    <>
                        {/* Video Mode: Text vs Image Toggle */}
                        {selectedMode === "video" && (
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                                <button
                                    onClick={() => setIsImageToVideo(false)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        !isImageToVideo
                                            ? "bg-primary/20 text-primary"
                                            : "text-white/50 hover:text-white"
                                    )}
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Text to Video
                                </button>
                                <button
                                    onClick={() => setIsImageToVideo(true)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                                        isImageToVideo
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "text-white/50 hover:text-white"
                                    )}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Image to Video
                                </button>
                            </div>
                        )}

                        {/* Image Upload for I2V */}
                        {selectedMode === "video" && isImageToVideo && (
                            <div className="space-y-2">
                                {uploadedImage ? (
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={uploadedImage}
                                            alt="Uploaded"
                                            className="w-full h-32 object-cover"
                                        />
                                        <button
                                            onClick={() => setUploadedImage(null)}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-blue-400/50 bg-white/5 cursor-pointer transition-all">
                                        <Upload className="w-8 h-8 text-white/30 mb-2" />
                                        <span className="text-sm text-white/50">Upload image to animate</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={
                                    selectedMode === "video"
                                        ? isImageToVideo
                                            ? "Describe how the image should animate..."
                                            : "Describe the video you want to create..."
                                        : "Describe the image you want to generate..."
                                }
                                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-base focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/30">{prompt.length} characters</span>
                                <span className="text-xs text-white/30 flex items-center gap-1">
                                    <Keyboard className="w-3 h-3" />
                                    ⌘+Enter to generate
                                </span>
                            </div>
                        </div>

                        {/* Style & Quality (Level 2) */}
                        <CollapsibleSection
                            title="Style & Quality"
                            icon={<Sparkles className="w-4 h-4" />}
                            defaultOpen={true}
                        >
                            {/* Model Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50">Model</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(selectedMode === "video" ? VIDEO_MODELS : IMAGE_MODELS).map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => selectedMode === "video" ? setVideoModel(model.id) : setImageModel(model.id)}
                                            className={cn(
                                                "relative p-3 rounded-xl text-left transition-all border",
                                                (selectedMode === "video" ? videoModel : imageModel) === model.id
                                                    ? "bg-primary/10 border-primary/50"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {'tag' in model && (model as { tag?: string }).tag && (
                                                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/20 text-primary">
                                                    {(model as { tag?: string }).tag}
                                                </span>
                                            )}
                                            <p className="text-sm font-medium text-white">{model.name}</p>
                                            <p className="text-xs text-white/40 mt-0.5">{model.cost}K • {model.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Aspect Ratio */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50">Aspect Ratio</label>
                                <div className="flex gap-2">
                                    {["16:9", "9:16", "1:1", "4:3"].map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                aspectRatio === ratio
                                                    ? "bg-primary/20 border border-primary text-primary"
                                                    : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                                            )}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Advanced Options (Level 3) */}
                        <CollapsibleSection
                            title="Advanced"
                            icon={<Settings2 className="w-4 h-4" />}
                            defaultOpen={false}
                        >
                            {selectedMode === "video" && (
                                <>
                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-white/50 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            Duration: {duration[0]}s
                                        </label>
                                        <Slider
                                            value={duration}
                                            onValueChange={setDuration}
                                            min={5}
                                            max={10}
                                            step={5}
                                            className="py-2"
                                        />
                                    </div>

                                    {/* Magic Prompt Toggle */}
                                    <CollapsibleToggle
                                        label="Magic Prompt"
                                        description="AI enhances your prompt"
                                        checked={magicPrompt}
                                        onChange={setMagicPrompt}
                                        icon={<Wand2 className="w-4 h-4" />}
                                    />

                                    {/* Camera Controls */}
                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-xs font-medium text-white/50 flex items-center gap-2 mb-3">
                                            <Film className="w-3 h-3" />
                                            Camera Motion
                                        </label>
                                        <CameraControls
                                            value={cameraMotion}
                                            onValueChange={setCameraMotion}
                                            intensity={motionIntensity}
                                            onIntensityChange={setMotionIntensity}
                                            showIntensity={true}
                                        />
                                    </div>
                                </>
                            )}

                            {selectedMode === "image" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-white/50">Batch Size</label>
                                    <div className="flex gap-2">
                                        {[1, 4].map((batch) => (
                                            <button
                                                key={batch}
                                                onClick={() => setImageBatch(batch)}
                                                className={cn(
                                                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                    imageBatch === batch
                                                        ? "bg-primary/20 border border-primary text-primary"
                                                        : "bg-white/5 border border-white/10 text-white/60"
                                                )}
                                            >
                                                {batch} {batch === 1 ? "Image" : "Images"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CollapsibleSection>
                    </>
                )

            case "audio":
                return <SoundStudio />

            case "upscale":
                return (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-200">
                                💡 Select a video from your gallery on the right, then choose your upscale settings below.
                            </p>
                        </div>
                        <VideoUpscaler
                            videoUrl={activeItem?.videoUrl || ""}
                            onUpscaleComplete={() => fetchGenerations()}
                        />
                    </div>
                )

            case "story":
                return <StoryboardWizard />

            case "magic":
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-white/60 text-center">
                            Quick presets for instant creation. Click one to auto-configure settings.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {MAGIC_PRESETS.map((preset) => {
                                const Icon = preset.icon
                                return (
                                    <motion.button
                                        key={preset.id}
                                        onClick={() => handleMagicPreset(preset)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-left transition-all group"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                                            preset.color
                                        )}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="font-medium text-white group-hover:text-primary transition-colors">
                                            {preset.label}
                                        </p>
                                        <p className="text-xs text-white/50 mt-1">{preset.description}</p>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A]">
            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/10 border-b border-red-500/20 overflow-hidden"
                    >
                        <div className="px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="h-14 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                        <Film className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm text-white">{t("header.title")}</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/20 text-emerald-400">
                        v2
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <div className="h-5 w-px bg-white/10" />
                    <PhoPointsBalance variant="compact" showIcon={true} />

                    <SignedIn>
                        <div className="flex items-center gap-2">
                            {user?.firstName && (
                                <span className="text-xs text-muted-foreground hidden md:inline">
                                    {user.firstName}
                                </span>
                            )}
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                            />
                        </div>
                    </SignedIn>

                    <SignedOut>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="btn-vermilion text-xs h-8">
                                {tc("signup")}
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden bg-[#080808]">
                {/* Left Panel - Control */}
                <div className="w-[380px] border-r border-white/5 flex flex-col bg-[#0A0A0A]">
                    {/* Mode Selector */}
                    <div className="p-4 border-b border-white/5">
                        <ModeSelector
                            selectedMode={selectedMode}
                            onModeChange={setSelectedMode}
                        />
                    </div>

                    {/* Mode Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedMode}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-4"
                            >
                                {/* Mode Header */}
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        `bg-gradient-to-br ${currentMode.gradient}`
                                    )}>
                                        <currentMode.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-white">{currentMode.label}</h2>
                                        <p className="text-xs text-white/40">{currentMode.description}</p>
                                    </div>
                                </div>

                                {renderModeContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Generate Button - Sticky Bottom */}
                    {(selectedMode === "video" || selectedMode === "image") && (
                        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim() || (isImageToVideo && !uploadedImage)}
                                className={cn(
                                    "w-full h-14 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all",
                                    selectedMode === "video"
                                        ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-primary/30"
                                        : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/30"
                                )}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate {selectedMode === "video" ? "Video" : "Image"}
                                        <span className="ml-2 text-sm opacity-70">
                                            (~{(getEstimatedCost() / 1000).toFixed(0)}K)
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Workspace */}
                <WorkspacePanel
                    videoUrl={activeItem?.videoUrl || null}
                    isGenerating={isGenerating}
                    selectedGeneration={activeItem}
                    sessionGenerations={generations}
                    onGenerationSelect={setActiveItem}
                    onUpscaleComplete={fetchGenerations}
                    onExtendVideo={() => { }}
                    onAnimateImage={() => { }}
                />
            </div>
        </div>
    )
}
