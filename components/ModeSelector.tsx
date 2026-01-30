"use client"

import { motion } from "framer-motion"
import {
    Film,
    ImageIcon,
    Music,
    Maximize2,
    BookOpen,
    Sparkles,
    Mic,
    Shirt,
    LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export type CreationMode = "video" | "image" | "audio" | "upscale" | "story" | "magic" | "lipsync" | "tryon"

interface ModeConfig {
    id: CreationMode
    label: string
    icon: LucideIcon
    description: string
    color: string
    gradient: string
}

export const CREATION_MODES: ModeConfig[] = [
    {
        id: "video",
        label: "Video",
        icon: Film,
        description: "Text-to-Video, Image-to-Video",
        color: "text-primary",
        gradient: "from-primary/20 to-orange-500/10",
    },
    {
        id: "image",
        label: "Image",
        icon: ImageIcon,
        description: "AI Image Generation",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
        id: "audio",
        label: "Audio",
        icon: Music,
        description: "Music & TTS",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
        id: "lipsync",
        label: "Lip Sync",
        icon: Mic,
        description: "Talking Head Videos",
        color: "text-pink-400",
        gradient: "from-pink-500/20 to-rose-500/10",
    },
    {
        id: "upscale",
        label: "Upscale",
        icon: Maximize2,
        description: "Enhance Video Quality",
        color: "text-amber-400",
        gradient: "from-amber-500/20 to-yellow-500/10",
    },
    {
        id: "story",
        label: "Story",
        icon: BookOpen,
        description: "Multi-scene Storyboard",
        color: "text-violet-400",
        gradient: "from-violet-500/20 to-purple-500/10",
    },
    {
        id: "magic",
        label: "Magic",
        icon: Sparkles,
        description: "One-click Presets",
        color: "text-emerald-400",
        gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
        id: "tryon",
        label: "Try-on",
        icon: Shirt,
        description: "Virtual Clothing Try-on",
        color: "text-rose-400",
        gradient: "from-rose-500/20 to-pink-500/10",
    },
]

interface ModeSelectorProps {
    selectedMode: CreationMode
    onModeChange: (mode: CreationMode) => void
    className?: string
    compact?: boolean
}

export function ModeSelector({
    selectedMode,
    onModeChange,
    className,
    compact = false
}: ModeSelectorProps) {
    return (
        <div className={cn(
            "grid grid-cols-6 gap-1 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md",
            className
        )}>
            {CREATION_MODES.map((mode) => {
                const Icon = mode.icon
                const isActive = selectedMode === mode.id

                return (
                    <motion.button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200",
                            compact ? "py-2" : "py-2.5",
                            isActive
                                ? `bg-gradient-to-b ${mode.gradient} border border-white/20 shadow-lg`
                                : "bg-transparent border border-transparent hover:bg-white/5"
                        )}
                    >
                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeModeIndicator"
                                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}

                        <Icon className={cn(
                            "w-4 h-4 transition-colors relative z-10",
                            isActive ? mode.color : "text-white/50"
                        )} />

                        {!compact && (
                            <span className={cn(
                                "text-[10px] font-medium mt-1 relative z-10 transition-colors truncate w-full text-center",
                                isActive ? "text-white" : "text-white/50"
                            )}>
                                {mode.label}
                            </span>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

// Two-row layout for very narrow panels
export function ModeSelectorGrid({
    selectedMode,
    onModeChange
}: Pick<ModeSelectorProps, 'selectedMode' | 'onModeChange'>) {
    return (
        <div className="grid grid-cols-3 gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            {CREATION_MODES.map((mode) => {
                const Icon = mode.icon
                const isActive = selectedMode === mode.id

                return (
                    <motion.button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 py-3",
                            isActive
                                ? `bg-gradient-to-b ${mode.gradient} border border-white/20 shadow-lg`
                                : "bg-transparent border border-transparent hover:bg-white/5"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeModeGridIndicator"
                                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}

                        <Icon className={cn(
                            "w-5 h-5 transition-colors relative z-10",
                            isActive ? mode.color : "text-white/50"
                        )} />

                        <span className={cn(
                            "text-xs font-medium mt-1 relative z-10 transition-colors",
                            isActive ? "text-white" : "text-white/50"
                        )}>
                            {mode.label}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}

// Compact horizontal version for mobile
export function ModeSelectorCompact({
    selectedMode,
    onModeChange
}: Pick<ModeSelectorProps, 'selectedMode' | 'onModeChange'>) {
    return (
        <ModeSelector
            selectedMode={selectedMode}
            onModeChange={onModeChange}
            compact={true}
            className="overflow-x-auto scrollbar-hide"
        />
    )
}
