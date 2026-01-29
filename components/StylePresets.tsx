"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Sparkles, Palette, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { STYLE_PRESETS, StylePreset, applyStyleToPrompt } from "@/data/templates"

interface StylePresetsProps {
    currentPrompt?: string
    onApplyStyle?: (styledPrompt: string, style: StylePreset) => void
    selectedStyleId?: string
    className?: string
    variant?: "grid" | "list" | "compact"
}

export function StylePresets({
    currentPrompt = "",
    onApplyStyle,
    selectedStyleId,
    className,
    variant = "grid",
}: StylePresetsProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [previewStyle, setPreviewStyle] = useState<StylePreset | null>(null)

    const handleApply = (style: StylePreset) => {
        const styledPrompt = applyStyleToPrompt(currentPrompt, style)
        onApplyStyle?.(styledPrompt, style)
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">Style Presets</h3>
            </div>

            {/* Preview Banner */}
            {previewStyle && currentPrompt && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/30"
                >
                    <div className="flex items-start gap-2">
                        <Eye className="w-4 h-4 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-primary font-medium mb-1">
                                Preview with &quot;{previewStyle.name}&quot;
                            </p>
                            <p className="text-sm text-white/70 line-clamp-2">
                                {applyStyleToPrompt(currentPrompt, previewStyle)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Styles Grid/List */}
            <div className={cn(
                variant === "grid" && "grid grid-cols-2 md:grid-cols-4 gap-3",
                variant === "list" && "space-y-2",
                variant === "compact" && "flex flex-wrap gap-2"
            )}>
                {STYLE_PRESETS.map((style) => (
                    <StyleCard
                        key={style.id}
                        style={style}
                        isSelected={selectedStyleId === style.id}
                        isHovered={hoveredId === style.id}
                        variant={variant}
                        onHover={() => {
                            setHoveredId(style.id)
                            setPreviewStyle(style)
                        }}
                        onLeave={() => {
                            setHoveredId(null)
                            setPreviewStyle(null)
                        }}
                        onApply={() => handleApply(style)}
                    />
                ))}
            </div>
        </div>
    )
}

// Style Card Component
function StyleCard({
    style,
    isSelected,
    isHovered,
    variant,
    onHover,
    onLeave,
    onApply,
}: {
    style: StylePreset
    isSelected: boolean
    isHovered: boolean
    variant: "grid" | "list" | "compact"
    onHover: () => void
    onLeave: () => void
    onApply: () => void
}) {
    // Get gradient based on category
    const gradients = {
        cinematic: "from-amber-500/20 to-orange-600/20",
        artistic: "from-purple-500/20 to-pink-500/20",
        minimal: "from-gray-500/20 to-slate-500/20",
        vibrant: "from-cyan-500/20 to-blue-500/20",
    }

    if (variant === "compact") {
        return (
            <button
                onClick={onApply}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    isSelected
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                )}
            >
                {style.name}
                {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
            </button>
        )
    }

    if (variant === "list") {
        return (
            <div
                onClick={onApply}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    isSelected
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-white/5 border border-white/10 hover:border-primary/30"
                )}
            >
                <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    gradients[style.category]
                )}>
                    <Sparkles className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{style.name}</p>
                    <p className="text-xs text-white/50 truncate">{style.description}</p>
                </div>
                {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
        )
    }

    // Grid variant (default)
    return (
        <motion.div
            onClick={onApply}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative p-4 rounded-xl cursor-pointer transition-all overflow-hidden",
                isSelected
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-white/5 border border-white/10 hover:border-primary/50"
            )}
        >
            {/* Background Gradient */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50",
                gradients[style.category]
            )} />

            {/* Content */}
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{style.name}</span>
                    {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>
                <p className="text-xs text-white/50 line-clamp-2">
                    {style.description}
                </p>

                {/* Keywords Preview */}
                <div className="flex flex-wrap gap-1 mt-2">
                    {style.keywords.slice(0, 2).map((keyword, i) => (
                        <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
