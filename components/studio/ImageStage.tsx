"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Download,
    Share2,
    RefreshCw,
    Maximize2,
    Check,
    ImageIcon,
    Loader2,
    Copy,
    Video,
    Sparkles,
    ClipboardPaste,
    Dice6
} from "lucide-react"
import { TemplateDock } from "./TemplateDock"
import { type ImageTemplate, IMAGE_TEMPLATES } from "@/data/image-templates"

interface ImageStageProps {
    images?: string[]
    isGenerating?: boolean
    seed?: number | null
    onDownload?: (url: string) => void
    onDownloadAll?: () => void
    onRemix?: (url: string) => void
    onAnimate?: (url: string) => void
    onSelectTemplate?: (template: ImageTemplate) => void
    onPasteImage?: (imageData: string) => void
    onRandomize?: (prompt: string, aspectRatio: string) => void
    className?: string
    aspectRatio?: string
}

// Validate if URL is usable for Next.js Image component
function isValidImageUrl(url: string | null | undefined): url is string {
    if (!url) return false
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

export function ImageStage({
    images = [],
    isGenerating = false,
    seed,
    onDownload,
    onDownloadAll,
    onRemix,
    onAnimate,
    onSelectTemplate,
    onPasteImage,
    onRandomize,
    className,
    aspectRatio = "1:1"
}: ImageStageProps) {
    // Filter out invalid URLs before rendering
    const validImages = images.filter(isValidImageUrl)

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    // Handle initial selection when images load
    if (validImages.length > 0 && selectedIndex === null) {
        setSelectedIndex(0)
    }

    // Convert string ratio (16:9) to CSS value (16/9)
    const getAspectRatioStyle = () => {
        const [w, h] = aspectRatio.split(':').map(Number)
        return { aspectRatio: `${w}/${h}` }
    }

    // Handle paste image from clipboard
    const handlePasteImage = useCallback(async () => {
        try {
            const clipboardItems = await navigator.clipboard.read()
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'))
                if (imageType) {
                    const blob = await item.getType(imageType)
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const base64 = e.target?.result as string
                        if (base64 && onPasteImage) {
                            onPasteImage(base64)
                        }
                    }
                    reader.readAsDataURL(blob)
                    return
                }
            }
            // No image in clipboard - could show a toast here
            console.log('No image found in clipboard')
        } catch (err) {
            console.error('Failed to read clipboard:', err)
        }
    }, [onPasteImage])

    // Handle random prompt selection
    const handleRandomize = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * IMAGE_TEMPLATES.length)
        const randomTemplate = IMAGE_TEMPLATES[randomIndex]
        if (onRandomize) {
            onRandomize(randomTemplate.prompt, randomTemplate.aspectRatio)
        }
    }, [onRandomize])

    return (
        <div className={cn("flex flex-col h-full relative overflow-hidden bg-[#0A0A0A]", className)}>
            {/* Dot Pattern Background for Canvas Feel */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Main Stage Area */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">

                {validImages.length > 0 ? (
                    // GRID VIEW (Batch results)
                    <div className={cn(
                        "grid gap-4 w-full max-w-5xl mx-auto transition-all duration-300 pb-20",
                        validImages.length === 1 ? "grid-cols-1 max-w-xl" :
                            validImages.length === 2 ? "grid-cols-2 aspect-[2/1]" :
                                "grid-cols-2 aspect-square"
                    )}>
                        {validImages.map((img, idx) => (
                            <motion.div
                                key={idx}
                                layoutId={`image-${idx}`}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => setSelectedIndex(idx)}
                                className={cn(
                                    "relative rounded-2xl overflow-hidden group cursor-pointer border-2 transition-all duration-300",
                                    selectedIndex === idx
                                        ? "border-[#F0421C] shadow-[0_0_40px_rgba(240,66,28,0.5),inset_0_0_20px_rgba(240,66,28,0.1)] z-10 scale-[1.03]"
                                        : "border-white/10 hover:border-[#F0421C]/50 hover:shadow-[0_0_20px_rgba(240,66,28,0.2)]"
                                )}
                                style={validImages.length === 1 ? getAspectRatioStyle() : {}}
                            >
                                <Image
                                    src={img}
                                    alt={`Generation ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />

                                {/* Hover Overlay with Select Button */}
                                <div className={cn(
                                    "absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3",
                                    selectedIndex === idx && "opacity-0"
                                )}>
                                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#F0421C] to-[#EF4444] text-white rounded-lg font-bold text-sm transform scale-90 group-hover:scale-100 transition-all shadow-[0_0_15px_rgba(240,66,28,0.5)]">
                                        Select
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // CANVAS EMPTY STATE - Premium "Frame" with Vibrant Effects
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="relative w-full max-w-3xl flex items-center justify-center"
                    >
                        {/* Floating Gradient Orbs - LARGER & BRIGHTER */}
                        <motion.div
                            className="absolute -top-32 -left-32 w-64 h-64 bg-[#F0421C]/30 rounded-full blur-[100px] pointer-events-none"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-500/25 rounded-full blur-[100px] pointer-events-none"
                            animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Aspect Ratio Frame with Animated Border */}
                        <motion.div
                            className={cn(
                                "relative w-full rounded-3xl overflow-hidden",
                                "bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent",
                                "backdrop-blur-xl",
                                "flex flex-col items-center justify-center",
                                "transition-all duration-500 ease-in-out"
                            )}
                            style={{
                                ...getAspectRatioStyle(),
                                maxHeight: '70vh',
                                maxWidth: '100%'
                            }}
                        >
                            {/* Animated Gradient Border */}
                            <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-[#F0421C]/50 via-purple-500/30 to-[#F0421C]/50 opacity-60">
                                <div className="w-full h-full rounded-3xl bg-black/90" />
                            </div>

                            {/* Inner Glow */}
                            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(240,66,28,0.1)]" />

                            {/* Grid Pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '40px 40px'
                                }}
                            />

                            {/* Inner Content with staggered fade */}
                            <motion.div
                                className="relative z-10 flex flex-col items-center gap-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {/* Glowing Icon Circle */}
                                <motion.div
                                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#F0421C]/20 to-purple-500/10 border border-white/20 flex items-center justify-center backdrop-blur-md"
                                    animate={{
                                        scale: [1, 1.08, 1],
                                        boxShadow: [
                                            '0 0 30px rgba(240,66,28,0.2), 0 0 60px rgba(240,66,28,0.1)',
                                            '0 0 50px rgba(240,66,28,0.4), 0 0 80px rgba(240,66,28,0.2)',
                                            '0 0 30px rgba(240,66,28,0.2), 0 0 60px rgba(240,66,28,0.1)'
                                        ]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    {/* Inner glow ring */}
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                                    <ImageIcon className="w-10 h-10 text-white/70 relative z-10" />
                                </motion.div>

                                <motion.div
                                    className="text-center space-y-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent tracking-tight">
                                        Canvas Ready
                                    </h3>
                                    <p className="text-sm text-white/50">
                                        Frame set to <span className="text-[#F0421C] font-mono font-bold px-2 py-0.5 rounded bg-[#F0421C]/10">{aspectRatio}</span>. Type a prompt to fill it.
                                    </p>
                                </motion.div>

                                {/* Quick Actions with stronger glow */}
                                <motion.div
                                    className="flex items-center gap-4 mt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <motion.button
                                        onClick={handlePasteImage}
                                        whileHover={{ y: -3, scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/15 text-sm font-semibold text-white/80 transition-all duration-200 flex items-center gap-2.5 hover:text-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] hover:border-white/30"
                                    >
                                        <ClipboardPaste className="w-4 h-4" />
                                        Paste Image
                                    </motion.button>
                                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                                    <motion.button
                                        onClick={handleRandomize}
                                        whileHover={{ y: -3, scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F0421C]/20 to-[#F0421C]/10 hover:from-[#F0421C]/30 hover:to-[#F0421C]/20 border border-[#F0421C]/30 text-sm font-bold text-[#F0421C] transition-all duration-200 flex items-center gap-2.5 hover:shadow-[0_8px_40px_rgba(240,66,28,0.3)] hover:border-[#F0421C]/50"
                                    >
                                        <Dice6 className="w-4 h-4" />
                                        Randomize
                                    </motion.button>
                                </motion.div>
                            </motion.div>

                            {/* Corner Decorations */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/10 rounded-bl-lg" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/10 rounded-br-lg" />

                            {/* Dimensions Label - Enhanced */}
                            <motion.div
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/80 border border-white/15 backdrop-blur-xl text-xs font-mono text-white/70 shadow-2xl flex items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F0421C] animate-pulse" />
                                {aspectRatio}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Generating Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#F0421C]/30 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-16 h-16 rounded-full border-2 border-white/10 border-t-[#F0421C] animate-spin mb-6" />
                        </div>
                        <p className="text-lg font-medium text-white tracking-wide">Synthesizing Visuals...</p>
                    </div>
                )}
            </div>

            {/* Template Dock - Shows when no images */}
            {validImages.length === 0 && !isGenerating && onSelectTemplate && (
                <TemplateDock
                    onSelectTemplate={onSelectTemplate}
                />
            )}

            {/* Bottom Floating Glass Dock (Action Bar) */}
            {validImages.length > 0 && selectedIndex !== null && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-auto">
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-2 pr-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    >
                        {/* Batch Count Badge + Download All */}
                        <div className="relative flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5 ml-1">
                            {/* Batch Count Badge */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/20 border border-primary/30">
                                <span className="text-[10px] font-bold text-primary">{validImages.length}x</span>
                            </div>

                            <div className="w-px h-5 bg-white/10" />

                            <button
                                onClick={onDownloadAll}
                                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Download All"
                            >
                                <Download className="w-4 h-4" />
                            </button>

                            <div className="w-px h-5 bg-white/10" />

                            {/* Selection Indicator */}
                            <div className="flex items-center gap-2 px-2 cursor-pointer" title={`Selected: ${selectedIndex + 1} of ${validImages.length}`}>
                                <div className="w-4 h-4 rounded-full border border-[#F0421C] flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#F0421C] shadow-[0_0_8px_#F0421C]" />
                                </div>
                                <span className="text-[10px] text-white/50 font-medium">{selectedIndex + 1}/{validImages.length}</span>
                            </div>
                        </div>

                        {/* Seed Display (if available) */}
                        {seed && (
                            <>
                                <div className="w-px h-8 bg-white/5" />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(String(seed))
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                                    title="Copy Seed"
                                >
                                    <span className="text-[9px] text-white/40 font-medium">SEED</span>
                                    <span className="text-[10px] text-white/70 font-mono group-hover:text-white">{seed}</span>
                                    <Copy className="w-3 h-3 text-white/30 group-hover:text-primary transition-colors" />
                                </button>
                            </>
                        )}

                        <div className="w-px h-8 bg-white/5" />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onDownload?.(validImages[selectedIndex])}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Save
                            </button>

                            <button
                                onClick={() => onRemix?.(validImages[selectedIndex])}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Remix
                            </button>

                            <button
                                onClick={() => onAnimate?.(validImages[selectedIndex])}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F0421C] to-[#E53A15] text-white text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(240,66,28,0.3)]"
                            >
                                <Video className="w-3.5 h-3.5" />
                                Animate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
