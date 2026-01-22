"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { ControlPanel } from "@/components/ControlPanel"
import { WorkspacePanel } from "@/components/WorkspacePanel"
import { useStudioStore } from "@/stores/useStudioStore"
import { GenerateRequest, GenerateResponse } from "@/types"
import { Film, Coins, CheckCircle, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { formatPhoPoints } from "@/lib/pho-points"

// Model name to ID mapping
const MODEL_NAME_TO_ID: Record<string, string> = {
    "Kling 2.6 Pro": "kling-2.6-pro",
    "Wan 2.6": "wan-2.6",
    "LTX-Video": "ltx-video",
}

export default function StudioPage() {
    const t = useTranslations("studio")
    const tc = useTranslations("common")
    const tt = useTranslations("toasts")
    const { user } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get prefilled values from URL params
    const prefilledPrompt = searchParams.get("prompt") || ""
    const prefilledModelName = searchParams.get("model") || ""
    const prefilledModelId = MODEL_NAME_TO_ID[prefilledModelName] || "ltx-video"

    // Zustand Store
    const {
        generations,
        activeItem,
        isLoading: isLoadingGenerations,
        credits,
        fetchGenerations,
        addGhostGeneration,
        completeGeneration,
        failGeneration,
        setActiveItem,
        setCredits
    } = useStudioStore()

    // Local State
    const [selectedModel, setSelectedModel] = useState(prefilledModelId)
    const [duration, setDuration] = useState([5])
    const [resolution, setResolution] = useState("720p")
    const [aspectRatio, setAspectRatio] = useState("16:9")
    const [seed, setSeed] = useState("")

    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showToast, setShowToast] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [extractedImage, setExtractedImage] = useState<string | null>(null)

    // Fetch generations on mount
    useEffect(() => {
        fetchGenerations()
    }, [fetchGenerations])

    // Show toast when style is applied from URL params
    useEffect(() => {
        if (prefilledPrompt && prefilledModelName) {
            setShowToast(true)
            const timer = setTimeout(() => setShowToast(false), 4000)
            return () => clearTimeout(timer)
        }
    }, [prefilledPrompt, prefilledModelName])

    // Update model when model param changes
    useEffect(() => {
        if (prefilledModelId) setSelectedModel(prefilledModelId)
    }, [prefilledModelId])

    // Handle Payment Success
    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            setPaymentSuccess(true)

            // Wow effect!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F0421C', '#ffffff', '#FFD700']
            })

            // Refresh credits and generations
            fetchGenerations()

            // Also trigger a full data refresh for any server components
            router.refresh()

            // Cleanup URL
            const timeout = setTimeout(() => {
                setPaymentSuccess(false)
                router.replace('/studio')
            }, 5000)

            return () => clearTimeout(timeout)
        }
    }, [searchParams, router, fetchGenerations])

    const handleGenerate = async (params: Omit<GenerateRequest, "model"> & { model: string }, thumbnailUrl?: string) => {
        setIsGenerating(true)
        setError(null)

        const isImage = params.model === 'flux-pro-v1.1'
        const endpoint = isImage ? "/api/generate-image" : "/api/generate"

        // Create a temporary ID for the ghost item
        const tempId = `temp-${Date.now()}`

        // Add ghost item immediately
        addGhostGeneration(tempId, params.prompt, params.model, isImage ? 'image' : 'video', thumbnailUrl)

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `Failed to generate ${isImage ? 'image' : 'video'}`)
            }

            const result: GenerateResponse = data

            // Update the ghost item with real data
            if (result.generationId) {
                // Remove temp ghost and add real generation
                useStudioStore.getState().removeGeneration(tempId)
                useStudioStore.getState().addGeneration({
                    id: result.generationId,
                    prompt: params.prompt,
                    imageUrl: isImage ? (result.imageUrl || null) : (thumbnailUrl || null),
                    imageUrls: isImage ? (result.imageUrls || null) : null,
                    videoUrl: isImage ? null : (result.videoUrl || null),
                    upscaledUrl: null,
                    model: params.model,
                    status: 'completed',
                    cost: result.creditsUsed || 0,
                    createdAt: new Date().toISOString(),
                    type: isImage ? 'image' : 'video'
                })

                // Success effect
                confetti({
                    particleCount: 50,
                    spread: 40,
                    origin: { y: 0.8 },
                    colors: ['#F0421C', '#ffffff']
                })
            } else {
                // Fallback: complete the ghost generation
                const urlOrUrls = isImage ? (result.imageUrls || result.imageUrl) : result.videoUrl
                if (urlOrUrls) {
                    completeGeneration(tempId, urlOrUrls as any, result.creditsUsed || 0, isImage ? 'image' : 'video')
                }
            }

            if (result.creditsUsed) {
                setCredits(Math.max(0, credits - result.creditsUsed))
            }
        } catch (err) {
            console.error("Error:", err)
            setError(err instanceof Error ? err.message : `Failed to generate ${isImage ? 'image' : 'video'}. Please try again.`)
            // Mark generation as failed
            failGeneration(tempId)
        } finally {
            setIsGenerating(false)
        }
    }

    // Persistent Background Polling for generations finishing after refresh/locale switch
    useEffect(() => {
        const hasGeneratingItems = generations.some(g => g.status === 'generating')

        if (hasGeneratingItems) {
            console.log("🔄 [Studio] Pending generations detected, starting background polling...")
            const interval = setInterval(() => {
                fetchGenerations()
            }, 6000) // Poll every 6 seconds

            return () => clearInterval(interval)
        }
    }, [generations, fetchGenerations])

    const handleAnimateImage = async (imageUrl: string) => {
        try {
            // Convert image to base64 for the ImageDropzone
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                const base64data = reader.result as string
                setExtractedImage(base64data)
                // This triggers the useEffect in ControlPanel to switch mode and prefill image
            }
        } catch (error) {
            console.error("Failed to fetch image for animation:", error)
        }
    }

    // Derive media URLs from active item
    const videoUrl = activeItem?.videoUrl || null
    const imageUrl = activeItem?.imageUrl || null

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A]">
            {/* Toast Notification */}
            {/* Payment Success Toast */}
            {paymentSuccess && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
                    <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0F0F0F] border-2 border-vermilion shadow-[0_0_50px_-12px_rgba(240,66,28,0.5)] backdrop-blur-2xl">
                        <div className="p-2 bg-vermilion/20 rounded-full">
                            <Sparkles className="w-6 h-6 text-vermilion" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-tight">Payment Successful!</span>
                            <span className="text-xs text-gray-400 font-medium">Your credits have been updated instantly.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Studio Header */}
            <header className="h-14 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Film className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">{t("header.title")}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />

                    <div className="h-5 w-px bg-white/10" />

                    {/* Credit Display */}
                    <div className="credit-badge text-xs">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{t("header.credits_label")}: <strong>{formatPhoPoints(credits)}</strong></span>
                    </div>

                    {/* User Button */}
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

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
                    <p className="text-xs text-red-400 text-center">⚠️ {error}</p>
                </div>
            )}

            {/* Main Studio Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Control Panel - 320px fixed */}
                <ControlPanel
                    onGenerateAction={handleGenerate}
                    isGenerating={isGenerating}
                    selectedModel={selectedModel}
                    onSelectModelAction={setSelectedModel}
                    initialPrompt={prefilledPrompt}
                    duration={duration}
                    setDurationAction={setDuration}
                    resolution={resolution}
                    setResolutionAction={setResolution}
                    aspectRatio={aspectRatio}
                    setAspectRatioAction={setAspectRatio}
                    seed={seed}
                    setSeedAction={setSeed}
                    extractedImage={extractedImage}
                    onImageUsed={() => setExtractedImage(null)}
                />

                {/* Workspace Panel - Flex Grow */}
                <WorkspacePanel
                    videoUrl={videoUrl}
                    isGenerating={isGenerating}
                    selectedGeneration={activeItem}
                    sessionGenerations={generations}
                    onGenerationSelect={setActiveItem}
                    onUpscaleComplete={fetchGenerations}
                    onExtendVideo={(img, prompt) => {
                        setExtractedImage(img)
                    }}
                    onAnimateImage={handleAnimateImage}
                />
            </div>
        </div>
    )
}
