"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
    Wand2,
    Copy,
    RefreshCw,
    Sparkles,
    ChevronDown,
    User,
    Camera,
    Palette,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromptBuilderProps {
    onPromptGenerated?: (prompt: string) => void
    className?: string
}

// Prompt building blocks
const SUBJECTS = [
    { value: "woman", label: "Woman", icon: "👱‍♀️" },
    { value: "man", label: "Man", icon: "👨" },
    { value: "dragon", label: "Dragon", icon: "🐉" },
    { value: "robot", label: "Robot", icon: "🤖" },
    { value: "city", label: "City", icon: "🏙️" },
    { value: "forest", label: "Forest", icon: "🌲" },
    { value: "ocean", label: "Ocean", icon: "🌊" },
    { value: "space", label: "Space", icon: "🚀" },
    { value: "car", label: "Car", icon: "🚗" },
    { value: "animal", label: "Animal", icon: "🦁" },
]

const ACTIONS = [
    { value: "walking slowly", label: "Walking" },
    { value: "running fast", label: "Running" },
    { value: "dancing gracefully", label: "Dancing" },
    { value: "flying through the air", label: "Flying" },
    { value: "standing still", label: "Standing" },
    { value: "turning around", label: "Turning" },
    { value: "transforming", label: "Transforming" },
    { value: "exploding with energy", label: "Exploding" },
]

const STYLES = [
    { value: "cinematic, movie quality, 8K", label: "Cinematic" },
    { value: "anime style, cel shaded", label: "Anime" },
    { value: "photorealistic, hyper detailed", label: "Photorealistic" },
    { value: "fantasy art, magical", label: "Fantasy" },
    { value: "cyberpunk, neon lights", label: "Cyberpunk" },
    { value: "watercolor painting", label: "Watercolor" },
    { value: "3D render, Pixar style", label: "3D Animated" },
    { value: "noir, black and white", label: "Film Noir" },
]

const CAMERAS = [
    { value: "slow zoom in", label: "Zoom In" },
    { value: "slow zoom out", label: "Zoom Out" },
    { value: "pan left to right", label: "Pan Left" },
    { value: "pan right to left", label: "Pan Right" },
    { value: "tracking shot", label: "Tracking" },
    { value: "static shot", label: "Static" },
    { value: "drone aerial view", label: "Aerial" },
    { value: "close-up shot", label: "Close-up" },
]

const MOODS = [
    { value: "dramatic lighting, moody", label: "Dramatic" },
    { value: "bright and cheerful", label: "Cheerful" },
    { value: "mysterious, foggy", label: "Mysterious" },
    { value: "peaceful, serene", label: "Peaceful" },
    { value: "intense, action-packed", label: "Intense" },
    { value: "dreamy, ethereal", label: "Dreamy" },
]

export function PromptBuilder({
    onPromptGenerated,
    className,
}: PromptBuilderProps) {
    const [subject, setSubject] = useState("")
    const [action, setAction] = useState("")
    const [style, setStyle] = useState("")
    const [camera, setCamera] = useState("")
    const [mood, setMood] = useState("")
    const [copied, setCopied] = useState(false)

    // Generate prompt
    const generatedPrompt = useMemo(() => {
        const parts = []

        if (subject) {
            parts.push(`A ${subject}`)
        }
        if (action) {
            parts.push(action)
        }
        if (mood) {
            parts.push(mood)
        }
        if (style) {
            parts.push(style)
        }
        if (camera) {
            parts.push(camera)
        }

        return parts.join(", ")
    }, [subject, action, style, camera, mood])

    const handleRandomize = () => {
        setSubject(SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)].value)
        setAction(ACTIONS[Math.floor(Math.random() * ACTIONS.length)].value)
        setStyle(STYLES[Math.floor(Math.random() * STYLES.length)].value)
        setCamera(CAMERAS[Math.floor(Math.random() * CAMERAS.length)].value)
        setMood(MOODS[Math.floor(Math.random() * MOODS.length)].value)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleUse = () => {
        onPromptGenerated?.(generatedPrompt)
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">Prompt Builder</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRandomize}
                    className="text-white/60 hover:text-white"
                >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Randomize
                </Button>
            </div>

            {/* Builder Sections */}
            <div className="space-y-4">
                {/* Subject */}
                <BuilderSection
                    icon={<User className="w-4 h-4" />}
                    label="Subject"
                    options={SUBJECTS}
                    value={subject}
                    onChange={setSubject}
                    showIcons
                />

                {/* Action */}
                <BuilderSection
                    icon={<Zap className="w-4 h-4" />}
                    label="Action"
                    options={ACTIONS}
                    value={action}
                    onChange={setAction}
                />

                {/* Style */}
                <BuilderSection
                    icon={<Palette className="w-4 h-4" />}
                    label="Style"
                    options={STYLES}
                    value={style}
                    onChange={setStyle}
                />

                {/* Camera */}
                <BuilderSection
                    icon={<Camera className="w-4 h-4" />}
                    label="Camera"
                    options={CAMERAS}
                    value={camera}
                    onChange={setCamera}
                />

                {/* Mood */}
                <BuilderSection
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Mood"
                    options={MOODS}
                    value={mood}
                    onChange={setMood}
                />
            </div>

            {/* Generated Prompt Preview */}
            {generatedPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-white/50">Generated Prompt</span>
                        <button
                            onClick={handleCopy}
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                            <Copy className="w-3 h-3" />
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                        {generatedPrompt}
                    </p>

                    <Button
                        onClick={handleUse}
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Use This Prompt
                    </Button>
                </motion.div>
            )}
        </div>
    )
}

// Builder Section Component
function BuilderSection({
    icon,
    label,
    options,
    value,
    onChange,
    showIcons,
}: {
    icon: React.ReactNode
    label: string
    options: { value: string; label: string; icon?: string }[]
    value: string
    onChange: (value: string) => void
    showIcons?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false)

    const selectedOption = options.find(o => o.value === value)

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/60">
                {icon}
                <span>{label}</span>
            </div>

            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                    "bg-white/5 border border-white/10 hover:border-white/20",
                    value && "border-primary/50"
                )}
            >
                <span className={cn("text-sm", value ? "text-white" : "text-white/40")}>
                    {selectedOption ? (
                        <span className="flex items-center gap-2">
                            {showIcons && selectedOption.icon && (
                                <span>{selectedOption.icon}</span>
                            )}
                            {selectedOption.label}
                        </span>
                    ) : (
                        `Select ${label}...`
                    )}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Options Grid */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-4 gap-2 p-2 rounded-xl bg-white/5 border border-white/10"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm transition-all",
                                value === option.value
                                    ? "bg-primary text-white"
                                    : "bg-white/5 text-white/70 hover:bg-white/10"
                            )}
                        >
                            {showIcons && option.icon && (
                                <span className="block text-lg mb-0.5">{option.icon}</span>
                            )}
                            {option.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
