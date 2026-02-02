"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Plus, Play, Pause, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

interface StoryboardItem {
    id: string
    thumbnailUrl?: string
    title?: string
    duration?: number
    status?: "pending" | "generating" | "complete" | "error"
    progress?: number
}

interface StoryboardDockProps {
    items: StoryboardItem[]
    activeIndex?: number
    onItemSelect?: (index: number) => void
    onItemDelete?: (id: string) => void
    onAddItem?: () => void
    isPlaying?: boolean
    onPlayToggle?: () => void
    className?: string
}

/**
 * StoryboardDock - Pixel Perfect Implementation
 * 
 * Specs from component-specs.md:
 * - Dock Height: 100px
 * - Background: rgba(255, 255, 255, 0.05)
 * - Backdrop Filter: blur(24px)
 * - Border Top: 1px solid rgba(255, 255, 255, 0.10)
 * - Border Radius: 16px 16px 0 0
 * - Padding: 16px 24px
 * - Thumbnail Width: 80px
 * - Thumbnail Height: 60px
 * - Selected: border #F0421C, shadow 0 0 20px rgba(240, 66, 28, 0.4)
 * - Progress Bar: 3px height, #F0421C background
 */
export function StoryboardDock({
    items,
    activeIndex = 0,
    onItemSelect,
    onItemDelete,
    onAddItem,
    isPlaying = false,
    onPlayToggle,
    className
}: StoryboardDockProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className={cn(
            // Pixel-perfect dimensions
            "relative flex items-center gap-4",
            "h-[100px] px-6",
            // Glassmorphism
            "bg-[var(--pho-glass-light)]",
            "backdrop-blur-[var(--pho-blur-lg)]",
            "border-t border-[var(--pho-border-default)]",
            "rounded-t-[var(--pho-radius-xl)]",
            className
        )}>
            {/* Play/Pause Button */}
            <motion.button
                onClick={onPlayToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "flex-shrink-0",
                    "w-10 h-10 flex items-center justify-center",
                    "rounded-full",
                    "bg-primary text-white",
                    "shadow-[var(--pho-glow-primary)]"
                )}
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4" />
                ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                )}
            </motion.button>

            {/* Scroll Left Button */}
            <AnimatePresence>
                {canScrollLeft && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => scroll('left')}
                        className="absolute left-16 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--pho-bg-elevated)] border border-[var(--pho-border-default)]"
                    >
                        <ChevronLeft className="w-4 h-4 text-[var(--pho-text-secondary)]" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Thumbnails Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide"
            >
                {items.map((item, index) => {
                    const isActive = index === activeIndex

                    return (
                        <motion.div
                            key={item.id}
                            layoutId={`thumb-${item.id}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onItemSelect?.(index)}
                            className={cn(
                                // Pixel-perfect thumbnail dimensions
                                "relative flex-shrink-0 cursor-pointer",
                                "w-[80px] h-[60px]",
                                "rounded-[var(--pho-radius-md)]",
                                "overflow-hidden",
                                "transition-all duration-[var(--pho-duration-normal)]",
                                // Border styles
                                isActive
                                    ? "border-2 border-primary"
                                    : "border border-[var(--pho-border-default)]"
                            )}
                            style={{
                                boxShadow: isActive ? 'var(--pho-glow-primary)' : 'none'
                            }}
                        >
                            {/* Thumbnail Image or Placeholder */}
                            {item.thumbnailUrl ? (
                                <img
                                    src={item.thumbnailUrl}
                                    alt={item.title || `Scene ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--pho-bg-elevated)] to-[var(--pho-bg-surface)] flex items-center justify-center">
                                    <span className="text-[10px] text-[var(--pho-text-muted)]">
                                        {index + 1}
                                    </span>
                                </div>
                            )}

                            {/* Progress Bar (for generating status) */}
                            {item.status === "generating" && item.progress !== undefined && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--pho-bg-surface)]">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            )}

                            {/* Status indicator */}
                            {item.status === "complete" && (
                                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-white/30" />
                            )}

                            {/* Delete button on hover */}
                            {onItemDelete && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onItemDelete(item.id)
                                    }}
                                    className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/80"
                                >
                                    <Trash2 className="w-3 h-3 text-white" />
                                </motion.button>
                            )}
                        </motion.div>
                    )
                })}

                {/* Add New Item Button */}
                {onAddItem && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddItem}
                        className={cn(
                            "flex-shrink-0",
                            "w-[80px] h-[60px]",
                            "flex items-center justify-center",
                            "rounded-[var(--pho-radius-md)]",
                            "border border-dashed border-[var(--pho-border-default)]",
                            "bg-[var(--pho-glass-light)]",
                            "hover:border-primary hover:bg-primary/5",
                            "transition-all duration-[var(--pho-duration-normal)]"
                        )}
                    >
                        <Plus className="w-5 h-5 text-[var(--pho-text-muted)]" />
                    </motion.button>
                )}
            </div>

            {/* Scroll Right Button */}
            <AnimatePresence>
                {canScrollRight && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => scroll('right')}
                        className="absolute right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--pho-bg-elevated)] border border-[var(--pho-border-default)]"
                    >
                        <ChevronRight className="w-4 h-4 text-[var(--pho-text-secondary)]" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
