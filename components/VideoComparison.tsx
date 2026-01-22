"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Maximize2, Sparkles, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoComparisonProps {
    originalUrl: string
    upscaledUrl: string
    className?: string
}

export function VideoComparison({
    originalUrl,
    upscaledUrl,
    className
}: VideoComparisonProps) {
    const [sliderPos, setSliderPos] = useState(50)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef1 = useRef<HTMLVideoElement>(null) // Original
    const videoRef2 = useRef<HTMLVideoElement>(null) // Upscaled

    // Sync playback state
    const togglePlayback = () => {
        if (!videoRef1.current || !videoRef2.current) return

        if (isPlaying) {
            videoRef1.current.pause()
            videoRef2.current.pause()
        } else {
            videoRef1.current.play()
            videoRef2.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    // Sync time to minimize drift
    const handleTimeUpdate = () => {
        if (!videoRef1.current || !videoRef2.current) return
        const drift = Math.abs(videoRef1.current.currentTime - videoRef2.current.currentTime)
        if (drift > 0.1) {
            videoRef2.current.currentTime = videoRef1.current.currentTime
        }
    }

    // Handle slider interaction
    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = (x / rect.width) * 100
        setSliderPos(percent)
    }, [])

    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX)
    }

    // Global listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchend', handleMouseUp)
        } else {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchend', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div
            ref={containerRef}
            className={cn("relative aspect-video rounded-xl overflow-hidden cursor-ew-resize group shadow-2xl", className)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* Bottom Layer: ORIGINAL */}
            <video
                ref={videoRef1}
                src={originalUrl}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Label: Before */}
            <div className="absolute top-4 left-4 z-20 px-2 py-1 rounded bg-black/50 text-[10px] font-bold text-white/70 backdrop-blur-md border border-white/10 uppercase tracking-widest pointer-events-none">
                Original
            </div>

            {/* Top Layer: UPSCALED (Clipped) */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <video
                    ref={videoRef2}
                    src={upscaledUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                />

                {/* Label: After */}
                <div className="absolute top-4 right-4 z-20 px-2 py-1 rounded bg-primary/20 text-[10px] font-bold text-primary backdrop-blur-md border border-primary/30 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    4K Cinematic
                </div>
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 z-30 w-0.5 bg-primary/80 shadow-[0_0_15px_rgba(240,66,28,0.5)] cursor-ew-resize"
                style={{ left: `${sliderPos}%` }}
            >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-primary">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-primary/50" />
                        <div className="w-0.5 h-3 bg-primary/50" />
                    </div>
                </div>
            </div>

            {/* Controls Overlay (Bottom) */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-4 gap-4 z-40">
                <button
                    onClick={(e) => { e.stopPropagation(); togglePlayback(); }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <div className="flex-1" />

                <span className="text-[10px] text-white/50 uppercase tracking-tighter">
                    Slide to compare
                </span>
            </div>

            {/* Click to play/pause main area */}
            <div className="absolute inset-0 z-10" onClick={togglePlayback} />
        </div>
    )
}
