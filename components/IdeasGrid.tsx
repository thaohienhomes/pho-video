
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import IdeaCard from './IdeaCard';
import { useTranslations } from 'next-intl';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { MobileVideoFeed } from './gallery/MobileVideoFeed';

interface Idea {
    id: string;
    title: string;
    thumbnail: string;
    videoUrl?: string;
    videoPreview?: string;
    prompt: string;
    modelId: string;
    aspectRatio: string;
    stylePreset: string;
    category: string;
    views?: number;
    likes?: number;
    cost?: number;
}

interface IdeasGridProps {
    initialIdeas: Idea[];
}

export function IdeasGrid({ initialIdeas }: IdeasGridProps) {
    const t = useTranslations('Ideas');
    const { isMobile, isClient } = useMobileDetect();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', ...Array.from(new Set(initialIdeas.map(item => item.category)))];

    const filteredIdeas = initialIdeas.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Mobile: Full-screen TikTok-style feed
    if (isClient && isMobile) {
        return <MobileVideoFeed ideas={filteredIdeas} />;
    }

    // Desktop: Original masonry grid with filters
    return (
        <div className="space-y-10">
            {/* Controls: Search & Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Category Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${activeCategory === category
                                ? 'bg-[#F0421C] border-[#F0421C] text-white shadow-[0_0_20px_rgba(240,66,28,0.4)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {t(`filters.${category.toLowerCase().replace('-', '')}`, { fallback: category })}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#F0421C] transition-colors" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F0421C]/50 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            {/* Masonry / Waterfall Layout */}
            <motion.div
                layout
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredIdeas.map((idea) => {
                        return (
                            <motion.div
                                key={idea.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="break-inside-avoid mb-6"
                            >
                                <IdeaCard idea={idea} />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredIdeas.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500">No ideas found in this category.</p>
                </div>
            )}
        </div>
    );
}
