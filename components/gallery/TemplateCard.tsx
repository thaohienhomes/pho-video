"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles, Star, Clock } from "lucide-react"

interface TemplateCardProps {
    id: string
    title: string
    description?: string
    thumbnailUrl: string
    badge?: "NEW" | "HOT" | "PRO" | string
    usageCount?: number
    estimatedTime?: string
    onUse?: () => void
    onClick?: () => void
    className?: string
}

/**
 * TemplateCard - Template/preset card for workflow templates
 * 
 * Specs from component-specs.md:
 * - Width: 200px
 * - Height: auto
 * - Border Radius: 12px
 * - Image Height: 120px
 * - Padding: 12px
 * - Badge: position absolute top-right
 * - Use Button: height 32px, width 100%
 */
export function TemplateCard({
    id,
    title,
    description,
    thumbnailUrl,
    badge,
    usageCount = 0,
    estimatedTime,
    onUse,
    onClick,
    className
}: TemplateCardProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const badgeColors: Record<string, string> = {
        NEW: "bg-emerald-500 text-white",
        HOT: "bg-primary text-white",
        PRO: "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "group relative w-[200px] cursor-pointer",
                "rounded-[12px] overflow-hidden",
                "bg-[var(--pho-glass-light)]",
                "border border-[var(--pho-border-default)]",
                "hover:border-[var(--pho-border-strong)]",
                "transition-all duration-[var(--pho-duration-normal)]",
                className
            )}
        >
            {/* Thumbnail - 120px height */}
            <div className="relative h-[120px] overflow-hidden">
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Badge */}
                {badge && (
                    <div
                        className={cn(
                            "absolute top-2 right-2 px-2 py-0.5",
                            "rounded text-[10px] font-bold uppercase",
                            badgeColors[badge] || "bg-white/20 text-white"
                        )}
                    >
                        {badge}
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content - 12px padding */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <h4 className="text-sm font-medium text-[var(--pho-text-primary)] line-clamp-1">
                    {title}
                </h4>

                {/* Description */}
                {description && (
                    <p className="text-[11px] text-[var(--pho-text-muted)] line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 text-[10px] text-[var(--pho-text-muted)]">
                    {usageCount > 0 && (
                        <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {formatNumber(usageCount)} uses
                        </span>
                    )}
                    {estimatedTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimatedTime}
                        </span>
                    )}
                </div>

                {/* Use Button - 32px height, 100% width */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.stopPropagation()
                        onUse?.()
                    }}
                    className={cn(
                        "w-full h-8 rounded-lg",
                        "bg-primary text-white text-xs font-medium",
                        "flex items-center justify-center gap-1.5",
                        "hover:bg-[#E53A15]",
                        "transition-colors"
                    )}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Use Template
                </motion.button>
            </div>
        </motion.div>
    )
}
