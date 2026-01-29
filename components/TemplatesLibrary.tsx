"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Play,
    Sparkles,
    Clock,
    Coins,
    Search,
    Star,
    TrendingUp,
    Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    TEMPLATES,
    TEMPLATE_CATEGORIES,
    Template,
    TemplateCategory,
    getFeaturedTemplates,
    getPopularTemplates,
} from "@/data/templates"

interface TemplatesLibraryProps {
    onSelectTemplate?: (template: Template) => void
    className?: string
    compact?: boolean
}

export function TemplatesLibrary({
    onSelectTemplate,
    className,
    compact = false,
}: TemplatesLibraryProps) {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all" | "featured">("featured")
    const [searchQuery, setSearchQuery] = useState("")
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let templates = TEMPLATES

        // Filter by category
        if (activeCategory === "featured") {
            templates = getFeaturedTemplates()
        } else if (activeCategory !== "all") {
            templates = templates.filter(t => t.category === activeCategory)
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            templates = templates.filter(
                t =>
                    t.title.toLowerCase().includes(query) ||
                    t.prompt.toLowerCase().includes(query) ||
                    t.tags.some(tag => tag.toLowerCase().includes(query))
            )
        }

        return templates
    }, [activeCategory, searchQuery])

    return (
        <div className={cn("w-full", className)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory("featured")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                            activeCategory === "featured"
                                ? "bg-primary text-white"
                                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Star className="w-4 h-4" />
                        Featured
                    </button>
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                            activeCategory === "all"
                                ? "bg-primary text-white"
                                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                        )}
                    >
                        All
                    </button>
                    {TEMPLATE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                                activeCategory === cat.id
                                    ? "bg-primary text-white"
                                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                {!compact && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 bg-white/5 border-white/10"
                        />
                    </div>
                )}
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="py-12 text-center">
                    <Sparkles className="w-10 h-10 mx-auto text-white/20 mb-3" />
                    <p className="text-white/50">No templates found</p>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-4",
                    compact
                        ? "grid-cols-2 md:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                    <AnimatePresence>
                        {filteredTemplates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <TemplateCard
                                    template={template}
                                    isHovered={hoveredId === template.id}
                                    onHover={() => setHoveredId(template.id)}
                                    onLeave={() => setHoveredId(null)}
                                    onSelect={() => onSelectTemplate?.(template)}
                                    compact={compact}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

// Template Card Component
function TemplateCard({
    template,
    isHovered,
    onHover,
    onLeave,
    onSelect,
    compact,
}: {
    template: Template
    isHovered: boolean
    onHover: () => void
    onLeave: () => void
    onSelect: () => void
    compact?: boolean
}) {
    const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category)

    return (
        <div
            className={cn(
                "group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all cursor-pointer",
                isHovered && "ring-2 ring-primary/50"
            )}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onSelect}
        >
            {/* Thumbnail */}
            <div className={cn(
                "relative bg-gradient-to-br from-primary/20 to-orange-500/20",
                compact ? "aspect-video" : "aspect-[4/3]"
            )}>
                {template.thumbnail ? (
                    <img
                        src={template.thumbnail}
                        alt={template.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">{category?.icon || "🎬"}</span>
                    </div>
                )}

                {/* Featured Badge */}
                {template.featured && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-xs font-medium text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                    </div>
                )}

                {/* Hover Overlay */}
                <motion.div
                    initial={false}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Use Template
                    </Button>
                </motion.div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.duration}
                </div>
            </div>

            {/* Content */}
            <div className={cn("p-3", compact && "p-2")}>
                <h4 className={cn(
                    "font-medium text-white group-hover:text-primary transition-colors line-clamp-1",
                    compact ? "text-sm" : "text-base"
                )}>
                    {template.title}
                </h4>

                {!compact && (
                    <p className="text-xs text-white/50 line-clamp-2 mt-1">
                        {template.prompt}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/40">
                        <span>{category?.icon}</span>
                        <span>{category?.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                        <Coins className="w-3 h-3" />
                        {template.creditCost}
                    </div>
                </div>
            </div>
        </div>
    )
}
