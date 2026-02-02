"use client"

import { motion } from "framer-motion"
import {
    Film,
    ImageIcon,
    Music,
    Mic,
    Maximize2,
    BookOpen,
    Wand2,
    Play,
    Shirt,
    Settings,
    Sparkles,
    Loader2,
    Camera,
    Palette,
    Shapes
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================
// MOCKUP SIDEBAR V2 - Refined Sizing (Matching Mockup Proportions)
// ============================================================
// Now supports dynamic models passed from parent
// ============================================================

export interface SidebarModel {
    id: string
    name: string
    cost: number
    badge?: string
    badgeColor?: string
    // Allow mapping from page.tsx constants
    tag?: string
    isNew?: boolean
}

export interface StylePreset {
    id: string
    label: string
    thumbnail: string
    prompt: string
}

interface MockupSidebarProps {
    selectedMode: string
    onModeChange: (mode: string) => void
    activeTab: "text" | "image"
    onTabChange: (tab: "text" | "image") => void
    prompt: string
    onPromptChange: (value: string) => void
    onEnhance?: () => void
    isEnhancing?: boolean
    selectedModel: string
    onModelChange: (id: string) => void
    aspectRatio: string
    onAspectChange: (ratio: string) => void
    onGenerate: () => void
    isGenerating?: boolean
    className?: string

    // Dynamic Data
    models: SidebarModel[]
    stylePresets?: StylePreset[]
    onStyleSelect?: (promptInfo: string) => void

    // Batch (Image Mode)
    batchSize?: number
    onBatchSizeChange?: (size: number) => void
}

// Mode icons - 3x2 grid WITH TEXT LABELS (matching mockup)
const MODES = [
    { id: "video", icon: Film, label: "Video" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "audio", icon: Music, label: "Audio" },
    { id: "lipsync", icon: Mic, label: "Lip Sync" },
    { id: "upscale", icon: Maximize2, label: "Upscale" },
    { id: "story", icon: BookOpen, label: "Story" },
    { id: "tryon", icon: Shirt, label: "Try On" },
]

// Aspect ratio options
const ASPECTS = ["16:9", "9:16", "1:1", "4:3"]

export function MockupSidebar({
    selectedMode,
    onModeChange,
    activeTab,
    onTabChange,
    prompt,
    onPromptChange,
    onEnhance,
    isEnhancing = false,
    selectedModel,
    onModelChange,
    aspectRatio,
    onAspectChange,
    onGenerate,
    isGenerating = false,
    className,
    models = [],
    stylePresets = [],
    onStyleSelect,
    batchSize = 1,
    onBatchSizeChange
}: MockupSidebarProps) {
    return (
        <aside className={cn(
            "w-[220px] min-w-[220px]",
            "bg-[#0A0A0A] border-r border-white/10",
            "flex flex-col",
            "overflow-y-auto scrollbar-thin scrollbar-thumb-white/10",
            className
        )}>
            {/* ===== HEADER: Phở Video Studio ===== */}
            <div className="px-4 py-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🍜</span>
                </div>
                <span className="text-base font-semibold text-white">
                    Phở<span className="text-primary">Video</span> Studio
                </span>
            </div>

            {/* ===== MODE GRID ===== */}
            <div className="px-4 py-3 border-b border-white/5">
                <div className="grid grid-cols-3 gap-2">
                    {MODES.map((mode) => {
                        const Icon = mode.icon
                        const isActive = selectedMode === mode.id
                        return (
                            <motion.button
                                key={mode.id}
                                onClick={() => onModeChange(mode.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1",
                                    "w-full aspect-square rounded-xl",
                                    "transition-all duration-150",
                                    isActive
                                        ? "bg-primary/20 border-2 border-primary text-primary"
                                        : "bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{mode.label}</span>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* ===== MODE SPECIFIC CONTENT ===== */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">

                {/* --- VIDEO & IMAGE MODE --- */}
                {(selectedMode === "video" || selectedMode === "image") && (
                    <>
                        {/* INPUT TABS (Video Only) */}
                        {selectedMode === "video" && (
                            <div className="px-4 py-3 flex gap-4 border-b border-white/5">
                                <button
                                    onClick={() => onTabChange("text")}
                                    className={cn(
                                        "text-xs font-medium transition-colors pb-1",
                                        activeTab === "text"
                                            ? "text-white border-b-2 border-primary"
                                            : "text-white/40 hover:text-white/70"
                                    )}
                                >
                                    Text to Video
                                </button>
                                <button
                                    onClick={() => onTabChange("image")}
                                    className={cn(
                                        "text-xs font-medium transition-colors pb-1",
                                        activeTab === "image"
                                            ? "text-white border-b-2 border-primary"
                                            : "text-white/40 hover:text-white/70"
                                    )}
                                >
                                    Image to Video
                                </button>
                            </div>
                        )}

                        {/* STYLE PRESETS (Image Only) - Premium Visual Cards */}
                        {selectedMode === "image" && stylePresets && stylePresets.length > 0 && (
                            <div className="px-4 py-4 border-b border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-semibold text-white/80 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-[#F0421C]" />
                                        Style Presets
                                    </label>
                                    <span className="text-[10px] text-white/30">Tap to apply</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {stylePresets.map((preset) => {
                                        // Map preset IDs to icons and gradients
                                        const STYLE_ICONS: Record<string, { icon: React.ReactNode; gradient: string }> = {
                                            'cinematic': {
                                                icon: <Film className="w-5 h-5" />,
                                                gradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700'
                                            },
                                            'anime': {
                                                icon: <Sparkles className="w-5 h-5" />,
                                                gradient: 'bg-gradient-to-br from-pink-400 via-purple-500 to-violet-600'
                                            },
                                            'realistic': {
                                                icon: <Camera className="w-5 h-5" />,
                                                gradient: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-700'
                                            },
                                            'artistic': {
                                                icon: <Palette className="w-5 h-5" />,
                                                gradient: 'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600'
                                            },
                                            'abstract': {
                                                icon: <Shapes className="w-5 h-5" />,
                                                gradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600'
                                            },
                                        }
                                        const styleConfig = STYLE_ICONS[preset.id] || {
                                            icon: <Wand2 className="w-5 h-5" />,
                                            gradient: 'bg-gradient-to-br from-zinc-600 to-zinc-800'
                                        }

                                        return (
                                            <motion.button
                                                key={preset.id}
                                                onClick={() => onStyleSelect?.(preset.prompt)}
                                                whileHover={{ scale: 1.08, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="group relative flex flex-col items-center"
                                                title={preset.label}
                                            >
                                                <div className={cn(
                                                    "w-full aspect-square rounded-xl overflow-hidden",
                                                    "border-2 border-white/10 group-hover:border-[#F0421C]/70",
                                                    "transition-all duration-300",
                                                    "shadow-lg group-hover:shadow-[0_4px_20px_rgba(240,66,28,0.4)]",
                                                    styleConfig.gradient,
                                                    "flex items-center justify-center"
                                                )}>
                                                    {/* Icon */}
                                                    <span className="text-white/90 group-hover:text-white transition-colors group-hover:scale-110 transform duration-200">
                                                        {styleConfig.icon}
                                                    </span>
                                                </div>
                                                {/* Label Below */}
                                                <span className="text-[9px] text-white/50 text-center mt-1.5 group-hover:text-[#F0421C] transition-colors truncate w-full font-medium">
                                                    {preset.label}
                                                </span>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PROMPT AREA - Premium Glassmorphism */}
                        <div className="px-4 py-4">
                            <div className="relative group">
                                {/* Ambient Glow on Focus */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#F0421C]/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                                <textarea
                                    value={prompt}
                                    onChange={(e) => onPromptChange(e.target.value)}
                                    placeholder={selectedMode === "image" ? "✨ Describe your masterpiece..." : "🎬 Describe your vision..."}
                                    className={cn(
                                        "relative w-full h-24 px-4 py-3 pr-10",
                                        "bg-white/5 backdrop-blur-sm rounded-xl",
                                        "border border-white/10",
                                        "text-sm text-white placeholder:text-white/30",
                                        "resize-none outline-none",
                                        "focus:border-[#F0421C]/50 focus:bg-white/[0.07] focus:shadow-[0_0_30px_rgba(240,66,28,0.1)]",
                                        "transition-all duration-300"
                                    )}
                                />
                                {onEnhance && (
                                    <motion.button
                                        onClick={onEnhance}
                                        disabled={!prompt.trim() || isEnhancing}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "absolute top-3 right-3",
                                            "w-7 h-7 rounded-lg",
                                            "flex items-center justify-center",
                                            "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 hover:from-purple-500/50 hover:to-pink-500/50",
                                            "border border-purple-500/30",
                                            "disabled:opacity-40 transition-all duration-200",
                                            "shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                        )}
                                        title="Magic Enhance"
                                    >
                                        <Wand2 className={cn("w-4 h-4", isEnhancing && "animate-spin")} />
                                    </motion.button>
                                )}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-white/30">
                                <span className="flex items-center gap-1">
                                    <span className={cn(prompt.length > 200 ? "text-[#F0421C]" : "")}>{prompt.length}</span> / 500
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono">⌘</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono">↵</kbd>
                                    <span className="text-white/40">to generate</span>
                                </span>
                            </div>
                        </div>

                        {/* STYLE & QUALITY (Dynamic Models) */}
                        <div className="px-4 py-4">
                            <h3 className="text-xs font-semibold mb-4 flex items-center gap-2">
                                {selectedMode === "image" ? <ImageIcon className="w-3.5 h-3.5 text-[#F0421C]" /> : <Film className="w-3.5 h-3.5 text-[#F0421C]" />}
                                <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                                    {selectedMode === "image" ? "Model Architecture" : "Video Model"}
                                </span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {models.map((model, index) => {
                                    const isActive = selectedModel === model.id

                                    // Determine badge color if not explicit
                                    let badgeColor = model.badgeColor
                                    let badgeBg = "bg-white/10"

                                    if (!badgeColor && model.tag) {
                                        if (model.tag === "Pro") { badgeColor = "#3B82F6"; badgeBg = "bg-blue-500/20"; }
                                        else if (model.tag === "Popular") { badgeColor = "#F0421C"; badgeBg = "bg-[#F0421C]/20"; }
                                        else if (model.tag === "New") { badgeColor = "#10B981"; badgeBg = "bg-emerald-500/20"; }
                                        else if (model.tag === "Best") { badgeColor = "#8B5CF6"; badgeBg = "bg-purple-500/20"; }
                                        else { badgeColor = "#22D3EE"; badgeBg = "bg-cyan-500/20"; }
                                    }

                                    const badgeText = model.badge || (model.tag === "Pro" ? "PRO" : model.tag)

                                    return (
                                        <motion.button
                                            key={model.id}
                                            onClick={() => onModelChange(model.id)}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                                            whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.97 }}
                                            className={cn(
                                                "group relative flex flex-col justify-between p-3 h-[110px]",
                                                "rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                                                "border",
                                                isActive
                                                    ? "bg-[#F0421C]/5 border-[#F0421C] shadow-[0_0_20px_rgba(240,66,28,0.2)]"
                                                    : "bg-white/5 border-white/5 hover:border-[#F0421C]/50 hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                            )}
                                        >
                                            {/* Glowing gradient background for active state */}
                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#F0421C]/10 to-transparent opacity-50" />
                                            )}

                                            <div className="relative w-full flex justify-between items-start z-10">
                                                {/* Icon Box */}
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md transition-colors duration-300",
                                                    isActive ? "bg-[#F0421C] text-white shadow-[0_4px_12px_rgba(240,66,28,0.4)]" : "bg-white/10 text-white/50 group-hover:text-white group-hover:bg-white/20"
                                                )}>
                                                    <Sparkles className="w-4 h-4" />
                                                </div>

                                                {/* Badge */}
                                                {badgeText && (
                                                    <span
                                                        className={cn(
                                                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md",
                                                            badgeBg
                                                        )}
                                                        style={{ color: badgeColor }}
                                                    >
                                                        {badgeText}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Info */}
                                            <div className="relative z-10 flex flex-col items-start gap-1">
                                                <span className={cn(
                                                    "text-xs font-semibold leading-tight text-left transition-colors duration-200",
                                                    isActive ? "text-white" : "text-white/80 group-hover:text-white"
                                                )}>
                                                    {model.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 opacity-60">
                                                    <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">©</div>
                                                    <span className="text-[10px]">{model.cost}</span>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* ASPECT RATIO - Visual Selector */}
                        <div className="px-4 py-4">
                            <h3 className="text-xs font-semibold text-white/80 mb-3 flex items-center gap-2">
                                <Maximize2 className="w-3 h-3 text-[#F0421C]" />
                                Aspect Ratio
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {ASPECTS.map((ratio) => {
                                    const isActive = aspectRatio === ratio
                                    // Visual ratio representation
                                    const [w, h] = ratio.split(':').map(Number)
                                    const aspectStyle = w > h ? 'w-5 h-3' : w < h ? 'w-3 h-5' : 'w-4 h-4'
                                    return (
                                        <motion.button
                                            key={ratio}
                                            onClick={() => onAspectChange(ratio)}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl",
                                                "transition-all duration-300 border",
                                                isActive
                                                    ? "bg-[#F0421C]/10 border-[#F0421C] shadow-[0_0_15px_rgba(240,66,28,0.3)]"
                                                    : "bg-white/5 border-white/5 hover:border-[#F0421C]/40 hover:bg-white/10"
                                            )}
                                        >
                                            {/* Visual Ratio Box */}
                                            <div className={cn(
                                                "rounded-sm border-2",
                                                aspectStyle,
                                                isActive ? "border-[#F0421C] bg-[#F0421C]/20" : "border-white/30 bg-white/5"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-bold",
                                                isActive ? "text-[#F0421C]" : "text-white/50"
                                            )}>
                                                {ratio}
                                            </span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* BATCH SIZE (Image Only) - Premium Chips */}
                        {selectedMode === "image" && onBatchSizeChange && (
                            <div className="px-4 py-4 border-t border-white/5">
                                <h3 className="text-xs font-semibold text-white/80 mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3 text-[#F0421C]" />
                                        Batch Size
                                    </span>
                                    <span className="text-[#F0421C] font-mono">{batchSize}x</span>
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map(num => (
                                        <motion.button
                                            key={num}
                                            onClick={() => onBatchSizeChange(num)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border",
                                                batchSize === num
                                                    ? "bg-[#F0421C]/10 border-[#F0421C] text-[#F0421C] shadow-[0_0_12px_rgba(240,66,28,0.25)]"
                                                    : "bg-white/5 border-white/5 text-white/50 hover:text-white hover:border-white/20"
                                            )}
                                        >
                                            {num}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* --- AUDIO MODE --- */}
                {selectedMode === "audio" && (
                    <div className="px-4 py-3 space-y-4">
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <h3 className="text-xs font-semibold text-blue-400 mb-1">Sound Studio</h3>
                            <p className="text-[10px] text-blue-300/70">
                                Use the main panel to mix tracks, add lyrics, and visualize audio.
                            </p>
                        </div>
                    </div>
                )}
                {/* --- LIP SYNC MODE --- */}
                {selectedMode === "lipsync" && (
                    <div className="px-4 py-3 space-y-4">
                        <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                            <h3 className="text-xs font-semibold text-pink-400 mb-1">Lip Sync</h3>
                            <p className="text-[10px] text-pink-300/70">Sync audio to face video.</p>
                        </div>
                    </div>
                )}
                {/* --- UPSCALED MODE --- */}
                {selectedMode === "upscale" && (
                    <div className="px-4 py-3 space-y-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <h3 className="text-xs font-semibold text-emerald-400 mb-1">4K Upscaler</h3>
                            <p className="text-[10px] text-emerald-300/70">Enhance video quality to 4K resolution.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== GENERATE BUTTON - Premium Sticky Footer ===== */}
            <div className="px-4 py-5 mt-auto border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
                <motion.button
                    onClick={onGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "relative w-full py-3.5 rounded-2xl overflow-hidden",
                        "font-bold text-sm text-white",
                        "flex items-center justify-center gap-2.5",
                        "transition-all duration-300",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isGenerating
                            ? "bg-white/10"
                            : "bg-gradient-to-r from-[#F0421C] via-[#E53A15] to-[#D42C0A] shadow-[0_4px_30px_rgba(240,66,28,0.5)] hover:shadow-[0_6px_40px_rgba(240,66,28,0.7)]"
                    )}
                >
                    {/* Animated Glow Layer */}
                    {!isGenerating && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                    )}

                    <span className="relative z-10 flex items-center gap-2">
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                {selectedMode === "image" ? "✨ Generate Images" : "🎬 Generate Video"}
                                <Play className="w-4 h-4 fill-current" />
                            </>
                        )}
                    </span>
                </motion.button>
            </div>
        </aside>
    )
}
