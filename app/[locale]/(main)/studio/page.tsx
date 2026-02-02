"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
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
import { LipSyncStudio } from "@/components/LipSyncStudio"
import { TryOnStudio } from "@/components/TryOnStudio"
import { BatchSizeSelector } from "@/components/BatchSizeSelector"
import { useStudioStore } from "@/stores/useStudioStore"
// Pixel-perfect studio components
import {
    ModelCard,
    ModelCardGrid,
    GenerateButton,
    AspectRatioSelector,
    VideoStage,
    ColorfulThumbnailDock,
    PixelPerfectModeSelector,
    VideoInputTabs,
    CleanPromptInput,
    MockupSidebar,
    ImageStage,
    CompactModelGrid,
    HistorySidebar,
} from "@/components/studio"
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
    lipsync: { expressionScale: 1.0, preprocess: "crop" },
    tryon: { garmentType: "auto" },
    upscale: { model: "standard", scale: 2 },
    story: { scenes: 3, duration: 5 },
    magic: {},
}

// Video models
const VIDEO_MODELS = [
    { id: "pho-instant", name: "Phở Instant", cost: 50, description: "Fast & balanced", tag: "Popular" },
    { id: "pho-cinematic", name: "Phở Cinematic", cost: 75, description: "Best quality", tag: "Pro" },
    { id: "pho-fast", name: "Phở Fast", cost: 40, description: "Budget-friendly", tag: "" },
    { id: "pho-motion", name: "Phở Motion", cost: 60, description: "Best for I2V", tag: "I2V", isNew: true },
    { id: "pho-grok", name: "Grok Audio", cost: 150, description: "Video with AI audio", tag: "Audio", isNew: true },
]

// Image models  
const IMAGE_MODELS = [
    { id: "flux-pro-v1.1", name: "Flux Pro 1.1", cost: 20, description: "Photorealistic", tag: "Best" },
    { id: "recraft-v3", name: "Recraft V3", cost: 25, description: "Artistic styles", tag: "" },
    { id: "nano-banana-pro", name: "Nano Banana Pro", cost: 15, description: "Fast & efficient", tag: "Budget", isNew: true },
    { id: "grok-image", name: "Grok Image", cost: 30, description: "xAI quality", tag: "New", isNew: true },
]

