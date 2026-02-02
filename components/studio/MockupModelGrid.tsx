"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelOption {
    id: string
    name: string
    cost: number
    badge?: string
    badgeType?: "fast" | "pro" | "new" | "smooth"
}

interface CompactModelGridProps {
    models: ModelOption[]
    selectedId: string
    onSelect: (id: string) => void
    className?: string
}

/**
 * CompactModelGrid - Exact mockup match for model cards
 * 
 * Mockup specs:
 * - 2x2 grid (for 4 models)
 * - Small cards: ~100x80px
 * - Icon + Name + Cost
 * - Badge at TOP RIGHT corner
 * - Badge colors: Fast=orange, Pro=blue, NEW=green, Smooth=cyan
 * - Active: primary border + subtle glow
 * - Gap: 8px
 */
export function CompactModelGrid({
    models,
    selectedId,
    onSelect,
    className
}: CompactModelGridProps) {
    const badgeStyles = {
        fast: "bg-primary text-white",
        pro: "bg-blue-500 text-white",
        new: "bg-emerald-500 text-white",
        smooth: "bg-cyan-400 text-black"
    }

    return (
        <div className={cn("grid grid-cols-2 gap-2", className)}>
            {models.map((model) => {
                const isActive = selectedId === model.id

                return (
                    <motion.button
                        key={model.id}
                        onClick={() => onSelect(model.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative flex flex-col items-start gap-1 p-2.5",
                            "rounded-xl transition-all duration-150",
                            isActive
                                ? "bg-primary/10 border border-primary shadow-[0_0_12px_rgba(240,66,28,0.15)]"
                                : "bg-white/5 border border-white/10 hover:border-white/20"
                        )}
                    >
                        {/* Badge - Top Right */}
                        {model.badge && model.badgeType && (
                            <span className={cn(
                                "absolute -top-1.5 -right-1.5",
                                "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                badgeStyles[model.badgeType]
                            )}>
                                {model.badge}
                            </span>
                        )}

                        {/* Icon */}
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            isActive ? "bg-primary/20" : "bg-white/10"
                        )}>
                            <Sparkles className={cn(
                                "w-3.5 h-3.5",
                                isActive ? "text-primary" : "text-white/50"
                            )} />
                        </div>

                        {/* Name */}
                        <span className={cn(
                            "text-xs font-medium",
                            isActive ? "text-white" : "text-white/70"
                        )}>
                            {model.name}
                        </span>

                        {/* Cost */}
                        <span className="text-[10px] text-white/30">
                            {model.cost}K
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}
