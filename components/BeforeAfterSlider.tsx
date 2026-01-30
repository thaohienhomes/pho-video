"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeftRight, Maximize2, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeAfterSliderProps {
    beforeSrc: string
    afterSrc: string
    beforeLabel?: string
    afterLabel?: string
    type?: "image" | "video"
    className?: string
}

export function BeforeAfterSlider({
    beforeSrc,
    afterSrc,
    beforeLabel = "Before",
    afterLabel = "After",
    type = "video",
    className,
}: BeforeAfterSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const beforeVideoRef = useRef<HTMLVideoElement>(null)
    const afterVideoRef = useRef<HTMLVideoElement>(null)
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [isPlaying, setIsPlaying] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Sync video playback
    useEffect(() => {
        if (type === "video" && beforeVideoRef.current && afterVideoRef.current) {
            const syncVideos = () => {
                if (beforeVideoRef.current && afterVideoRef.current) {
                    afterVideoRef.current.currentTime = beforeVideoRef.current.currentTime
                }
            }
            beforeVideoRef.current.addEventListener("timeupdate", syncVideos)
            return () => {
                beforeVideoRef.current?.removeEventListener("timeupdate", syncVideos)
            }
        }
    }, [type])

    // Play/Pause sync
    useEffect(() => {
        if (type === "video") {
            if (isPlaying) {
                beforeVideoRef.current?.play()
                afterVideoRef.current?.play()
            } else {
                beforeVideoRef.current?.pause()
                afterVideoRef.current?.pause()
            }
        }
    }, [isPlaying, type])

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        handleMove(e.clientX)
    }, [handleMove])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            handleMove(e.clientX)
        }
    }, [isDragging, handleMove])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setIsDragging(true)
        handleMove(e.touches[0].clientX)
    }, [handleMove])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isDragging) {
            handleMove(e.touches[0].clientX)
        }
    }, [isDragging, handleMove])

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!isFullscreen) {
                containerRef.current.requestFullscreen?.()
            } else {
                document.exitFullscreen?.()
            }
            setIsFullscreen(!isFullscreen)
        }
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none",
                "bg-black border border-white/10",
                className
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* After (Background - Full) */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                {type === "video" ? (
                    <video
                        ref={afterVideoRef}
                        src={afterSrc}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        autoPlay
                    />
                ) : (
                    <img
                        src={afterSrc}
                        alt={afterLabel}
                        className="w-full h-full object-contain"
                    />
                )}
            </div>

            {/* Before (Clipped - Slider controlled) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    {type === "video" ? (
                        <video
                            ref={beforeVideoRef}
                            src={beforeSrc}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                            autoPlay
                        />
                    ) : (
                        <img
                            src={beforeSrc}
                            alt={beforeLabel}
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-transform"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
                {/* Slider Handle */}
                <motion.div
                    className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                        "w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center",
                        isDragging && "scale-110"
                    )}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.15 }}
                >
                    <ArrowLeftRight className="w-5 h-5 text-black" />
                </motion.div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
                {beforeLabel}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/80 to-orange-500/80 backdrop-blur-sm text-white text-sm font-medium">
                {afterLabel}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                {type === "video" && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsPlaying(!isPlaying)
                        }}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                        ) : (
                            <Play className="w-4 h-4 text-white" />
                        )}
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleFullscreen()
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors"
                >
                    <Maximize2 className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Quality Indicator */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-xs text-white/70">
                    Original
                </div>
                <div className="px-2 py-1 rounded bg-primary/60 backdrop-blur-sm text-xs text-white font-medium">
                    Enhanced 4K
                </div>
            </div>
        </div>
    )
}

// Simple comparison mode (side by side)
export function SideBySideComparison({
    beforeSrc,
    afterSrc,
    beforeLabel = "Original",
    afterLabel = "Upscaled",
    type = "video",
}: Omit<BeforeAfterSliderProps, 'className'>) {
    return (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-white/10">
            <div className="relative aspect-video bg-black">
                {type === "video" ? (
                    <video
                        src={beforeSrc}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        autoPlay
                    />
                ) : (
                    <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-xs text-white/70">
                    {beforeLabel}
                </div>
            </div>
            <div className="relative aspect-video bg-black">
                {type === "video" ? (
                    <video
                        src={afterSrc}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        autoPlay
                    />
                ) : (
                    <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-primary/60 backdrop-blur-sm text-xs text-white font-medium">
                    {afterLabel}
                </div>
            </div>
        </div>
    )
}