// Image Style Presets (matching mockup)
const IMAGE_STYLE_PRESETS = [
    { id: "cinematic", label: "Cinematic", thumbnail: "/images/presets/cinematic.jpg", prompt: "cinematic lighting, dramatic shadows, film grain, 8K" },
    { id: "anime", label: "Anime", thumbnail: "/images/presets/anime.jpg", prompt: "anime style, vibrant colors, detailed linework" },
    { id: "realistic", label: "Realistic", thumbnail: "/images/presets/realistic.jpg", prompt: "hyperrealistic, photorealistic, ultra detailed" },
    { id: "artistic", label: "Artistic", thumbnail: "/images/presets/artistic.jpg", prompt: "artistic, painterly style, expressive brushstrokes" },
    { id: "abstract", label: "Abstract", thumbnail: "/images/presets/abstract.jpg", prompt: "abstract art, geometric shapes, bold colors" },
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

export default function StudioPage() {
    const t = useTranslations("studio")
    const tc = useTranslations("common")
    const { user } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Mode state
    const [selectedMode, setSelectedMode] = useState<CreationMode>("video")
    const [prompt, setPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)
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

    // Generate function
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
                if (!response.ok) throw new Error(data.error || t("video_failed"))

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
                if (!response.ok) throw new Error(data.error || t("image_failed"))

                completeGeneration(tempId, data.imageUrl || data.imageUrls, data.creditsUsed, "image")
                confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 }, colors: ['#3B82F6', '#ffffff'] })
            }
        } catch (err) {
            console.error("Generation error:", err)
            setError(err instanceof Error ? err.message : t("gen_failed"))
            failGeneration(tempId)
        } finally {
            setIsGenerating(false)
        }
    }, [prompt, selectedMode, videoModel, duration, aspectRatio, magicPrompt, isImageToVideo, uploadedImage, imageModel, imageBatch, addGhostGeneration, completeGeneration, failGeneration, t])

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
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [prompt, isGenerating, error, user, handleGenerate])

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

    // Handle deep link from Try-On to Video
    const handleNavigateToVideo = (imageUrl: string) => {
        setSelectedMode("video")
        setIsImageToVideo(true)
        setUploadedImage(imageUrl)
        // Select "Phở Motion" or standard model optimized for I2V
        setVideoModel("pho-motion")
        setPrompt("Fashion runway walk, cinematic lighting, 4k, confident strut, high fashion, photorealistic 8k, slow motion")

        // Add minimal delay to ensure state updates before scroll/render
        setTimeout(() => {
            const textarea = document.querySelector('textarea')
            if (textarea) textarea.focus()
        }, 100)
    }

    // Mode-specific content is now rendered by MockupSidebar component


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

            {/* Main Layout - 3-Panel Design Matching Mockup */}
            <div className="flex flex-1 overflow-hidden bg-[#080808]">
                {/* Left Sidebar - MockupSidebar (Pixel-Perfect Mockup Match) */}
                {selectedMode !== "tryon" && (
                    <MockupSidebar
                        selectedMode={selectedMode}
                        onModeChange={(mode) => setSelectedMode(mode as CreationMode)}
                        activeTab={isImageToVideo ? "image" : "text"}
                        onTabChange={(tab) => setIsImageToVideo(tab === "image")}
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onEnhance={async () => {
                            if (!prompt.trim()) return
                            setIsEnhancing(true)
                            try {
                                const res = await fetch("/api/ai/enhance", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ prompt })
                                })
                                const data = await res.json()
                                if (data.enhancedPrompt) setPrompt(data.enhancedPrompt)
                            } catch (err) {
                                console.error("Enhance failed:", err)
                            } finally {
                                setIsEnhancing(false)
                            }
                        }}
                        isEnhancing={isEnhancing}

                        // Dynamic Model Selection
                        selectedModel={selectedMode === "image" ? imageModel : videoModel}
                        onModelChange={(id) => selectedMode === "image" ? setImageModel(id) : setVideoModel(id)}
                        models={selectedMode === "image" ? IMAGE_MODELS : VIDEO_MODELS}

                        // Image Mode Extras
                        stylePresets={IMAGE_STYLE_PRESETS}
                        onStyleSelect={(stylePrompt) => setPrompt(prev => prev ? `${prev}, ${stylePrompt}` : stylePrompt)}
                        batchSize={imageBatch}
                        onBatchSizeChange={setImageBatch}

                        aspectRatio={aspectRatio}
                        onAspectChange={setAspectRatio}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                )}


                {/* Main Stage - Flexible Width - Matching Mockup */}
                {selectedMode !== "tryon" && (
                    <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
                        {/* Conditional Stage Rendering - Mode-Specific Components */}
                        {selectedMode === "audio" ? (
                            /* Sound Studio - Purple Theme */
                            <div className="flex-1 overflow-y-auto p-6">
                                <SoundStudio />
                            </div>
                        ) : selectedMode === "lipsync" ? (
                            /* Lip Sync Studio - Pink Theme */
                            <div className="flex-1 overflow-y-auto p-6">
                                <LipSyncStudio />
                            </div>
                        ) : selectedMode === "upscale" ? (
                            /* Video Upscaler */
                            <div className="flex-1 overflow-y-auto p-6">
                                <VideoUpscaler
                                    videoUrl={activeItem?.videoUrl || ""}
                                    onUpscaleComplete={() => fetchGenerations()}
                                />
                            </div>
                        ) : selectedMode === "story" ? (
                            /* Storyboard Wizard */
                            <div className="flex-1 overflow-y-auto p-6">
                                <StoryboardWizard />
                            </div>
                        ) : selectedMode === "image" ? (
                            <ImageStage
                                aspectRatio={aspectRatio}
                                images={activeItem?.imageUrls || (activeItem?.imageUrl ? [activeItem.imageUrl] : [])}
                                isGenerating={isGenerating}
                                onDownload={(url) => window.open(url, '_blank')}
                                onDownloadAll={() => {
                                    const urls = activeItem?.imageUrls || (activeItem?.imageUrl ? [activeItem.imageUrl] : []);
                                    urls.forEach(url => window.open(url, '_blank'));
                                }}
                                onRemix={(url) => {
                                    // Switch to I2V mode with this image
                                    setUploadedImage(url);
                                    setIsImageToVideo(true);
                                    setSelectedMode("video");
                                }}
                                onAnimate={(url) => {
                                    handleNavigateToVideo(url);
                                }}
                                onSelectTemplate={(template) => {
                                    // Fill prompt from template
                                    setPrompt(template.prompt);
                                    // Set aspect ratio if provided
                                    if (template.aspectRatio) {
                                        setAspectRatio(template.aspectRatio);
                                    }
                                }}
                                onPasteImage={(imageData) => {
                                    // Switch to I2V mode with pasted image
                                    setUploadedImage(imageData);
                                    setIsImageToVideo(true);
                                    setSelectedMode("video");
                                }}
                                onRandomize={(prompt, ar) => {
                                    // Fill prompt and aspect ratio from random template
                                    setPrompt(prompt);
                                    setAspectRatio(ar);
                                }}
                            />
                        ) : (
                            /* Video Stage - Large Preview + Action Buttons */
                            <VideoStage
                                videoUrl={activeItem?.videoUrl}
                                isGenerating={isGenerating}
                                aspectRatio={aspectRatio as "16:9" | "9:16" | "1:1" | "4:3"}
                                onDownload={() => {
                                    if (activeItem?.videoUrl) {
                                        window.open(activeItem.videoUrl, '_blank')
                                    }
                                }}
                                onShare={() => {
                                    if (activeItem?.videoUrl) {
                                        navigator.clipboard.writeText(activeItem.videoUrl)
                                    }
                                }}
                                onExtend={() => { }}
                                onAddSound={() => setSelectedMode("audio")}
                                onUpscale={() => setSelectedMode("upscale")}
                            />
                        )}

                    </main>
                )}

                {/* Right Sidebar - History (Video Mode Only) */}
                {selectedMode === "video" && (
                    <HistorySidebar
                        generations={generations}
                        activeItem={activeItem}
                        onSelect={setActiveItem}
                        className="hidden xl:flex"
                    />
                )}

                {/* TryOnStudio - Full Width Mode */}
                {selectedMode === "tryon" && (
                    <TryOnStudio
                        onBackToModes={() => setSelectedMode("video")}
                        onNavigateToVideo={handleNavigateToVideo}
                    />
                )}
            </div>
        </div >
    )
}
