"use client"

import { motion } from "framer-motion"
import { Clock, Info, Copy, Check, Hash, Calendar, Sparkles } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Generation } from "@/stores/useStudioStore"
import { useState } from "react"

interface HistorySidebarProps {
    generations: Generation[]
    activeItem: Generation | null
    onSelect: (item: Generation) => void
    className?: string
}

function timeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
}

// Validate if URL is usable for Next.js Image component
function isValidImageUrl(url: string | null | undefined): url is string {
    if (!url) return false
    // Must be absolute URL (http/https) or start with /
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

export function HistorySidebar({
    generations,
    activeItem,
    onSelect,
    className
}: HistorySidebarProps) {
    const [copiedSeed, setCopiedSeed] = useState(false)

    // Filter mainly for image/video types if needed, or show all
    // User context implies Image Studio, but usage might be mixed.
    // Let's show all but highlight structure.

    const handleCopySeed = (seed: number) => {
        navigator.clipboard.writeText(seed.toString())
        setCopiedSeed(true)
        setTimeout(() => setCopiedSeed(false), 2000)
    }

    return (
        <aside className={cn(
            "w-[280px] bg-[#0A0A0A] border-l border-white/10 flex flex-col h-full",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    History
                </h3>
                <span className="text-xs text-white/40">{generations.length} items</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-3 space-y-3">
                {generations.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <Sparkles className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">No generations yet</p>
                    </div>
                ) : (
                    generations.map((gen) => (
                        <motion.div
                            key={gen.id}
                            onClick={() => onSelect(gen)}
                            layoutId={`history-${gen.id}`}
                            className={cn(
                                "group relative rounded-xl overflow-hidden cursor-pointer border transition-all duration-200",
                                activeItem?.id === gen.id
                                    ? "border-primary/50 bg-white/5 ring-1 ring-primary/20"
                                    : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex gap-3 p-2">
                                {/* Thumbnail */}
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                                    {isValidImageUrl(gen.imageUrl) ? (
                                        <Image
                                            src={gen.imageUrl}
                                            alt={gen.prompt || "Generation"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : gen.videoUrl ? (
                                        /* Video thumbnail placeholder - can't use mp4 in Image */
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-blue-500/20">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                <div className="w-0 h-0 border-l-[6px] border-l-white/80 border-y-[4px] border-y-transparent ml-0.5" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            {gen.status === 'generating' ? <Clock className="w-4 h-4 animate-spin" /> : <Info className="w-4 h-4" />}
                                        </div>
                                    )}
                                    {/* Type Badge */}
                                    <div className="absolute top-1 right-1 px-1 py-0.5 rounded-sm bg-black/60 backdrop-blur-sm text-[8px] uppercase font-bold text-white/80">
                                        {gen.type === 'video' ? 'VID' : 'IMG'}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="text-xs text-white/90 font-medium truncate mb-1">
                                        {gen.prompt || "Untitled Creation"}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                                        <span>{gen.model}</span>
                                        <span>•</span>
                                        <span>{timeAgo(gen.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Details Panel (Sticky Bottom) */}
            {activeItem && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <h4 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">Generation Details</h4>

                    <div className="space-y-3">
                        {/* Prompt */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30">Prompt</label>
                            <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                                {activeItem.prompt}
                            </p>
                        </div>

                        {/* Seed & Model */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <label className="text-[9px] text-white/30 block mb-1">Seed</label>
                                <div className="flex items-center gap-1.5">
                                    <Hash className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-mono text-primary/90">
                                        {activeItem.seed || "Random"}
                                    </span>
                                    {activeItem.seed && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopySeed(activeItem.seed!) }}
                                            className="ml-auto hover:text-white transition-colors"
                                        >
                                            {copiedSeed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                <label className="text-[9px] text-white/30 block mb-1">Model</label>
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs text-white/80 truncate">
                                        {activeItem.model}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="flex items-center justify-between text-[9px] text-white/20 font-mono">
                            <span>ID: {activeItem.id.slice(0, 8)}...</span>
                            <span className="uppercase">{activeItem.status}</span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
