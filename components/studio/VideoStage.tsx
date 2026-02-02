"use client"

import { ReactNode, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Download,
    Share2,
    Scissors,
    Music2,
    Maximize2,
    Play,
    Pause,
    Film,
    Volume2,
    VolumeX,
    Settings
} from "lucide-react"

interface VideoStageProps {
    /** Current video URL */
    videoUrl?: string | null
    /** Whether currently generating */
    isGenerating?: boolean
    /** Video aspect ratio */
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3"
    /** Show comparison slider */
    showComparison?: boolean
    /** Comparison mode labels */
    comparisonLabels?: { before: string; after: string }
    /** Action handlers */
    onDownload?: () => void
    onShare?: () => void
    onExtend?: () => void
    onAddSound?: () => void
    onUpscale?: () => void
    className?: string
}

/**
 * VideoStage - Main video preview area matching mockup exactly
 * 
 * Mockup specs:
 * - Large video preview taking most of main stage
 * - Custom control bar on hover (Play, Progress, Time, Volume, Fullscreen)
 * - Comparison slider with ORIGINAL/UPSCALED labels
 * - Action buttons row below: Download, Share, Extend, Add Phở Sound, 4K Ready
 * - Dark background with subtle border
 */
export function VideoStage({
    videoUrl,
    isGenerating = false,
    aspectRatio = "16:9",
    showComparison = false,
    comparisonLabels = { before: "ORIGINAL", after: "UPSCALED" },
    onDownload,
    onShare,
    onExtend,
    onAddSound,
    onUpscale,
    className
}: VideoStageProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(false)
    const [sliderPosition, setSliderPosition] = useState(50)

    // Handle video events
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const aspectClasses = {
        "16:9": "aspect-video",
        "9:16": "aspect-[9/16]",
        "1:1": "aspect-square",
        "4:3": "aspect-[4/3]"
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Video Preview Container - Takes most space */}
            <div className="flex-1 flex items-center justify-center p-6 relative group">
                <div
                    className={cn(
                        "relative w-full max-w-5xl mx-auto shadow-2xl",
                        "rounded-[20px] overflow-hidden",
                        "bg-[#050505] border border-white/10"
                    )}
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                >
                    {videoUrl ? (
                        // Video with controls
                        <div className={cn("relative group/video", aspectClasses[aspectRatio])}>
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-full object-cover"
                                loop
                                muted={isMuted}
                                playsInline
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onClick={togglePlay}
                            />

                            {/* Center Play/Pause Button - Mockup Style (fades out when playing) */}
                            <AnimatePresence>
                                {!isPlaying && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={togglePlay}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all z-10"
                                    >
                                        <Play className="w-8 h-8 text-white ml-1 fill-white" />
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Comparison Slider Overlay */}
                            {showComparison && (
                                <>
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        style={{ left: `${sliderPosition}%` }}
                                    />
                                    <div
                                        className="absolute bottom-16 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-bold tracking-wider text-white border border-white/10 z-20"
                                        style={{ left: `${sliderPosition - 12}%` }}
                                    >
                                        {comparisonLabels.before}
                                    </div>
                                    <div
                                        className="absolute bottom-16 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-bold tracking-wider text-white border border-white/10 z-20"
                                        style={{ left: `${sliderPosition + 2}%` }}
                                    >
                                        {comparisonLabels.after}
                                    </div>
                                </>
                            )}

                            {/* Custom Control Bar - Slide up on hover */}
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: showControls || !isPlaying ? 1 : 0, y: showControls || !isPlaying ? 0 : 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Progress Bar */}
                                <div className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer overflow-hidden group/progress">
                                    <div
                                        className="absolute h-full bg-primary rounded-full"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                    />
                                    <div
                                        className="absolute h-full bg-white/50 w-full opacity-0 group-hover/progress:opacity-20 transition-opacity"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                                            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                                        </button>

                                        <div className="flex items-center gap-2 group/vol">
                                            <button onClick={toggleMute} className="text-white hover:text-white/80">
                                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                            </button>
                                            <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                                <div className="h-1 bg-white/30 rounded-full w-full mx-2">
                                                    <div className="h-full w-[70%] bg-white rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        <span className="text-xs font-medium text-white/70 tabular-nums">
                                            {formatTime(currentTime)} / {formatTime(duration || 0)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="text-white/50 hover:text-white transition-colors">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button className="text-white/50 hover:text-white transition-colors">
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        // Empty State - Cinematic Upgrade
                        <div className={cn(
                            "flex flex-col items-center justify-center",
                            aspectClasses[aspectRatio],
                            "min-h-[400px] w-full"
                        )}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                                    <Film className="w-10 h-10 text-white/80" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                                Ready for Action
                            </h3>
                            <p className="text-base text-white/40 text-center max-w-sm font-light">
                                Describe your vision on the left to start generating cinematic magic.
                            </p>
                        </div>
                    )}

                    {/* Generating Overlay - Frosted Glass */}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                                <div className="relative w-16 h-16 rounded-full border-2 border-white/10 border-t-primary animate-spin mb-6" />
                            </div>
                            <p className="text-lg font-medium text-white tracking-wide">Generating Masterpiece...</p>
                            <p className="text-sm text-white/40 mt-2 font-mono">EST: 0:45</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons Row - Polished Glass Style */}
            {videoUrl && (
                <div className="flex-shrink-0 flex items-center justify-center gap-4 py-6">
                    {/* Download - Primary Gradient */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDownload}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white text-sm font-semibold shadow-[0_8px_20px_rgba(240,66,28,0.25)] hover:shadow-[0_12px_24px_rgba(240,66,28,0.35)] transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </motion.button>

                    {/* Secondary Actions - Glass Ghost */}
                    {[
                        { icon: Share2, label: "Share", action: onShare },
                        { icon: Scissors, label: "Extend", action: onExtend },
                        { icon: Music2, label: "Add Sound", action: onAddSound },
                        { icon: Maximize2, label: "Upscale 4K", action: onUpscale, badge: true }
                    ].map((btn, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={btn.action}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3 rounded-xl",
                                "bg-white/5 border border-white/10",
                                "text-white/70 text-sm font-medium",
                                "transition-all backdrop-blur-sm",
                                btn.badge && "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                            )}
                        >
                            <btn.icon className="w-4 h-4" />
                            {btn.label}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    )
}
