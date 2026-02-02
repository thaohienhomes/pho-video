"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Upload, X, Image as ImageIcon, Film, Music, Loader2 } from "lucide-react"

type AcceptType = "image" | "video" | "audio"

interface UploadZoneProps {
    accept?: AcceptType | AcceptType[]
    onUpload: (file: File, dataUrl: string) => void
    preview?: string | null
    onClear?: () => void
    label?: string
    hint?: string
    className?: string
    aspectRatio?: "square" | "video" | "portrait"
    isLoading?: boolean
}

const ACCEPT_MAP = {
    image: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    video: { "video/*": [".mp4", ".webm", ".mov"] },
    audio: { "audio/*": [".mp3", ".wav", ".ogg", ".m4a"] },
}

const ICON_MAP = {
    image: ImageIcon,
    video: Film,
    audio: Music,
}

/**
 * UploadZone - Pixel Perfect File Upload Component
 * 
 * Specs from component-specs.md:
 * - Border: 2px dashed rgba(255, 255, 255, 0.20)
 * - Hover: border-color primary/50
 * - Active: border-color primary, background primary/5
 * - Border Radius: 16px
 */
export function UploadZone({
    accept = "image",
    onUpload,
    preview,
    onClear,
    label = "Drag & drop or click to upload",
    hint,
    className,
    aspectRatio = "video",
    isLoading = false
}: UploadZoneProps) {
    const acceptTypes = Array.isArray(accept) ? accept : [accept]
    const acceptConfig = acceptTypes.reduce((acc, type) => ({
        ...acc,
        ...ACCEPT_MAP[type]
    }), {})

    const Icon = ICON_MAP[acceptTypes[0]]

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                onUpload(file, reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [onUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptConfig,
        maxFiles: 1,
        disabled: isLoading
    })

    const aspectRatioClass = {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[9/16]"
    }

    return (
        <div className={cn("relative", className)}>
            <AnimatePresence mode="wait">
                {preview ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "relative rounded-[var(--pho-radius-xl)] overflow-hidden",
                            "border border-[var(--pho-border-default)]",
                            aspectRatioClass[aspectRatio]
                        )}
                    >
                        {acceptTypes.includes("video") && preview.startsWith("data:video") ? (
                            <video
                                src={preview}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Clear button */}
                        {onClear && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClear}
                                className={cn(
                                    "absolute top-3 right-3",
                                    "w-8 h-8 rounded-full",
                                    "bg-black/60 hover:bg-black/80",
                                    "flex items-center justify-center",
                                    "transition-colors"
                                )}
                            >
                                <X className="w-4 h-4 text-white" />
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex flex-col items-center justify-center",
                                "rounded-[var(--pho-radius-xl)]",
                                "border-2 border-dashed",
                                "transition-all duration-[var(--pho-duration-normal)]",
                                "cursor-pointer",
                                aspectRatioClass[aspectRatio],
                                isDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-[var(--pho-border-default)] hover:border-primary/50 bg-[var(--pho-glass-light)]",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <input {...getInputProps()} />

                            {isLoading ? (
                                <Loader2 className="w-10 h-10 text-[var(--pho-text-muted)] animate-spin" />
                            ) : (
                                <>
                                    <motion.div
                                        animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                        className={cn(
                                            "w-14 h-14 rounded-[var(--pho-radius-lg)]",
                                            "flex items-center justify-center mb-3",
                                            "bg-[var(--pho-glass-medium)]",
                                            isDragActive && "bg-primary/10"
                                        )}
                                    >
                                        {isDragActive ? (
                                            <Upload className="w-6 h-6 text-primary" />
                                        ) : (
                                            <Icon className="w-6 h-6 text-[var(--pho-text-muted)]" />
                                        )}
                                    </motion.div>

                                    <p className={cn(
                                        "text-sm font-medium",
                                        isDragActive ? "text-primary" : "text-[var(--pho-text-secondary)]"
                                    )}>
                                        {isDragActive ? "Drop here!" : label}
                                    </p>

                                    {hint && !isDragActive && (
                                        <p className="text-[12px] text-[var(--pho-text-muted)] mt-1">
                                            {hint}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
