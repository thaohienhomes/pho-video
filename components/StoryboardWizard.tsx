"use client"

import { useState, useRef, useEffect } from "react"
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
    Layers
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
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
        >
            {/* Drag Handle */}
            <div
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <GripVertical className="w-4 h-4 text-white/30" />
            </div>

            <div className="pl-6 space-y-3">
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium flex items-center justify-center">
                            {scene.number}
                        </span>
                        <span className="text-xs text-white/40">Scene {scene.number}</span>
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
    const [step, setStep] = useState<WizardStep>("story")

    // Story input
    const [story, setStory] = useState("")
    const [sceneCount, setSceneCount] = useState(3)

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

            setFinalVideoUrl(data.finalVideoUrl)
            setStep("complete")
            onComplete?.(data.finalVideoUrl)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Generation failed")
            setScenes(prev => prev.map(s => ({ ...s, status: "failed" as const })))
            setStep("scenes")
        } finally {
            setIsGenerating(false)
        }
    }

    const stepLabels = ["Story", "Scenes", "Settings", "Generate", "Complete"]
    const stepOrder: WizardStep[] = ["story", "scenes", "settings", "generating", "complete"]
    const currentStepIndex = stepOrder.indexOf(step)

    return (
        <div className="w-full rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Phở Storyboard</h3>
                    <p className="text-sm text-white/50">Transform your story into a video</p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                {stepLabels.slice(0, -1).map((label, i) => (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                currentStepIndex === i ? "bg-violet-500 text-white" :
                                    currentStepIndex > i ? "bg-green-500 text-white" : "bg-white/10 text-white/50"
                            )}>
                                {currentStepIndex > i ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className="text-[10px] text-white/40 mt-1 hidden md:block">{label}</span>
                        </div>
                        {i < stepLabels.length - 2 && (
                            <div className={cn(
                                "w-12 h-0.5 mx-2",
                                currentStepIndex > i ? "bg-green-500" : "bg-white/10"
                            )} />
                        )}
                    </div>
                ))}
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
                                    Your Story
                                </label>
                                <Textarea
                                    value={story}
                                    onChange={(e) => setStory(e.target.value)}
                                    placeholder="Once upon a time in a futuristic city, a young inventor discovered a secret that would change the world..."
                                    className="min-h-[160px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                                />
                                <p className="text-xs text-white/40">
                                    {story.length} characters • Tip: Write 2-3 sentences per scene for best results
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/70">
                                    Target Scenes: {sceneCount}
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
                                    <span>2 scenes</span>
                                    <span>8 scenes</span>
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
                                        Parsing Story...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5 mr-2" />
                                        Parse into Scenes
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Scene Editor */}
                    {step === "scenes" && (
                        <motion.div
                            key="scenes"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-violet-400" />
                                        Edit Your Scenes
                                    </h4>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        Drag to reorder, click to edit. {scenes.length} scenes total.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleParseScenes}
                                        className="h-8 text-xs border-white/20 text-white/70 hover:bg-white/10"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Re-parse
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={addNewScene}
                                        className="h-8 text-xs bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Scene
                                    </Button>
                                </div>
                            </div>

                            {/* Reorderable Scene List */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                <Reorder.Group
                                    axis="y"
                                    values={scenes}
                                    onReorder={reorderScenes}
                                    className="space-y-3"
                                >
                                    {scenes.map((scene) => (
                                        <DraggableSceneItem
                                            key={scene.id}
                                            scene={scene}
                                            scenes={scenes}
                                            updateScene={updateScene}
                                            deleteScene={deleteScene}
                                            duplicateScene={duplicateScene}
                                        />
                                    ))}
                                </Reorder.Group>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("story")}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep("settings")}
                                    disabled={scenes.length === 0 || scenes.some(s => !s.description.trim())}
                                    className="flex-[2] h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                >
                                    Continue to Settings
                                    <ChevronRight className="w-5 h-5 ml-2" />
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
                                    Video Model
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
                                                    <span>{model.name}</span>
                                                    <span className="text-xs text-white/40 ml-4">
                                                        {model.costPer5s}K/5s
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
                                    Duration per Scene: {duration}s
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
                                        <p className="text-sm font-medium text-white">Add Background Music</p>
                                        <p className="text-xs text-white/50">AI-generated soundtrack (+30K Phở)</p>
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
                                        Music Style (optional)
                                    </label>
                                    <Textarea
                                        value={musicPrompt}
                                        onChange={(e) => setMusicPrompt(e.target.value)}
                                        placeholder="Epic orchestral, emotional piano, upbeat electronic..."
                                        className="min-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                                    />
                                </motion.div>
                            )}

                            {/* Cost Summary */}
                            <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/30">
                                <h4 className="text-sm font-medium text-white mb-2">Cost Estimate</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between text-white/60">
                                        <span>Base cost</span>
                                        <span>500K</span>
                                    </div>
                                    <div className="flex justify-between text-white/60">
                                        <span>{scenes.length} scenes × {duration}s</span>
                                        <span>{(videoCost / 1000).toFixed(0)}K</span>
                                    </div>
                                    {addMusic && (
                                        <div className="flex justify-between text-white/60">
                                            <span>Background music</span>
                                            <span>30K</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/10">
                                        <span>Total</span>
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
                                    Back
                                </Button>
                                <Button
                                    onClick={handleGenerate}
                                    className="flex-[2] h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Storyboard
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
                                    Creating Your Storyboard
                                </h3>
                                <p className="text-sm text-white/50">
                                    Generating {scenes.length} scenes...
                                </p>
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
