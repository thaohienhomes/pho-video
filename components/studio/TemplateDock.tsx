"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Flame, ChevronDown, Sparkles, ExternalLink,
    User, Mountain, Palette, Wand2, Rocket, Hexagon, Grid3X3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IMAGE_TEMPLATES, TEMPLATE_CATEGORIES, type ImageTemplate, type TemplateCategory } from "@/data/image-templates"

interface TemplateDockProps {
    onSelectTemplate: (template: ImageTemplate) => void
    className?: string
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
    all: Grid3X3,
    portrait: User,
    landscape: Mountain,
    anime: Sparkles,
    fantasy: Wand2,
    scifi: Rocket,
    abstract: Hexagon,
}

export function TemplateDock({ onSelectTemplate, className }: TemplateDockProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Filter templates by category
    const filteredTemplates = activeCategory === 'all'
        ? IMAGE_TEMPLATES
        : IMAGE_TEMPLATES.filter(t => t.category === activeCategory)

    // Sort: trending first
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1
        if (!a.isTrending && b.isTrending) return 1
        return b.usageCount - a.usageCount
    })

    return (
        <motion.div
            className={cn(
                "w-full border-t border-white/[0.06] relative overflow-hidden",
                "bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-2xl",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* Ambient Glow Orbs */}
            <div className="absolute top-0 left-1/4 w-64 h-32 bg-[#F0421C]/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-48 h-24 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Header - Collapsible Toggle */}
            <motion.div
                className="flex items-center justify-between px-6 py-4 cursor-pointer group relative z-10"
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
                <div className="flex items-center gap-4">
                    {/* Animated Fire Icon */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <Flame className="w-5 h-5 text-[#F0421C]" />
                        <div className="absolute inset-0 bg-[#F0421C]/30 blur-md rounded-full" />
                    </motion.div>

                    <div className="flex flex-col">
                        <span className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            Templates & Trending
                        </span>
                        <span className="text-[10px] text-white/40">
                            {filteredTemplates.length} creative prompts
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs text-[#F0421C] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0421C]/10 border border-[#F0421C]/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        See All <ExternalLink className="w-3 h-3" />
                    </motion.button>
                    <motion.div
                        animate={{ rotate: isExpanded ? 0 : 180 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Category Tabs + Grid */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        {/* Category Pills with Icons */}
                        <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-none">
                            {TEMPLATE_CATEGORIES.map((cat, idx) => {
                                const Icon = CATEGORY_ICONS[cat.id] || Grid3X3
                                const isActive = activeCategory === cat.id
                                return (
                                    <motion.button
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setActiveCategory(cat.id)}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2",
                                            isActive
                                                ? "bg-gradient-to-r from-[#F0421C] to-[#E53A15] text-white shadow-[0_4px_20px_rgba(240,66,28,0.4)]"
                                                : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                                        )}
                                    >
                                        <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-white/50")} />
                                        {cat.label}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Multi-Row Grid */}
                        <div className="px-6 pb-6 max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <motion.div
                                className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
                                layout
                            >
                                {sortedTemplates.map((template, index) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02, duration: 0.3 }}
                                        layout
                                        className="group relative cursor-pointer"
                                        onMouseEnter={() => setHoveredId(template.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => onSelectTemplate(template)}
                                    >
                                        {/* Card Container */}
                                        <motion.div
                                            whileHover={{ scale: 1.08, y: -6 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative aspect-[3/4] rounded-2xl overflow-hidden",
                                                "border-2 transition-all duration-300",
                                                hoveredId === template.id
                                                    ? "border-[#F0421C] shadow-[0_0_30px_rgba(240,66,28,0.3)]"
                                                    : "border-white/[0.06] hover:border-white/20",
                                                "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                                                "shadow-xl hover:shadow-2xl"
                                            )}
                                        >
                                            {/* Shimmer Effect Background */}
                                            <div className="absolute inset-0 overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                                                    animate={hoveredId === template.id ? { x: ['100%', '-100%'] } : {}}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                                                />
                                            </div>

                                            {/* Category Gradient Background - VIBRANT */}
                                            <div className={cn(
                                                "absolute inset-0",
                                                template.category === 'portrait' && "bg-gradient-to-br from-pink-400 via-purple-500 to-violet-700",
                                                template.category === 'landscape' && "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600",
                                                template.category === 'anime' && "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
                                                template.category === 'fantasy' && "bg-gradient-to-br from-violet-400 via-fuchsia-500 to-pink-600",
                                                template.category === 'scifi' && "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-700",
                                                template.category === 'abstract' && "bg-gradient-to-br from-rose-400 via-orange-500 to-amber-500",
                                            )}>
                                                {/* Noise texture for depth */}
                                                <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                                                    style={{
                                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                                                    }}
                                                />
                                            </div>

                                            {/* Bottom Gradient - Softer */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Trending Badge with Pulse */}
                                            {template.isTrending && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2.5 right-2.5"
                                                >
                                                    <div className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-[#F0421C] to-[#FF6B4A] flex items-center gap-1 shadow-lg">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        >
                                                            <Flame className="w-2.5 h-2.5 text-white" />
                                                        </motion.div>
                                                        <span className="text-[8px] font-bold text-white tracking-wide">HOT</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Bottom Info */}
                                            <div className="absolute bottom-0 inset-x-0 p-3">
                                                <p className="text-[11px] font-bold text-white truncate leading-tight drop-shadow-lg">
                                                    {template.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                                                        <Flame className="w-2.5 h-2.5 text-[#F0421C]" />
                                                        <span className="text-[9px] text-white/70 font-medium">
                                                            {(template.usageCount / 1000).toFixed(1)}k
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-white/40 capitalize">
                                                        {template.category}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hover: Use Template Button */}
                                            <AnimatePresence>
                                                {hoveredId === template.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-2"
                                                    >
                                                        <motion.button
                                                            initial={{ scale: 0.7, y: 10 }}
                                                            animate={{ scale: 1, y: 0 }}
                                                            exit={{ scale: 0.7, y: 10 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                            className={cn(
                                                                "px-4 py-2 rounded-xl",
                                                                "bg-gradient-to-r from-[#F0421C] via-[#FF5A3D] to-[#E53A15]",
                                                                "text-white text-xs font-bold",
                                                                "shadow-[0_8px_30px_rgba(240,66,28,0.6)]",
                                                                "flex items-center gap-2",
                                                                "border border-white/20"
                                                            )}
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            Use Template
                                                        </motion.button>
                                                        <span className="text-[9px] text-white/50 max-w-[80%] text-center line-clamp-2">
                                                            {template.prompt.slice(0, 50)}...
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

