"use client"

import { useState, useCallback } from "react"
import { motion, Reorder, useDragControls } from "framer-motion"
import {
    GripVertical,
    Play,
    Trash2,
    Plus,
    Film,
    Loader2,
    Sparkles,
    Check,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoClip {
    id: string
    url: string
    thumbnail?: string
    duration: number
    title?: string
}

interface VideoClipMergerProps {
    clips: VideoClip[]
    onClipsChange?: (clips: VideoClip[]) => void
    onMerge?: (clips: VideoClip[]) => void
    onAddClip?: () => void
    className?: string
}

export function VideoClipMerger({
    clips,
    onClipsChange,
    onMerge,
    onAddClip,
    className,
}: VideoClipMergerProps) {
    const [selectedTransition, setSelectedTransition] = useState<"cut" | "fade" | "dissolve">("cut")
    const [isMerging, setIsMerging] = useState(false)
    const [previewClip, setPreviewClip] = useState<string | null>(null)

    const handleReorder = (newOrder: VideoClip[]) => {
        onClipsChange?.(newOrder)
    }

    const handleRemove = (id: string) => {
        onClipsChange?.(clips.filter(c => c.id !== id))
    }

    const handleMerge = async () => {
        if (clips.length < 2) return
        setIsMerging(true)

        // Simulate merge delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        onMerge?.(clips)
        setIsMerging(false)
    }

    const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0)

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const TRANSITIONS = [
        { id: "cut", label: "Cut", icon: "⚡" },
        { id: "fade", label: "Fade", icon: "🌅" },
        { id: "dissolve", label: "Dissolve", icon: "✨" },
    ] as const

    return (
        <div className={cn("w-full bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Film className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Merge Clips</h3>
                            <p className="text-sm text-white/50">
                                {clips.length} clips • {formatDuration(totalDuration)} total
                            </p>
                        </div>
                    </div>

                    {onAddClip && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddClip}
                            className="border-white/20 text-white/70 hover:bg-white/10"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Clip
                        </Button>
                    )}
                </div>
            </div>

            {/* Clip List */}
            <div className="p-4">
                {clips.length === 0 ? (
                    <div className="py-12 text-center">
                        <Film className="w-12 h-12 mx-auto text-white/20 mb-3" />
                        <p className="text-white/50">No clips added yet</p>
                        {onAddClip && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAddClip}
                                className="mt-4 border-primary/50 text-primary hover:bg-primary/10"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add First Clip
                            </Button>
                        )}
                    </div>
                ) : (
                    <Reorder.Group
                        axis="y"
                        values={clips}
                        onReorder={handleReorder}
                        className="space-y-2"
                    >
                        {clips.map((clip, index) => (
                            <ClipItem
                                key={clip.id}
                                clip={clip}
                                index={index}
                                isLast={index === clips.length - 1}
                                transition={selectedTransition}
                                onRemove={() => handleRemove(clip.id)}
                                onPreview={() => setPreviewClip(clip.url)}
                            />
                        ))}
                    </Reorder.Group>
                )}
            </div>

            {/* Transition Selector */}
            {clips.length >= 2 && (
                <div className="px-4 pb-4">
                    <label className="text-xs font-medium text-white/50 mb-2 block">
                        Transition Style
                    </label>
                    <div className="flex gap-2">
                        {TRANSITIONS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTransition(t.id)}
                                className={cn(
                                    "flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border",
                                    selectedTransition === t.id
                                        ? "bg-primary/20 border-primary text-primary"
                                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                                )}
                            >
                                <span className="mr-1.5">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Merge Button */}
            {clips.length >= 2 && (
                <div className="p-4 border-t border-white/10">
                    <Button
                        onClick={handleMerge}
                        disabled={isMerging}
                        className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400"
                    >
                        {isMerging ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Merging Clips...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Merge {clips.length} Clips
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Preview Modal */}
            {previewClip && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setPreviewClip(null)}
                >
                    <div className="max-w-2xl w-full rounded-2xl overflow-hidden bg-black">
                        <video
                            src={previewClip}
                            controls
                            autoPlay
                            className="w-full aspect-video"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// Individual clip item with drag
function ClipItem({
    clip,
    index,
    isLast,
    transition,
    onRemove,
    onPreview,
}: {
    clip: VideoClip
    index: number
    isLast: boolean
    transition: string
    onRemove: () => void
    onPreview: () => void
}) {
    const controls = useDragControls()

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <>
            <Reorder.Item
                value={clip}
                dragListener={false}
                dragControls={controls}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
                {/* Drag Handle */}
                <button
                    onPointerDown={(e) => controls.start(e)}
                    className="p-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                {/* Thumbnail */}
                <div
                    className="w-20 h-12 rounded-lg bg-white/10 overflow-hidden cursor-pointer"
                    onClick={onPreview}
                >
                    {clip.thumbnail ? (
                        <img
                            src={clip.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-5 h-5 text-white/30" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {clip.title || `Clip ${index + 1}`}
                    </p>
                    <p className="text-xs text-white/50">
                        {formatDuration(clip.duration)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onPreview}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                    >
                        <Play className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Order Badge */}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/50">
                    {index + 1}
                </div>
            </Reorder.Item>

            {/* Transition Indicator */}
            {!isLast && (
                <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs text-white/40">
                        <ArrowRight className="w-3 h-3" />
                        <span className="capitalize">{transition}</span>
                    </div>
                </div>
            )}
        </>
    )
}
