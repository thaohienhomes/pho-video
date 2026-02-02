"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Download,
    Share2,
    Maximize2,
    Play,
    Pause,
    Volume2,
    VolumeX,
    RefreshCw,
    Loader2,
    Check,
    X
} from "lucide-react"
import { useState, useRef } from "react"

type ResultType = "image" | "video" | "audio"

interface ResultDisplayProps {
    type: ResultType
    url: string | null
    isGenerating?: boolean
    progress?: number
    onDownload?: () => void
    onShare?: () => void
    onUpscale?: () => void
    onRegenerate?: () => void
    className?: string
    aspectRatio?: "square" | "video" | "portrait"
    emptyMessage?: string
}

/**
 * ResultDisplay - Pixel Perfect Result Preview Component
 * 
 * Displays generated content (image/video/audio) with action buttons
 */
export function ResultDisplay({
    type,
    url,
    isGenerating = false,
    progress,
    onDownload,
    onShare,
    onUpscale,
    onRegenerate,
    className,
    aspectRatio = "video",
    emptyMessage = "Your result will appear here"
}: ResultDisplayProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlay = () => {
        if (type === "video" && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        } else if (type === "audio" && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
        }
        setIsMuted(!isMuted)
    }

    const aspectRatioClass = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[9/16]"
    }

    return (
        <div className={cn(
            "relative overflow-hidden",
            "rounded-[var(--pho-radius-xl)]",
            "bg-[var(--pho-bg-surface)]",
            "border border-[var(--pho-border-default)]",
            aspectRatioClass[aspectRatio],
            className
        )}>
            <AnimatePresence mode="wait">
                {isGenerating ? (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--pho-bg-surface)]"
                    >
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            {progress !== undefined && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-[var(--pho-text-muted)]">
                            Generating...
                        </p>

                        {/* Progress bar */}
                        {progress !== undefined && (
                            <div className="w-48 h-1 mt-3 rounded-full bg-[var(--pho-glass-light)] overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </motion.div>
                ) : url ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {type === "image" && (
                            <img
                                src={url}
                                alt="Generated result"
                                className="w-full h-full object-contain"
                            />
                        )}

                        {type === "video" && (
                            <video
                                ref={videoRef}
                                src={url}
                                className="w-full h-full object-contain"
                                loop
                                muted={isMuted}
                                playsInline
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        )}

                        {type === "audio" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                    <Volume2 className="w-10 h-10 text-primary" />
                                </div>
                                <audio
                                    ref={audioRef}
                                    src={url}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                            </div>
                        )}

                        {/* Media Controls Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-between">
                                {/* Left: Playback controls */}
                                <div className="flex items-center gap-2">
                                    {(type === "video" || type === "audio") && (
                                        <>
                                            <motion.button
                                                onClick={togglePlay}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Play className="w-4 h-4 text-white ml-0.5" />
                                                )}
                                            </motion.button>

                                            {type === "video" && (
                                                <motion.button
                                                    onClick={toggleMute}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                                >
                                                    {isMuted ? (
                                                        <VolumeX className="w-3.5 h-3.5 text-white" />
                                                    ) : (
                                                        <Volume2 className="w-3.5 h-3.5 text-white" />
                                                    )}
                                                </motion.button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2">
                                    {onRegenerate && (
                                        <motion.button
                                            onClick={onRegenerate}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                            title="Regenerate"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 text-white" />
                                        </motion.button>
                                    )}

                                    {onUpscale && type !== "audio" && (
                                        <motion.button
                                            onClick={onUpscale}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                            title="Upscale"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                                        </motion.button>
                                    )}

                                    {onShare && (
                                        <motion.button
                                            onClick={onShare}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                            title="Share"
                                        >
                                            <Share2 className="w-3.5 h-3.5 text-white" />
                                        </motion.button>
                                    )}

                                    {onDownload && (
                                        <motion.button
                                            onClick={onDownload}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-3.5 h-3.5 text-white" />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-[var(--pho-glass-light)] flex items-center justify-center mb-3">
                            <Play className="w-6 h-6 text-[var(--pho-text-muted)]" />
                        </div>
                        <p className="text-sm text-[var(--pho-text-muted)]">
                            {emptyMessage}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
