'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MobileIdeaCard } from './MobileIdeaCard';

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

interface MobileVideoFeedProps {
    ideas: Idea[];
}

export function MobileVideoFeed({ ideas }: MobileVideoFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Only render 3 items at a time (prev, current, next) for performance
    const visibleRange = {
        start: Math.max(0, currentIndex - 1),
        end: Math.min(ideas.length - 1, currentIndex + 1),
    };

    const visibleIdeas = ideas.slice(visibleRange.start, visibleRange.end + 1);

    // Handle scroll snap
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const itemHeight = container.clientHeight;
        const newIndex = Math.round(scrollTop / itemHeight);

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < ideas.length) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, ideas.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Scroll to specific index
    const scrollToIndex = (index: number) => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const itemHeight = container.clientHeight;
        container.scrollTo({
            top: index * itemHeight,
            behavior: 'smooth',
        });
    };

    const goNext = () => {
        if (currentIndex < ideas.length - 1) {
            scrollToIndex(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            scrollToIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Scroll Snap Container */}
            <div
                ref={containerRef}
                className="mobile-feed-container h-[100dvh] overflow-y-scroll snap-y snap-mandatory"
                style={{ scrollSnapType: 'y mandatory' }}
            >
                {ideas.map((idea, index) => (
                    <div
                        key={idea.id}
                        className="mobile-feed-item h-[100dvh] snap-start snap-always"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <MobileIdeaCard
                            idea={idea}
                            isActive={index === currentIndex}
                        />
                    </div>
                ))}
            </div>

            {/* Progress Indicator */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                    <span className="text-white/80 text-xs font-medium">
                        {currentIndex + 1} / {ideas.length}
                    </span>
                </div>
            </div>

            {/* Navigation Hints (visible briefly) */}
            <AnimatePresence>
                {currentIndex === 0 && (
                    <motion.div
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        <div className="flex flex-col items-center text-white/50">
                            <ChevronUp className="w-6 h-6 animate-bounce" />
                            <span className="text-xs">Swipe to explore</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mini navigation dots (right side) */}
            <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1">
                {ideas.slice(0, 10).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex
                                ? 'bg-[#F0421C] h-4'
                                : 'bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
                {ideas.length > 10 && (
                    <span className="text-white/30 text-[8px] text-center">
                        +{ideas.length - 10}
                    </span>
                )}
            </div>
        </div>
    );
}
