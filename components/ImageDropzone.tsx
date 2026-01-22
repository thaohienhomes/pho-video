"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageDropzoneProps {
    onImageSelect: (base64: string | null) => void
    disabled?: boolean
    maxSizeMB?: number
    value?: string | null // Initial or external image value
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const DEFAULT_MAX_SIZE_MB = 5

export function ImageDropzone({
    onImageSelect,
    disabled,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    value = null
}: ImageDropzoneProps) {
    const t = useTranslations("studio.imageMode")
    const [isDragOver, setIsDragOver] = useState(false)
    const [preview, setPreview] = useState<string | null>(value)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync preview with value prop (for Story Mode extension)
    useEffect(() => {
        if (value !== undefined) {
            setPreview(value)
        }
    }, [value])

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return t("error_invalid_type")
        }
        // Check file size
        const maxBytes = maxSizeMB * 1024 * 1024
        if (file.size > maxBytes) {
            return t("error_file_too_large")
        }
        return null
    }

    const processFile = useCallback(async (file: File) => {
        setError(null)

        // Validate
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        // Convert to Base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setPreview(base64)
            onImageSelect(base64)
        }
        reader.onerror = () => {
            setError("Failed to read file")
        }
        reader.readAsDataURL(file)
    }, [onImageSelect, t, maxSizeMB])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragOver(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        if (disabled) return

        const files = e.dataTransfer.files
        if (files.length > 0) {
            processFile(files[0])
        }
    }

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }

    const handleRemove = () => {
        setPreview(null)
        setError(null)
        onImageSelect(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Preview mode
    if (preview) {
        return (
            <div className="relative group">
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-contain bg-black/50"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Remove button */}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemove}
                        disabled={disabled}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-4 h-4 mr-1" />
                        {t("preview_remove")}
                    </Button>

                    {/* File info */}
                    <div className="absolute bottom-2 left-2 text-xs text-white/70 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Image ready</span>
                    </div>
                </div>
            </div>
        )
    }

    // Dropzone mode
    return (
        <div className="space-y-2">
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    // Base styles
                    "relative flex flex-col items-center justify-center",
                    "h-48 rounded-xl border-2 border-dashed cursor-pointer",
                    "transition-all duration-300",
                    // Disabled
                    disabled && "opacity-50 cursor-not-allowed",
                    // Drag over state - Vermilion glow
                    isDragOver ? [
                        "border-primary bg-primary/10",
                        "shadow-[0_0_30px_rgba(240,66,28,0.3)]",
                    ] : [
                        // Default state
                        "border-white/20 bg-white/5",
                        "hover:border-primary/50 hover:bg-primary/5",
                        "hover:shadow-[0_0_20px_rgba(240,66,28,0.15)]",
                    ]
                )}
            >
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />

                {/* Upload icon with animation */}
                <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all",
                    isDragOver ? "bg-primary/20 scale-110" : "bg-white/5"
                )}>
                    <Upload className={cn(
                        "w-8 h-8 transition-all",
                        isDragOver ? "text-primary" : "text-white/50"
                    )} />
                </div>

                {/* Text */}
                <p className="text-sm font-medium text-white/80 mb-1">
                    {t("dropzone_title")}
                </p>
                <p className="text-xs text-muted-foreground">
                    {t("dropzone_subtitle")}
                </p>
            </div>

            {/* Hint or Error */}
            {error ? (
                <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {t("dropzone_hint")}
                </p>
            )}
        </div>
    )
}
