"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Check, Sparkles, Zap, Star } from "lucide-react"

interface ModelCardProps {
    id: string
    name: string
    description?: string
    thumbnailUrl?: string
    isSelected?: boolean
    onClick?: () => void
    badge?: "NEW" | "PRO" | "FAST" | "BUDGET" | "RECOMMENDED"
    cost?: string
    className?: string
}

/**
 * ModelCard - Pixel Perfect Implementation
 * 
 * Specs from component-specs.md:
 * - Width: 140px
 * - Height: 100px
 * - Border Radius: 12px
 * - Background: rgba(255, 255, 255, 0.05)
 * - Border: 1px solid rgba(255, 255, 255, 0.10)
 * - Selected: border rgba(240, 66, 28, 0.60), shadow 0 0 20px rgba(240, 66, 28, 0.3)
 * - Thumbnail: 40px x 40px, border-radius 8px
 * - Title: 14px, font-weight: 600
 * - Subtitle: 12px, rgba(255, 255, 255, 0.50)
 * - Badge: padding 4px 8px, border-radius 4px, font-size 10px
 */
export function ModelCard({
    id,
    name,
    description,
    thumbnailUrl,
    isSelected = false,
    onClick,
    badge,
    cost,
    className
}: ModelCardProps) {
    const badgeConfig = {
        NEW: { bg: "bg-yellow-500", text: "text-black", icon: Star },
        PRO: { bg: "bg-purple-500", text: "text-white", icon: Sparkles },
        FAST: { bg: "bg-green-500", text: "text-white", icon: Zap },
        BUDGET: { bg: "bg-blue-500", text: "text-white", icon: null },
        RECOMMENDED: { bg: "bg-primary", text: "text-white", icon: Sparkles },
    }

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                // Pixel-perfect dimensions
                "relative flex flex-col items-start justify-between",
                "w-[140px] h-[100px] p-3",
                "rounded-[var(--pho-radius-lg)]",
                "cursor-pointer text-left",
                "transition-all duration-[var(--pho-duration-normal)]",
                // Background and border
                "bg-[var(--pho-glass-light)]",
                isSelected
                    ? "border-2 border-[var(--pho-border-active)]"
                    : "border border-[var(--pho-border-default)] hover:border-[var(--pho-border-strong)]",
                className
            )}
            style={{
                boxShadow: isSelected ? 'var(--pho-glow-primary)' : 'none'
            }}
        >
            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Badge */}
            {badge && (
                <div className={cn(
                    "absolute top-2 left-2",
                    "px-2 py-0.5 rounded-[var(--pho-radius-sm)]",
                    "text-[10px] font-semibold",
                    badgeConfig[badge].bg,
                    badgeConfig[badge].text
                )}>
                    {badge}
                </div>
            )}

            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-[var(--pho-radius-md)] overflow-hidden bg-[var(--pho-bg-elevated)] flex items-center justify-center">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt={name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <Sparkles className="w-5 h-5 text-[var(--pho-text-muted)]" />
                )}
            </div>

            {/* Model Info */}
            <div className="w-full">
                <h4 className={cn(
                    "text-[14px] font-semibold leading-tight truncate",
                    isSelected ? "text-[var(--pho-text-primary)]" : "text-[var(--pho-text-secondary)]"
                )}>
                    {name}
                </h4>
                {cost && (
                    <span className="text-[12px] text-[var(--pho-text-muted)]">
                        {cost}
                    </span>
                )}
            </div>
        </motion.button>
    )
}

/**
 * ModelCardGrid - Grid layout for model selection
 */
interface ModelCardGridProps {
    models: Array<{
        id: string
        name: string
        description?: string
        thumbnailUrl?: string
        badge?: ModelCardProps['badge']
        cost?: string
    }>
    selectedId?: string
    onSelect: (id: string) => void
    className?: string
}

export function ModelCardGrid({
    models,
    selectedId,
    onSelect,
    className
}: ModelCardGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-2 gap-2",
            className
        )}>
            {models.map((model) => (
                <ModelCard
                    key={model.id}
                    {...model}
                    isSelected={selectedId === model.id}
                    onClick={() => onSelect(model.id)}
                />
            ))}
        </div>
    )
}
