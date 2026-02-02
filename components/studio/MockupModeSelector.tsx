"use client"

import { motion } from "framer-motion"
import {
    Film,
    ImageIcon,
    Music,
    Mic,
    Maximize2,
    BookOpen,
    LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export type StudioMode = "video" | "image" | "audio" | "lipsync" | "upscale" | "story"

interface ModeConfig {
    id: StudioMode
    icon: LucideIcon
}

/**
 * PixelPerfectModeSelector - Exact mockup match
 * 
 * Mockup specs:
 * - Grid: 3 columns x 2 rows
 * - Size: ~40x40 per button (small)
 * - Icons ONLY - no text labels
 * - Active: primary border + fill
 * - Rounded corners: 8px
 * - Gap: 4px
 */
const MODES: ModeConfig[] = [
    { id: "video", icon: Film },
    { id: "image", icon: ImageIcon },
    { id: "audio", icon: Music },
    { id: "lipsync", icon: Mic },
    { id: "upscale", icon: Maximize2 },
    { id: "story", icon: BookOpen },
]

interface PixelPerfectModeSelectorProps {
    selectedMode: string
    onModeChange: (mode: StudioMode) => void
    className?: string
}

export function PixelPerfectModeSelector({
    selectedMode,
    onModeChange,
    className
}: PixelPerfectModeSelectorProps) {
    return (
        <div className={cn(
            "grid grid-cols-3 gap-1",
            className
        )}>
            {MODES.map((mode) => {
                const Icon = mode.icon
                const isActive = selectedMode === mode.id

                return (
                    <motion.button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "flex items-center justify-center",
                            "w-10 h-10 rounded-lg",
                            "transition-all duration-150",
                            isActive
                                ? "bg-primary/30 border border-primary text-primary"
                                : "bg-white/5 border border-transparent text-white/40 hover:text-white/70 hover:bg-white/10"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                    </motion.button>
                )
            })}
        </div>
    )
}
