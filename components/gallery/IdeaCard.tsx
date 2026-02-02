"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Play, Heart, Repeat, Eye, User } from "lucide-react"

interface IdeaCardProps {
    id: string
    title: string
    prompt: string
    thumbnailUrl: string
    videoUrl?: string
    authorName?: string
    authorAvatar?: string
    views?: number
    likes?: number
    remixes?: number
    isLiked?: boolean
    onRemix?: () => void
    onLike?: () => void
    onClick?: () => void
    className?: string
}

/**
 * IdeaCard - Gallery card for Ideas/Showcase grid
 * 
 * Specs from component-specs.md:
 * - Min Width: 280px
 * - Border Radius: 16px
 * - Background: #121212
 * - Border: 1px solid rgba(255, 255, 255, 0.05)
 * - Hover: transform translateY(-4px), shadow --pho-shadow-card-hover
 * - Image: border-radius 12px 12px 0 0
 * - Padding: 16px
 * - Title: 16px, font-weight: 600
 * - Avatar: 32px circle
 * - Remix Button: height 32px, border-radius 16px
 */
export function IdeaCard({
    id,
    title,
    prompt,
    thumbnailUrl,
    videoUrl,
    authorName = "Anonymous",
    authorAvatar,
    views = 0,
    likes = 0,
    remixes = 0,
    isLiked = false,
    onRemix,
    onLike,
    onClick,
    className
}: IdeaCardProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden cursor-pointer",
                "min-w-[280px] rounded-[var(--pho-radius-xl)]",
                "bg-[#121212] border border-[rgba(255,255,255,0.05)]",
                "hover:shadow-[var(--pho-shadow-card-hover)]",
                "transition-shadow duration-[var(--pho-duration-normal)]",
                className
            )}
        >
            {/* Thumbnail with play overlay */}
            <div className="relative aspect-video overflow-hidden rounded-t-[12px]">
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Video indicator */}
                {videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                    </div>
                )}

                {/* Stats overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(views)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {formatNumber(likes)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-base font-semibold text-[var(--pho-text-primary)] line-clamp-2">
                    {title}
                </h3>

                {/* Prompt preview */}
                <p className="text-xs text-[var(--pho-text-muted)] line-clamp-2">
                    {prompt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--pho-glass-medium)] overflow-hidden flex items-center justify-center">
                            {authorAvatar ? (
                                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-[var(--pho-text-muted)]" />
                            )}
                        </div>
                        <span className="text-xs text-[var(--pho-text-secondary)]">{authorName}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Like button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onLike?.()
                            }}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                isLiked
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-[var(--pho-glass-light)] text-[var(--pho-text-muted)] hover:text-red-400"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                        </motion.button>

                        {/* Remix button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemix?.()
                            }}
                            className={cn(
                                "h-8 px-3 rounded-full flex items-center gap-1.5",
                                "bg-primary/10 text-primary text-xs font-medium",
                                "border border-primary/30 hover:bg-primary/20 hover:border-primary/50",
                                "transition-colors"
                            )}
                        >
                            <Repeat className="w-3.5 h-3.5" />
                            Remix
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.article>
    )
}
