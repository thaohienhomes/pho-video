"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
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
    labelKey: string
    icon: LucideIcon
    descKey: string
    /** Active text/icon color */
    color: string
    /** Gradient for active state background */
    gradient: string
    /** Glow color for active state */
    glowColor: string
}

export const CREATION_MODES: ModeConfig[] = [
    {
        id: "video",
        labelKey: "video",
        icon: Film,
        descKey: "video_desc",
        color: "text-primary",
        gradient: "from-primary/20 to-orange-500/10",
        glowColor: "rgba(240, 66, 28, 0.4)",
    },
    {
        id: "image",
        labelKey: "image",
        icon: ImageIcon,
        descKey: "image_desc",
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/10",
        glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
        id: "audio",
        labelKey: "audio",
        icon: Music,
        descKey: "audio_desc",
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/10",
        glowColor: "rgba(168, 85, 247, 0.4)",
    },
    {
        id: "lipsync",
        labelKey: "lipsync",
        icon: Mic,
        descKey: "lipsync_desc",
        color: "text-pink-400",
        gradient: "from-pink-500/20 to-rose-500/10",
        glowColor: "rgba(236, 72, 153, 0.4)",
    },
    {
        id: "upscale",
        labelKey: "upscale",
        icon: Maximize2,
        descKey: "upscale_desc",
        color: "text-amber-400",
        gradient: "from-amber-500/20 to-yellow-500/10",
        glowColor: "rgba(245, 158, 11, 0.4)",
    },
    {
        id: "story",
        labelKey: "story",
        icon: BookOpen,
        descKey: "story_desc",
        color: "text-violet-400",
        gradient: "from-violet-500/20 to-purple-500/10",
        glowColor: "rgba(139, 92, 246, 0.4)",
    },
    {
        id: "magic",
        labelKey: "magic",
        icon: Sparkles,
        descKey: "magic_desc",
        color: "text-emerald-400",
        gradient: "from-emerald-500/20 to-teal-500/10",
        glowColor: "rgba(52, 211, 153, 0.4)",
    },
    {
        id: "tryon",
        labelKey: "tryon",
        icon: Shirt,
        descKey: "tryon_desc",
        color: "text-rose-400",
        gradient: "from-rose-500/20 to-pink-500/10",
        glowColor: "rgba(251, 113, 133, 0.4)",
    },
]

interface ModeSelectorProps {
    selectedMode: CreationMode
    onModeChange: (mode: CreationMode) => void
    className?: string
    compact?: boolean
}

/**
 * ModeSelector - Pixel Perfect Implementation
 * 
 * Specs from component-specs.md:
 * - Grid: 2 columns x 4 rows (for sidebar) or horizontal scroll
 * - Gap: 8px
 * - Button Size: 72px x 72px (grid) or flexible (horizontal)
 * - Border Radius: 12px
 * - Active: background rgba(240, 66, 28, 0.20), border rgba(240, 66, 28, 0.60)
 * - Icon: 24px
 * - Label: 12px, font-weight: 500
 */
export function ModeSelector({
    selectedMode,
    onModeChange,
    className,
    compact = false
}: ModeSelectorProps) {
    const t = useTranslations("studio.modes")

    return (
        <div className={cn(
            // Pixel-perfect: horizontal scroll with proper spacing
            "flex gap-2 p-2",
            "bg-[var(--pho-glass-light)] rounded-[var(--pho-radius-xl)]",
            "border border-[var(--pho-border-default)]",
            "backdrop-blur-[var(--pho-blur-lg)]",
            "overflow-x-auto scrollbar-hide",
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
                            // Base styles - pixel perfect dimensions
                            "relative flex flex-col items-center justify-center",
                            "min-w-[64px] py-2.5 px-3",
                            "rounded-[var(--pho-radius-lg)]",
                            "cursor-pointer",
                            "transition-all duration-[var(--pho-duration-normal)]",
                            // Active state
                            isActive
                                ? `bg-gradient-to-b ${mode.gradient} border border-[var(--pho-border-active)]`
                                : "bg-transparent border border-transparent hover:bg-[var(--pho-glass-light)]"
                        )}
                        style={{
                            boxShadow: isActive ? `0 0 20px ${mode.glowColor}` : 'none'
                        }}
                    >
                        {/* Active indicator overlay */}
                        {isActive && (
                            <motion.div
                                layoutId="activeModeIndicator"
                                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-[var(--pho-radius-lg)]"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}

                        {/* Icon - 20px for compact, 24px for full */}
                        <Icon className={cn(
                            "transition-colors relative z-10",
                            compact ? "w-5 h-5" : "w-5 h-5",
                            isActive ? mode.color : "text-[var(--pho-text-muted)]"
                        )} />

                        {/* Label - 12px font */}
                        {!compact && (
                            <span className={cn(
                                "text-[12px] font-medium mt-1.5 relative z-10",
                                "transition-colors truncate w-full text-center",
                                isActive ? "text-[var(--pho-text-primary)]" : "text-[var(--pho-text-muted)]"
                            )}>
                                {t(mode.labelKey)}
                            </span>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * ModeSelectorGrid - 2-column grid for sidebar
 * 
 * Pixel-perfect specs:
 * - Grid: 2 columns
 * - Gap: 8px
 * - Button: 72px height
 * - Border Radius: 12px
 */
export function ModeSelectorGrid({
    selectedMode,
    onModeChange
}: Pick<ModeSelectorProps, 'selectedMode' | 'onModeChange'>) {
    const t = useTranslations("studio.modes")

    return (
        <div className={cn(
            "grid grid-cols-2 gap-2 p-3",
            "bg-[var(--pho-glass-light)] rounded-[var(--pho-radius-xl)]",
            "border border-[var(--pho-border-default)]",
            "backdrop-blur-[var(--pho-blur-lg)]"
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
                            // Pixel-perfect: 72px height
                            "relative flex flex-col items-center justify-center",
                            "h-[72px] rounded-[var(--pho-radius-lg)]",
                            "cursor-pointer",
                            "transition-all duration-[var(--pho-duration-normal)]",
                            isActive
                                ? `bg-gradient-to-b ${mode.gradient} border border-[var(--pho-border-active)]`
                                : "bg-transparent border border-transparent hover:bg-[var(--pho-glass-light)]"
                        )}
                        style={{
                            boxShadow: isActive ? `0 0 20px ${mode.glowColor}` : 'none'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeModeGridIndicator"
                                className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-[var(--pho-radius-lg)]"
                                transition={{ type: "spring", duration: 0.4 }}
                            />
                        )}

                        {/* Icon - 24px as per spec */}
                        <Icon className={cn(
                            "w-6 h-6 transition-colors relative z-10",
                            isActive ? mode.color : "text-[var(--pho-text-muted)]"
                        )} />

                        {/* Label - 12px, font-weight 500 */}
                        <span className={cn(
                            "text-[12px] font-medium mt-1.5 relative z-10 transition-colors",
                            isActive ? "text-[var(--pho-text-primary)]" : "text-[var(--pho-text-muted)]"
                        )}>
                            {t(mode.labelKey)}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * ModeSelectorCompact - Horizontal scroll version for mobile
 */
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
