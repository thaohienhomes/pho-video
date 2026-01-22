"use client"

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { STYLE_PRESETS, StyleCategory, StylePreset } from '@/constants/styles'
import { cn } from '@/lib/utils'
import { Check, Sparkles, Film, Palette, Zap, Ghost, Eye } from 'lucide-react'

interface StyleSelectorProps {
    selectedStyleId: string;
    onStyleSelectAction: (style: StylePreset) => void;
}

const CATEGORY_ICONS = {
    all: <Sparkles className="w-4 h-4" />,
    cinematic: <Film className="w-4 h-4" />,
    animation: <Zap className="w-4 h-4" />,
    art: <Palette className="w-4 h-4" />,
    mood: <Ghost className="w-4 h-4" />
}

export function StyleSelector({ selectedStyleId, onStyleSelectAction }: StyleSelectorProps) {
    const t = useTranslations('styles')
    const [selectedCategory, setSelectedCategory] = useState<StyleCategory>('all')

    const filteredStyles = selectedCategory === 'all'
        ? STYLE_PRESETS
        : STYLE_PRESETS.filter(s => s.category === selectedCategory)

    const categories: StyleCategory[] = ['all', 'cinematic', 'animation', 'art', 'mood']

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        {t('title')}
                    </h3>
                    <p className="text-xs text-white/50">{t('subtitle')}</p>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                            selectedCategory === cat
                                ? "bg-primary/20 border-primary text-primary shadow-sm shadow-primary/20"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        {CATEGORY_ICONS[cat]}
                        {t(cat)}
                    </button>
                ))}
            </div>

            {/* Styles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredStyles.map((style) => {
                    const isActive = selectedStyleId === style.id;
                    return (
                        <button
                            key={style.id}
                            onClick={() => onStyleSelectAction(style)}
                            className={cn(
                                "relative group flex flex-col gap-2 p-2 rounded-xl border transition-all text-left",
                                isActive
                                    ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            {/* Visual Placeholder (Will replace with thumbnails later) */}
                            <div className={cn(
                                "aspect-video w-full rounded-lg overflow-hidden flex items-center justify-center relative",
                                isActive ? "bg-primary/20" : "bg-white/5"
                            )}>
                                {isActive && <div className="absolute top-2 right-2 p-1 bg-primary rounded-full shadow-lg z-10">
                                    <Check className="w-3 h-3 text-white" />
                                </div>}

                                {style.id === 'none' ? (
                                    <Eye className="w-6 h-6 text-white/20" />
                                ) : (
                                    <Sparkles className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-125 duration-300",
                                        isActive ? "text-primary/70" : "text-white/20"
                                    )} />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="px-1">
                                <p className={cn(
                                    "text-xs font-medium truncate",
                                    isActive ? "text-primary" : "text-white/80"
                                )}>
                                    {t(style.labelKey)}
                                </p>
                                <p className="text-[10px] text-white/40 truncate">
                                    {t(style.descriptionKey)}
                                </p>
                            </div>

                            {/* Active Glow Effect */}
                            {isActive && (
                                <div className="absolute -inset-0.5 bg-primary/20 blur-md -z-10 rounded-xl animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
