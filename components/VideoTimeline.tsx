"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Scissors,
    Clock,
    Maximize2,
    Download,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoTimelineProps {
    videoUrl: string
    onTrimApply?: (startTime: number, endTime: number) => void
    onExtendRequest?: () => void
    onClose?: () => void
    className?: string
}

export function VideoTimeline({
    videoUrl,
    onTrimApply,
    onExtendRequest,
    onClose,
    className,
}: VideoTimelineProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [trimStart, setTrimStart] = useState(0)
    const [trimEnd, setTrimEnd] = useState(0)
    const [isDragging, setIsDragging] = useState<"start" | "end" | "playhead" | null>(null)
    const [thumbnails, setThumbnails] = useState<string[]>([])

    // Load video metadata
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleLoadedMetadata = () => {
            setDuration(video.duration)
            setTrimEnd(video.duration)
            generateThumbnails(video)
        }

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)
            // Stop at trim end
            if (video.currentTime >= trimEnd) {
                video.pause()
                setIsPlaying(false)
            }
        }

        video.addEventListener("loadedmetadata", handleLoadedMetadata)
        video.addEventListener("timeupdate", handleTimeUpdate)

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata)
            video.removeEventListener("timeupdate", handleTimeUpdate)
        }
    }, [trimEnd])

    // Generate thumbnails from video
    const generateThumbnails = async (video: HTMLVideoElement) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = 80
        canvas.height = 45
        const thumbCount = 10
        const interval = video.duration / thumbCount
        const thumbs: string[] = []

        for (let i = 0; i < thumbCount; i++) {
            video.currentTime = i * interval
            await new Promise((resolve) => {
                video.onseeked = () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    thumbs.push(canvas.toDataURL("image/jpeg", 0.5))
                    resolve(null)
                }
            })
        }

        setThumbnails(thumbs)
        video.currentTime = 0
    }

    // Play/Pause
    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            if (currentTime >= trimEnd) {
                video.currentTime = trimStart
            }
            video.play()
        }
        setIsPlaying(!isPlaying)
    }

    // Seek
    const seek = (time: number) => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = Math.max(trimStart, Math.min(trimEnd, time))
    }

    // Handle timeline click/drag
    const handleTimelineInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const timeline = timelineRef.current
        if (!timeline || !duration) return

        const rect = timeline.getBoundingClientRect()
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
        const x = clientX - rect.left
        const percent = Math.max(0, Math.min(1, x / rect.width))
        const time = percent * duration

        if (isDragging === "start") {
            setTrimStart(Math.min(time, trimEnd - 0.5))
        } else if (isDragging === "end") {
            setTrimEnd(Math.max(time, trimStart + 0.5))
        } else if (isDragging === "playhead") {
            seek(time)
        }
    }, [duration, isDragging, trimStart, trimEnd])

    // Mouse/Touch handlers
    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return
            const mouseEvent = e as MouseEvent
            const touchEvent = e as TouchEvent
            const clientX = mouseEvent.clientX ?? touchEvent.touches?.[0]?.clientX

            const timeline = timelineRef.current
            if (!timeline || !clientX) return

            const rect = timeline.getBoundingClientRect()
            const x = clientX - rect.left
            const percent = Math.max(0, Math.min(1, x / rect.width))
            const time = percent * duration

            if (isDragging === "start") {
                setTrimStart(Math.min(time, trimEnd - 0.5))
            } else if (isDragging === "end") {
                setTrimEnd(Math.max(time, trimStart + 0.5))
            } else if (isDragging === "playhead") {
                seek(time)
            }
        }

        const handleUp = () => setIsDragging(null)

        if (isDragging) {
            window.addEventListener("mousemove", handleMove)
            window.addEventListener("mouseup", handleUp)
            window.addEventListener("touchmove", handleMove)
            window.addEventListener("touchend", handleUp)
        }

        return () => {
            window.removeEventListener("mousemove", handleMove)
            window.removeEventListener("mouseup", handleUp)
            window.removeEventListener("touchmove", handleMove)
            window.removeEventListener("touchend", handleUp)
        }
    }, [isDragging, duration, trimStart, trimEnd])

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        const ms = Math.floor((seconds % 1) * 10)
        return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`
    }

    const trimDuration = trimEnd - trimStart

    return (
        <div className={cn("w-full bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden", className)}>
            {/* Video Preview */}
            <div className="relative aspect-video bg-black">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onClick={togglePlay}
                />

                {/* Play/Pause Overlay */}
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-white" />
                        ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                        )}
                    </div>
                </button>

                {/* Time Display */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-sm font-mono text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4">
                {/* Thumbnails Track */}
                <div
                    ref={timelineRef}
                    className="relative h-12 rounded-lg overflow-hidden cursor-pointer select-none"
                    onMouseDown={(e) => {
                        setIsDragging("playhead")
                        handleTimelineInteraction(e)
                    }}
                >
                    {/* Thumbnail Strip */}
                    <div className="absolute inset-0 flex">
                        {thumbnails.length > 0 ? (
                            thumbnails.map((thumb, i) => (
                                <img
                                    key={i}
                                    src={thumb}
                                    alt=""
                                    className="h-full flex-1 object-cover"
                                    draggable={false}
                                />
                            ))
                        ) : (
                            <div className="w-full h-full bg-white/10 animate-pulse" />
                        )}
                    </div>

                    {/* Trim Overlay (dimmed areas) */}
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-black/70"
                        style={{ width: `${(trimStart / duration) * 100}%` }}
                    />
                    <div
                        className="absolute top-0 bottom-0 right-0 bg-black/70"
                        style={{ width: `${((duration - trimEnd) / duration) * 100}%` }}
                    />

                    {/* Trim Selection Border */}
                    <div
                        className="absolute top-0 bottom-0 border-2 border-primary rounded"
                        style={{
                            left: `${(trimStart / duration) * 100}%`,
                            right: `${((duration - trimEnd) / duration) * 100}%`,
                        }}
                    />

                    {/* Trim Handles */}
                    <div
                        className="absolute top-0 bottom-0 w-4 bg-primary cursor-ew-resize flex items-center justify-center rounded-l"
                        style={{ left: `calc(${(trimStart / duration) * 100}% - 8px)` }}
                        onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging("start")
                        }}
                    >
                        <div className="w-0.5 h-6 bg-white/50 rounded" />
                    </div>
                    <div
                        className="absolute top-0 bottom-0 w-4 bg-primary cursor-ew-resize flex items-center justify-center rounded-r"
                        style={{ left: `calc(${(trimEnd / duration) * 100}% - 8px)` }}
                        onMouseDown={(e) => {
                            e.stopPropagation()
                            setIsDragging("end")
                        }}
                    >
                        <div className="w-0.5 h-6 bg-white/50 rounded" />
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white" />
                    </div>
                </div>

                {/* Trim Info */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-primary" />
                        <span className="text-white/70">Trim:</span>
                        <span className="font-mono text-white">{formatTime(trimStart)} - {formatTime(trimEnd)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/50" />
                        <span className="font-mono text-white">{formatTime(trimDuration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    {/* Playback Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => seek(trimStart)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="p-3 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button
                            onClick={() => seek(trimEnd)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setTrimStart(0)
                                setTrimEnd(duration)
                            }}
                            className="border-white/20 text-white/70 hover:bg-white/10"
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                        </Button>

                        {onExtendRequest && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExtendRequest}
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Extend +5s
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={() => onTrimApply?.(trimStart, trimEnd)}
                            className="bg-primary hover:bg-primary/80"
                        >
                            <Scissors className="w-4 h-4 mr-1" />
                            Apply Trim
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Compact timeline for inline editing
export function VideoTimelineCompact({
    videoUrl,
    onEdit,
}: {
    videoUrl: string
    onEdit?: () => void
}) {
    return (
        <button
            onClick={onEdit}
            className="group w-full h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all relative"
        >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                <Scissors className="w-4 h-4 text-primary mr-1" />
                <span className="text-xs text-white">Edit</span>
            </div>
            <div className="w-full h-full bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
        </button>
    )
}
