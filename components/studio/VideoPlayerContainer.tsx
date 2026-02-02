"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

interface VideoPlayerContainerProps {
    src?: string
    poster?: string
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "21:9"
    className?: string
    showControls?: boolean
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    onEnded?: () => void
    children?: React.ReactNode
}

/**
 * VideoPlayerContainer - Pixel-perfect video player wrapper
 * 
 * Specs from component-specs.md:
 * - Border Radius: 16px
 * - Background: #121212
 * - Overflow: hidden
 * - Aspect Ratio: 16:9 (default)
 */
export const VideoPlayerContainer = forwardRef<HTMLVideoElement, VideoPlayerContainerProps>(
    function VideoPlayerContainer(
        {
            src,
            poster,
            aspectRatio = "16:9",
            className,
            showControls = true,
            autoPlay = false,
            loop = false,
            muted = false,
            onEnded,
            children
        },
        ref
    ) {
        const aspectRatioClass: Record<string, string> = {
            "16:9": "aspect-video",
            "9:16": "aspect-[9/16]",
            "1:1": "aspect-square",
            "4:3": "aspect-[4/3]",
            "21:9": "aspect-[21/9]"
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "relative overflow-hidden",
                    "rounded-[var(--pho-radius-xl)]",
                    "bg-[#121212]",
                    "border border-[var(--pho-border-default)]",
                    aspectRatioClass[aspectRatio],
                    className
                )}
            >
                {src ? (
                    <video
                        ref={ref}
                        src={src}
                        poster={poster}
                        autoPlay={autoPlay}
                        loop={loop}
                        muted={muted}
                        playsInline
                        onEnded={onEnded}
                        controls={showControls}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // Empty state placeholder
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--pho-glass-light)] flex items-center justify-center mb-4">
                            <Play className="w-8 h-8 text-[var(--pho-text-muted)] ml-1" />
                        </div>
                        <p className="text-sm text-[var(--pho-text-muted)]">No video</p>
                    </div>
                )}

                {/* Optional children overlay */}
                {children}
            </motion.div>
        )
    }
)

/**
 * Custom Video Controls - Glassmorphism style
 */
interface VideoControlsProps {
    isPlaying: boolean
    isMuted: boolean
    progress: number
    duration: number
    onPlayPause: () => void
    onMuteToggle: () => void
    onSeek: (progress: number) => void
    onFullscreen: () => void
    onRestart: () => void
    className?: string
}

export function VideoControls({
    isPlaying,
    isMuted,
    progress,
    duration,
    onPlayPause,
    onMuteToggle,
    onSeek,
    onFullscreen,
    onRestart,
    className
}: VideoControlsProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "absolute bottom-0 left-0 right-0 p-4",
                "bg-gradient-to-t from-black/80 to-transparent",
                className
            )}
        >
            {/* Progress Bar */}
            <div
                className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const progress = (e.clientX - rect.left) / rect.width
                    onSeek(progress)
                }}
            >
                <div
                    className="absolute h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(progress / duration) * 100}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${(progress / duration) * 100}%`, transform: "translate(-50%, -50%)" }}
                />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                        onClick={onPlayPause}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                    </button>

                    {/* Restart */}
                    <button
                        onClick={onRestart}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <RotateCcw className="w-4 h-4 text-white" />
                    </button>

                    {/* Mute */}
                    <button
                        onClick={onMuteToggle}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                        )}
                    </button>

                    {/* Time */}
                    <span className="text-xs text-white/70 ml-2">
                        {formatTime(progress)} / {formatTime(duration)}
                    </span>
                </div>

                {/* Fullscreen */}
                <button
                    onClick={onFullscreen}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                    <Maximize className="w-4 h-4 text-white" />
                </button>
            </div>
        </motion.div>
    )
}
