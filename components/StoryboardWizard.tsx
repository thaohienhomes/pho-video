"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion"
import {
    BookOpen,
    Film,
    Music,
    Play,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Check,
    AlertCircle,
    Video,
    FileText,
    Wand2,
    GripVertical,
    Trash2,
    Plus,
    RefreshCw,
    Edit3,
    Copy,
    Image as ImageIcon,
    Clock,
    Layers,
    MapPin,
    Palette,
    Camera,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface StoryboardWizardProps {
    onComplete?: (finalVideoUrl: string) => void
}

type WizardStep = "story" | "scenes" | "settings" | "generating" | "complete"

interface Scene {
    id: string
    number: number
    description: string
    duration: number
    thumbnailUrl?: string
    videoUrl?: string
    status: "pending" | "generating" | "completed" | "failed"
    error?: string
    // Mockup metadata fields
    location?: string
    time?: string
    mood?: string
    shotType?: string
}

const VIDEO_MODELS = [
    { id: "pho-instant", name: "Phở Instant", description: "Fast generation", costPer5s: 50 },
    { id: "pho-cinematic", name: "Phở Cinematic", description: "Best quality", costPer5s: 75 },
    { id: "pho-fast", name: "Phở Fast", description: "Budget-friendly", costPer5s: 40 },
]

// Scene card component for editing
function SceneCard({
    scene,
    onUpdate,
    onDelete,
    onDuplicate,
    canDelete,
    dragControls,
}: {
    scene: Scene
    onUpdate: (updates: Partial<Scene>) => void
    onDelete: () => void
    onDuplicate: () => void
    canDelete: boolean
    dragControls: ReturnType<typeof useDragControls>
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(scene.description)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(editText.length, editText.length)
        }
    }, [isEditing])

    const handleSave = () => {
        onUpdate({ description: editText.trim() })
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.metaKey) {
            handleSave()
        }
        if (e.key === "Escape") {
            setEditText(scene.description)
            setIsEditing(false)
        }
    }

    return (
        <motion.div
            layout
            className="group relative p-4 rounded-[var(--pho-radius-xl)] bg-[var(--pho-glass-light)] border border-[var(--pho-border-default)] hover:border-[var(--pho-border-strong)] transition-all"
        >
            {/* Drag Handle */}
            <div
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <GripVertical className="w-4 h-4 text-white/30" />
            </div>

            <div className="pl-6 space-y-3">
                {/* Scene Header - With padded numbered badge matching mockup */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Padded number badge (01, 02, 03, etc.) */}
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                            {String(scene.number).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-white/40 uppercase tracking-wide">Scene {String(scene.number).padStart(2, '0')}</span>
                        {/* Status indicator */}
                        {scene.status === "completed" && (
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Complete
                            </span>
                        )}
                        {scene.status === "generating" && (
                            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Generating
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Edit"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onDuplicate}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="Duplicate"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                            <button
                                onClick={onDelete}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scene Content */}
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            ref={textareaRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[80px] bg-white/5 border-violet-500/50 text-white text-sm resize-none focus:border-violet-500"
                            placeholder="Describe what happens in this scene..."
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40">⌘+Enter to save, Esc to cancel</span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setEditText(scene.description)
                                        setIsEditing(false)
                                    }}
                                    className="h-7 text-xs text-white/60 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="h-7 text-xs bg-violet-500 hover:bg-violet-600"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-white/70 line-clamp-3">
                        {scene.description || <span className="italic text-white/40">Click to add description...</span>}
                    </p>
                )}

                {/* Scene Footer */}
                <div className="flex items-center gap-3 text-xs text-white/40">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{scene.duration}s</span>
                    </div>
                    {scene.thumbnailUrl && (
                        <div className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Has thumbnail</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// Wrapper component to properly use useDragControls hook
function DraggableSceneItem({
    scene,
    scenes,
    updateScene,
    deleteScene,
    duplicateScene,
}: {
    scene: Scene
    scenes: Scene[]
    updateScene: (id: string, updates: Partial<Scene>) => void
    deleteScene: (id: string) => void
    duplicateScene: (id: string) => void
}) {
    const dragControls = useDragControls()
    return (
        <Reorder.Item
            key={scene.id}
            value={scene}
            dragListener={false}
            dragControls={dragControls}
        >
            <SceneCard
                scene={scene}
                onUpdate={(updates) => updateScene(scene.id, updates)}
                onDelete={() => deleteScene(scene.id)}
                onDuplicate={() => duplicateScene(scene.id)}
                canDelete={scenes.length > 1}
                dragControls={dragControls}
            />
        </Reorder.Item>
    )
}

export function StoryboardWizard({ onComplete }: StoryboardWizardProps) {
    const t = useTranslations("storyboard")
    const [step, setStep] = useState<WizardStep>("story")

    // Story input
    const [story, setStory] = useState("")
    const [sceneCount, setSceneCount] = useState(3)
    const [isEnhancing, setIsEnhancing] = useState(false)

    // Scenes (parsed and editable)
    const [scenes, setScenes] = useState<Scene[]>([])
    const [isParsingScenes, setIsParsingScenes] = useState(false)

    // Settings
    const [videoModel, setVideoModel] = useState("pho-instant")
    const [duration, setDuration] = useState(5)
    const [addMusic, setAddMusic] = useState(true)
    const [musicPrompt, setMusicPrompt] = useState("")

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false)
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Scene Preview selection (for 3-column layout)
    const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
    const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0]

    // Calculate estimated cost
    const selectedModel = VIDEO_MODELS.find(m => m.id === videoModel)!
    const videoCost = scenes.length * (selectedModel.costPer5s * (duration / 5)) * 1000
    const musicCost = addMusic ? 30000 : 0
    const baseCost = 500000
    const totalCost = baseCost + videoCost + musicCost

    // Parse story into scenes using AI
    const handleParseScenes = async () => {
        setIsParsingScenes(true)
        setError(null)

        try {
            // Simulate AI parsing (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Simple sentence-based splitting for demo
            const sentences = story
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 10)

            const scenesPerTarget = Math.ceil(sentences.length / sceneCount)
            const parsedScenes: Scene[] = []

            for (let i = 0; i < sceneCount; i++) {
                const startIdx = i * scenesPerTarget
                const endIdx = Math.min(startIdx + scenesPerTarget, sentences.length)
                const sceneText = sentences.slice(startIdx, endIdx).join(". ")

                parsedScenes.push({
                    id: `scene-${Date.now()}-${i}`,
                    number: i + 1,
                    description: sceneText || `Scene ${i + 1}: [Add description]`,
                    duration: duration,
                    status: "pending",
                })
            }

            setScenes(parsedScenes)
            setStep("scenes")
        } catch (err) {
            setError("Failed to parse story. Please try again.")
        } finally {
            setIsParsingScenes(false)
        }
    }

    // Scene management
    const updateScene = (id: string, updates: Partial<Scene>) => {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    const deleteScene = (id: string) => {
        setScenes(prev => {
            const filtered = prev.filter(s => s.id !== id)
            return filtered.map((s, i) => ({ ...s, number: i + 1 }))
        })
    }

    const duplicateScene = (id: string) => {
        setScenes(prev => {
            const idx = prev.findIndex(s => s.id === id)
            if (idx === -1) return prev

            const newScene: Scene = {
                ...prev[idx],
                id: `scene-${Date.now()}`,
                number: prev.length + 1,
            }

            const updated = [...prev]
            updated.splice(idx + 1, 0, newScene)
            return updated.map((s, i) => ({ ...s, number: i + 1 }))
        })
    }

    const addNewScene = () => {
        setScenes(prev => [
            ...prev,
            {
                id: `scene-${Date.now()}`,
                number: prev.length + 1,
                description: "",
                duration: duration,
                status: "pending",
            }
        ])
    }

    const reorderScenes = (newOrder: Scene[]) => {
        setScenes(newOrder.map((s, i) => ({ ...s, number: i + 1 })))
    }

    // Generate storyboard
    const handleGenerate = async () => {
        setStep("generating")
        setIsGenerating(true)
        setError(null)

        // Mark all scenes as generating
        setScenes(prev => prev.map(s => ({ ...s, status: "generating" as const })))

        try {
            const response = await fetch("/api/ai/storyboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    story,
                    scenes: scenes.map(s => ({
                        number: s.number,
                        description: s.description,
                        duration: s.duration,
                    })),
                    videoModel,
                    duration,
                    musicPrompt: addMusic ? (musicPrompt || `Background music for: ${story.substring(0, 100)}`) : undefined,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Storyboard generation failed")
            }

            const data = await response.json()

            // Update scenes with results
            if (data.scenes) {
                setScenes(prev => prev.map((s, i) => ({
                    ...s,
                    videoUrl: data.scenes[i]?.videoUrl,
                    status: data.scenes[i]?.videoUrl ? "completed" : "failed",
                })))
            }

            onComplete?.(data.finalVideoUrl)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Generation failed")
            setScenes(prev => prev.map(s => ({ ...s, status: "failed" as const })))
            setStep("scenes")
        } finally {
            setIsGenerating(false)
        }
    }

    const stepLabels = [
        t("steps.story"),
        t("steps.scenes"),
        t("steps.settings"),
        t("steps.generate"),
        t("steps.complete")
    ]
    const stepOrder: WizardStep[] = ["story", "scenes", "settings", "generating", "complete"]
    const currentStepIndex = stepOrder.indexOf(step)

    return (
        <div className="w-full rounded-[var(--pho-radius-xl)] bg-[var(--pho-glass-medium)] backdrop-blur-[var(--pho-blur-lg)] border border-[var(--pho-border-default)] overflow-hidden">
            {/* Header with Step Progress - VERMILION THEME */}
            <div className="px-6 py-4 border-b border-[var(--pho-border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--pho-radius-lg)] bg-gradient-to-br from-[#F0421C] to-[#DC2626] flex items-center justify-center shadow-[0_0_15px_rgba(240,66,28,0.4)]">
                        <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--pho-text-primary)]">Storyboard Wizard</h3>
                        <p className="text-sm text-[var(--pho-text-muted)]">{t("subtitle")}</p>
                    </div>
                </div>
                {/* Step X of 4 indicator matching mockup */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0421C]/10 border border-[#F0421C]/20">
                    <span className="text-sm font-semibold text-[#F0421C]">
                        Step {currentStepIndex + 1} of 4
                    </span>
                    <span className="text-sm text-white/30">:</span>
                    <span className="text-sm text-white/70">{stepLabels[currentStepIndex]}</span>
                </div>
            </div>

            {/* Progress Bar - SEGMENTED VERMILION */}
            <div className="px-6 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {stepLabels.slice(0, -1).map((label, i) => (
                        <div key={label} className="flex-1 flex items-center gap-2">
                            {/* Segment */}
                            <div className={cn(
                                "flex-1 h-1.5 rounded-full transition-all",
                                currentStepIndex > i
                                    ? "bg-gradient-to-r from-[#F0421C] to-[#FF5C3A]"
                                    : currentStepIndex === i
                                        ? "bg-gradient-to-r from-[#F0421C] to-[#F0421C]/50"
                                        : "bg-white/10"
                            )} />
                            {/* Dot indicator at end of segment */}
                            {i < stepLabels.length - 2 && (
                                <div className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    currentStepIndex > i
                                        ? "bg-[#F0421C] shadow-[0_0_6px_rgba(240,66,28,0.6)]"
                                        : "bg-white/20"
                                )} />
                            )}
                        </div>
                    ))}
                    {/* Final step number */}
                    <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        currentStepIndex >= 3
                            ? "bg-[#F0421C] text-white"
                            : "bg-white/10 text-white/50"
                    )}>
                        4
                    </div>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Story Input */}
                    {step === "story" && (
                        <motion.div
                            key="story"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {t("step1.label")}
                                </label>
                                <div className="relative">
                                    <Textarea
                                        value={story}
                                        onChange={(e) => setStory(e.target.value)}
                                        placeholder={t("step1.placeholder")}
                                        className="min-h-[160px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none pr-12"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!story.trim() || isEnhancing) return
                                            setIsEnhancing(true)
                                            try {
                                                const res = await fetch("/api/ai/enhance", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ prompt: story })
                                                })
                                                const data = await res.json()
                                                if (data.enhancedPrompt) setStory(data.enhancedPrompt)
                                            } catch (err) {
                                                console.error("Enhance failed:", err)
                                            } finally {
                                                setIsEnhancing(false)
                                            }
                                        }}
                                        disabled={!story.trim() || isEnhancing}
                                        className={cn(
                                            "absolute top-2 right-2 p-2 rounded-lg transition-all",
                                            "bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
                                            "border border-purple-500/30 hover:border-purple-500/50",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                        title={t("step1.enhance_button")}
                                    >
                                        {isEnhancing ? (
                                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                        ) : (
                                            <Wand2 className="w-4 h-4 text-purple-400" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-white/40">
                                    {t("step1.char_count", { count: story.length })} • {t("step1.tip")}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/70">
                                    {t("step1.target_scenes", { count: sceneCount })}
                                </label>
                                <Slider
                                    value={[sceneCount]}
                                    onValueChange={([v]) => setSceneCount(v)}
                                    min={2}
                                    max={8}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>{t("step1.min_scenes")}</span>
                                    <span>{t("step1.max_scenes")}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleParseScenes}
                                disabled={!story.trim() || story.length < 20 || isParsingScenes}
                                className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                            >
                                {isParsingScenes ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t("step1.parsing")}
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 mr-2" />
                                        {t("step1.parse_button")}
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Scene Editor - 3-COLUMN LAYOUT MATCHING MOCKUP */}
                    {step === "scenes" && (
                        <motion.div
                            key="scenes"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* 3-Column Grid */}
                            <div className="grid grid-cols-12 gap-4 min-h-[400px]">
                                {/* LEFT: Script Input (3 cols) - NEON GLOW */}
                                <div className="col-span-3 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#0F0F15] border border-[#F0421C]/30 p-4 flex flex-col gap-3 shadow-[0_0_25px_rgba(240,66,28,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(240,66,28,0.15)] transition-shadow duration-500">
                                    <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F0421C] to-[#FF5C3A] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#F0421C] animate-pulse shadow-[0_0_8px_rgba(240,66,28,0.8)]" />
                                        Script Input
                                    </h4>
                                    <div className="flex-1 rounded-xl bg-gradient-to-br from-[#0F0F12] to-[#080810] border border-[#F0421C]/10 p-3 overflow-y-auto text-xs text-white/70 leading-relaxed max-h-[300px] shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
                                        {story.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2">{line || '\u00A0'}</p>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={handleParseScenes}
                                        disabled={isParsingScenes}
                                        className={cn(
                                            "w-full h-11 rounded-xl text-sm font-bold",
                                            "bg-gradient-to-r from-[#F0421C] via-[#DC2626] to-[#B91C1C]",
                                            "hover:from-[#FF5C3A] hover:via-[#F0421C] hover:to-[#DC2626]",
                                            "shadow-[0_0_20px_rgba(240,66,28,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
                                            "hover:shadow-[0_0_30px_rgba(240,66,28,0.5)]",
                                            "transition-all duration-300 hover:scale-[1.02]"
                                        )}
                                    >
                                        {isParsingScenes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                        Parse into Scenes
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>

                                {/* CENTER: Scene Editor (5 cols) - CREATOR VIBES */}
                                <div className="col-span-5 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#12121A] border border-white/15 p-4 flex flex-col gap-3 shadow-[0_0_20px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#F0421C]/30 hover:shadow-[0_0_30px_rgba(240,66,28,0.1)] transition-all duration-500">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-[#F0421C]" />
                                            Scene List
                                        </h4>
                                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-[#F0421C]/10 border border-transparent hover:border-[#F0421C]/30 transition-all">
                                            <Search className="w-4 h-4 text-white/40 hover:text-[#F0421C]" />
                                        </button>
                                    </div>

                                    {/* Scene Cards - Horizontal Layout */}
                                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] pr-1">
                                        {scenes.map((scene) => (
                                            <div
                                                key={scene.id}
                                                onClick={() => setSelectedSceneId(scene.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all",
                                                    "bg-white/5 hover:bg-white/10 border",
                                                    selectedSceneId === scene.id || (!selectedSceneId && scene.id === scenes[0]?.id)
                                                        ? "border-[#F0421C]/50 shadow-[0_0_10px_rgba(240,66,28,0.15)]"
                                                        : "border-transparent"
                                                )}
                                            >
                                                {/* Drag Handle */}
                                                <GripVertical className="w-4 h-4 text-white/20 cursor-grab flex-shrink-0" />

                                                {/* Number Badge */}
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F0421C] to-[#DC2626] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(240,66,28,0.4)]">
                                                    <span className="text-white text-xs font-bold">{String(scene.number).padStart(2, '0')}</span>
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="w-16 h-12 rounded-lg bg-[#0F0F12] border border-white/10 overflow-hidden flex-shrink-0">
                                                    {scene.thumbnailUrl ? (
                                                        <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-4 h-4 text-white/20" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-white/70 line-clamp-2">{scene.description || 'No description'}</p>
                                                </div>

                                                {/* Status Button */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {scene.status === "completed" && (
                                                        <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1.5">
                                                            <Check className="w-3 h-3" /> Complete
                                                        </span>
                                                    )}
                                                    {scene.status === "generating" && (
                                                        <span className="px-3 py-1.5 rounded-lg bg-[#F0421C]/20 text-[#F0421C] text-xs font-medium flex items-center gap-1.5">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> Generating
                                                        </span>
                                                    )}
                                                    {scene.status === "pending" && (
                                                        <button className="px-3 py-1.5 rounded-lg bg-[#F0421C]/80 hover:bg-[#F0421C] text-white text-xs font-medium transition-colors">
                                                            Generate
                                                        </button>
                                                    )}

                                                    {/* Checkbox */}
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                        scene.status === "completed"
                                                            ? "border-green-500 bg-green-500"
                                                            : "border-white/20"
                                                    )}>
                                                        {scene.status === "completed" && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Scene */}
                                        <button
                                            onClick={addNewScene}
                                            className="flex items-center gap-3 p-2 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-white/40 hover:text-white/60 transition-colors w-full"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs">Add new scene</span>
                                        </button>
                                    </div>
                                </div>

                                {/* RIGHT: Scene Preview (4 cols) - PREMIUM PREVIEW */}
                                <div className="col-span-4 rounded-xl bg-gradient-to-br from-[#1A1A1F] to-[#0F0F15] border border-[#F0421C]/20 p-4 flex flex-col gap-3 shadow-[0_0_25px_rgba(240,66,28,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(240,66,28,0.12)] transition-shadow duration-500">
                                    <h4 className="text-sm font-bold text-white/50 flex items-center gap-2">
                                        <Film className="w-4 h-4 text-[#F0421C]/60" />
                                        Scene Preview
                                    </h4>

                                    {/* Large Preview Image - CINEMA FRAME */}
                                    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[#0F0F12] to-[#080810] border border-white/10 overflow-hidden group shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                                        {selectedScene?.thumbnailUrl ? (
                                            <img src={selectedScene.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0421C]/10 to-transparent flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-[#F0421C]/30" />
                                                </div>
                                                <p className="text-xs text-white/30">No preview available</p>
                                            </div>
                                        )}
                                        {/* Vermilion border on hover */}
                                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#F0421C]/40 transition-colors duration-300 pointer-events-none" />
                                    </div>

                                    {/* Edit Prompt Button - ENHANCED */}
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 rounded-xl font-semibold",
                                            "border-[#F0421C]/40 text-[#F0421C]",
                                            "bg-gradient-to-r from-[#F0421C]/5 to-transparent",
                                            "hover:from-[#F0421C]/15 hover:to-[#F0421C]/5",
                                            "hover:border-[#F0421C]/60 hover:shadow-[0_0_15px_rgba(240,66,28,0.2)]",
                                            "transition-all duration-300"
                                        )}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Prompt
                                    </Button>

                                    {/* Scene Details - GLASSMORPHISM */}
                                    {selectedScene && (
                                        <div className="rounded-xl bg-gradient-to-br from-[#0F0F12] to-[#080810] border border-[#F0421C]/15 p-3 space-y-2 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                                    Scene {String(selectedScene.number).padStart(2, '0')} - Details
                                                </h5>
                                                <button className="p-1 rounded-lg hover:bg-[#F0421C]/10 transition-colors">
                                                    <AlertCircle className="w-3 h-3 text-[#F0421C]/40" />
                                                </button>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors">
                                                    <MapPin className="w-3.5 h-3.5 text-[#F0421C]" />
                                                    <span>Location:</span>
                                                    <span className="text-white font-medium">{selectedScene.location || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors">
                                                    <Clock className="w-3.5 h-3.5 text-[#F0421C]" />
                                                    <span>Time:</span>
                                                    <span className="text-white font-medium">{selectedScene.time || 'Day'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors">
                                                    <Palette className="w-3.5 h-3.5 text-[#F0421C]" />
                                                    <span>Mood:</span>
                                                    <span className="text-white font-medium">{selectedScene.mood || 'Neutral'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors">
                                                    <Camera className="w-3.5 h-3.5 text-[#F0421C]" />
                                                    <span>Shot Type:</span>
                                                    <span className="text-white font-medium">{selectedScene.shotType || 'Medium'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Bar - Total Cost + Generate All */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#1A1A1F] via-[#1E1A1A] to-[#1A1A1F] border border-[#F0421C]/20 shadow-[0_-5px_30px_rgba(240,66,28,0.08)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#F0421C]/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-[#F0421C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40">Total cost:</p>
                                        <p className="text-lg font-bold text-white">~{Math.round(totalCost / 1000)}K <span className="text-xs font-normal text-white/40">for {scenes.length} scenes</span></p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setStep("settings")}
                                    disabled={scenes.length === 0 || scenes.some(s => !s.description.trim())}
                                    className={cn(
                                        "h-11 px-8 rounded-xl text-sm font-bold",
                                        "bg-gradient-to-r from-[#F0421C] via-[#DC2626] to-[#B91C1C]",
                                        "hover:from-[#FF5C3A] hover:via-[#F0421C] hover:to-[#DC2626]",
                                        "shadow-[0_0_25px_rgba(240,66,28,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
                                        "hover:shadow-[0_0_35px_rgba(240,66,28,0.5)]",
                                        "transition-all duration-300 hover:scale-105"
                                    )}
                                >
                                    Generate All Scenes
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Settings */}
                    {step === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            {/* Video Model */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    {t("step3.video_model")}
                                </label>
                                <Select value={videoModel} onValueChange={setVideoModel}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10">
                                        {VIDEO_MODELS.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id}
                                                className="text-white hover:bg-white/10"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{t(`models.${model.id.replace(/-/g, '_')}`)}</span>
                                                    <span className="text-xs text-white/40 ml-4">
                                                        {t("step3.cost_per_5s", { cost: model.costPer5s })}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration per scene */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/70">
                                    {t("step3.duration_per_scene", { duration: duration })}
                                </label>
                                <Slider
                                    value={[duration]}
                                    onValueChange={([v]) => {
                                        setDuration(v)
                                        setScenes(prev => prev.map(s => ({ ...s, duration: v })))
                                    }}
                                    min={5}
                                    max={10}
                                    step={5}
                                    className="py-2"
                                />
                            </div>

                            {/* Add Music Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <Music className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{t("step3.add_music_title")}</p>
                                        <p className="text-xs text-white/50">{t("step3.add_music_desc")}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={addMusic}
                                    onCheckedChange={setAddMusic}
                                />
                            </div>

                            {addMusic && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-white/70">
                                        {t("step3.music_style")}
                                    </label>
                                    <Textarea
                                        value={musicPrompt}
                                        onChange={(e) => setMusicPrompt(e.target.value)}
                                        placeholder={t("step3.music_placeholder")}
                                        className="min-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                                    />
                                </motion.div>
                            )}

                            {/* Cost Summary */}
                            <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/30">
                                <h4 className="text-sm font-medium text-white mb-2">{t("step3.cost_estimate")}</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between text-white/60">
                                        <span>{t("step3.base_cost")}</span>
                                        <span>500K</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>{t("step3.video_cost", { count: scenes.length, duration })}</span>
                                        <span>{(videoCost / 1000).toFixed(0)}K</span>
                                    </div>
                                    {addMusic && (
                                        <div className="flex justify-between text-white/60">
                                            <span>{t("step3.music_cost")}</span>
                                            <span>30K</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/10">
                                        <span>{t("step3.total")}</span>
                                        <span>{(totalCost / 1000).toFixed(0)}K Phở</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("scenes")}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    {t("step2.back")}
                                </Button>
                                <Button
                                    onClick={handleGenerate}
                                    className="flex-[2] h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    {t("step3.generate_button")}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Generating */}
                    {step === "generating" && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6 py-4"
                        >
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    {t("step4.generating_title")}
                                </h3>
                            </div>

                            {/* Scene Progress */}
                            <div className="space-y-3">
                                {scenes.map((scene) => (
                                    <div
                                        key={scene.id}
                                        className={cn(
                                            "p-3 rounded-lg border transition-all",
                                            scene.status === "completed"
                                                ? "bg-green-500/10 border-green-500/30"
                                                : scene.status === "failed"
                                                    ? "bg-red-500/10 border-red-500/30"
                                                    : "bg-white/5 border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                scene.status === "completed" ? "bg-green-500" :
                                                    scene.status === "failed" ? "bg-red-500" :
                                                        "bg-white/10"
                                            )}>
                                                {scene.status === "completed" ? (
                                                    <Check className="w-4 h-4 text-white" />
                                                ) : scene.status === "failed" ? (
                                                    <AlertCircle className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">
                                                    Scene {scene.number}
                                                </p>
                                                <p className="text-xs text-white/50 line-clamp-1">
                                                    {scene.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Complete */}
                    {step === "complete" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                    Storyboard Complete! 🎬
                                </h3>
                                <p className="text-sm text-white/50">
                                    Your {scenes.length}-scene video is ready
                                </p>
                            </div>

                            {/* Video Preview */}
                            {finalVideoUrl && (
                                <div className="rounded-xl overflow-hidden bg-black border border-white/10">
                                    <video
                                        src={finalVideoUrl}
                                        controls
                                        className="w-full aspect-video"
                                    />
                                </div>
                            )}

                            {/* Scene Summary */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-white/70">Scenes Generated</h4>
                                {scenes.filter(s => s.status === "completed").map((scene) => (
                                    <div
                                        key={scene.id}
                                        className="p-3 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <p className="text-sm text-white">
                                            <span className="text-white/50">Scene {scene.number}:</span>{" "}
                                            {scene.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={finalVideoUrl || "#"}
                                    download
                                    className="flex-1 py-3 px-4 rounded-lg bg-green-500 text-white text-center font-medium hover:bg-green-600 transition-colors"
                                >
                                    Download Video
                                </a>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep("story")
                                        setStory("")
                                        setScenes([])
                                        setFinalVideoUrl(null)
                                    }}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Create New
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
