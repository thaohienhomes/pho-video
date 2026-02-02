"use client"

import { motion } from "framer-motion"
import { Play, Grid, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThumbnailItem {
    id: string
    videoUrl?: string
    status?: "generating" | "complete" | "failed"
    color?: string // For progress bar
}

interface ColorfulThumbnailDockProps {
    items: ThumbnailItem[]
    activeId?: string
    onSelect: (id: string) => void
    onViewAll?: () => void
    className?: string
}

// Color palette for progress bars - matching mockup
const PROGRESS_COLORS = [
    "bg-primary",      // Orange
    "bg-blue-500",     // Blue
    "bg-emerald-500",  // Green
    "bg-cyan-400",     // Cyan
    "bg-purple-500",   // Purple
    "bg-pink-500",     // Pink
    "bg-amber-500",    // Amber
    "bg-rose-500",     // Rose
]

/**
 * ColorfulThumbnailDock - Exact mockup match with colorful progress bars
 * 
 * Mockup specs:
 * - Height: 100px
 * - Glassmorphism bg
 * - Thumbnails: 72x50px with rounded corners
 * - Each thumbnail has DIFFERENT COLOR progress bar at bottom
 * - Active: primary border + glow
 * - Grid icon button on right
 * - Rounded top corners: 20px
 */
export function ColorfulThumbnailDock({
    items,
    activeId,
    onSelect,
    onViewAll,
    className
}: ColorfulThumbnailDockProps) {
    // If empty, show a ghost card placeholder
    if (items.length === 0) {
        return (
            <div className={cn(
                "h-[100px] flex-shrink-0",
                "bg-gradient-to-b from-white/5 to-white/[0.02]",
                "backdrop-blur-xl",
                "border-t border-white/10",
                "rounded-t-[20px]",
                "px-4 py-3",
                className
            )}>
                <div className="flex items-center h-full gap-2 text-xs text-white/40">
                    <div className="w-[72px] h-[50px] rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                        <Grid className="w-4 h-4 opacity-50" />
                    </div>
                    <span>Your creations will appear here...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "h-[100px] flex-shrink-0",
            "bg-gradient-to-b from-white/5 to-white/[0.02]",
            "backdrop-blur-xl",
            "border-t border-white/10",
            "rounded-t-[20px]",
            "px-4 py-3",
            className
        )}>
            <div className="flex items-center h-full gap-2">
                {/* Thumbnails - Horizontal scroll */}
                <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {items.map((item, index) => {
                        const isActive = activeId === item.id
                        const progressColor = item.color || PROGRESS_COLORS[index % PROGRESS_COLORS.length]

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={cn(
                                    "relative w-[72px] h-[50px] rounded-lg overflow-hidden flex-shrink-0",
                                    "border-2 transition-all duration-150",
                                    isActive
                                        ? "border-primary shadow-[0_0_16px_rgba(240,66,28,0.35)]"
                                        : "border-transparent hover:border-white/20"
                                )}
                            >
                                {item.videoUrl ? (
                                    <>
                                        <video
                                            src={item.videoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        {/* Play overlay on hover */}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Play className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </div>
                                )}

                                {/* Colorful progress bar at bottom */}
                                {item.status === "generating" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                                        <motion.div
                                            className={cn("h-full", progressColor)}
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 30, ease: "linear" }}
                                        />
                                    </div>
                                )}

                                {/* Static colorful bar for complete items */}
                                {item.status === "complete" && (
                                    <div className={cn(
                                        "absolute bottom-0 left-0 right-0 h-[3px]",
                                        progressColor
                                    )} />
                                )}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Grid button */}
                {onViewAll && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onViewAll}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                        <Grid className="w-4 h-4 text-white/50" />
                    </motion.button>
                )}
            </div>
        </div>
    )
}
