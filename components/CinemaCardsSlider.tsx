'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Sparkles, FastForward, Music, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoItem {
    id: string;
    thumbnailUrl: string;
    videoUrl?: string;
    title?: string;
    prompt?: string;
    duration?: number;
    createdAt?: Date;
}

interface CinemaCardsSliderProps {
    videos: VideoItem[];
    activeIndex?: number;
    onCardSelect?: (index: number) => void;
    onDownload?: (video: VideoItem) => void;
    onShare?: (video: VideoItem) => void;
    onUpscale?: (video: VideoItem) => void;
    onExtend?: (video: VideoItem) => void;
    onAddSound?: (video: VideoItem) => void;
    className?: string;
}

export function CinemaCardsSlider({
    videos,
    activeIndex = 0,
    onCardSelect,
    onDownload,
    onShare,
    onUpscale,
    onExtend,
    onAddSound,
    className,
}: CinemaCardsSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(activeIndex);

    useEffect(() => {
        setCurrentIndex(activeIndex);
    }, [activeIndex]);

    const handleCardClick = useCallback((index: number) => {
        setCurrentIndex(index);
        onCardSelect?.(index);
    }, [onCardSelect]);

    const handlePrev = useCallback(() => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
        setCurrentIndex(newIndex);
        onCardSelect?.(newIndex);
    }, [currentIndex, videos.length, onCardSelect]);

    const handleNext = useCallback(() => {
        const newIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        onCardSelect?.(newIndex);
    }, [currentIndex, videos.length, onCardSelect]);

    const currentVideo = videos[currentIndex];

    if (videos.length === 0) {
        return (
            <div className={cn('flex items-center justify-center h-[500px]', className)}>
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white/20" />
                    </div>
                    <p className="text-white/40 text-lg">Chưa có video nào được tạo</p>
                    <p className="text-white/20 text-sm mt-1">Tạo video đầu tiên của bạn!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative flex flex-col items-center py-6', className)}>
            {/* Background Radial Glow - Stronger */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(240, 66, 28, 0.15) 0%, rgba(255, 158, 90, 0.08) 40%, transparent 70%)',
                }}
            />

            {/* Cards Container - Much larger */}
            <div
                className="relative flex items-center justify-center w-full"
                style={{
                    height: '520px',
                    perspective: '1500px',
                    perspectiveOrigin: '50% 50%',
                }}
            >
                {/* Navigation Arrow - Left */}
                <motion.button
                    onClick={handlePrev}
                    className="absolute left-8 z-30 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-primary/50 transition-all shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronLeft className="w-8 h-8" />
                </motion.button>

                {/* Navigation Arrow - Right */}
                <motion.button
                    onClick={handleNext}
                    className="absolute right-8 z-30 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-primary/50 transition-all shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ChevronRight className="w-8 h-8" />
                </motion.button>

                {/* Cards */}
                <AnimatePresence mode="popLayout">
                    {videos.map((video, index) => {
                        const diff = index - currentIndex;
                        const absDiff = Math.abs(diff);

                        // Only render cards within visible range
                        if (absDiff > 2) return null;

                        // Calculate transforms based on position
                        const isCenter = diff === 0;
                        const isLeft = diff < 0;

                        // Card dimensions - MUCH LARGER
                        const cardWidth = isCenter ? 340 : 260;
                        const cardHeight = isCenter ? 480 : 400;

                        // X offset from center
                        const xOffset = isCenter
                            ? 0
                            : (diff * 280) + (isLeft ? -40 : 40);

                        // Z offset for depth
                        const zOffset = isCenter ? 0 : -150 - (absDiff * 50);

                        // Rotation for perspective
                        const rotateY = isCenter ? 0 : (isLeft ? 25 : -25);

                        // Opacity
                        const opacity = isCenter ? 1 : absDiff === 1 ? 0.7 : 0.4;

                        // Scale
                        const scale = isCenter ? 1 : absDiff === 1 ? 0.85 : 0.7;

                        return (
                            <motion.div
                                key={video.id}
                                className="absolute cursor-pointer"
                                style={{
                                    zIndex: 10 - absDiff,
                                    width: cardWidth,
                                    height: cardHeight,
                                    transformStyle: 'preserve-3d',
                                }}
                                initial={{
                                    opacity: 0,
                                    x: diff * 300,
                                    rotateY: rotateY,
                                    z: zOffset,
                                }}
                                animate={{
                                    opacity,
                                    x: xOffset,
                                    rotateY,
                                    z: zOffset,
                                    scale,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.32, 0.72, 0, 1],
                                }}
                                onClick={() => handleCardClick(index)}
                                whileHover={!isCenter ? {
                                    scale: scale + 0.05,
                                    opacity: opacity + 0.2,
                                    transition: { duration: 0.2 }
                                } : {}}
                            >
                                {/* Card Container with Glow */}
                                <div
                                    className={cn(
                                        "relative w-full h-full overflow-hidden rounded-3xl transition-shadow duration-500",
                                        isCenter && "ring-2 ring-primary/60 shadow-[0_0_60px_rgba(240,66,28,0.4),0_20px_60px_rgba(0,0,0,0.6)]",
                                        !isCenter && "shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                                    )}
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)',
                                    }}
                                >
                                    {/* Thumbnail Image */}
                                    {video.thumbnailUrl && !video.thumbnailUrl.includes('placeholder') ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title || 'Video thumbnail'}
                                            className="w-full h-full object-cover"
                                            style={{ filter: isCenter ? 'none' : 'brightness(0.8)' }}
                                        />
                                    ) : (
                                        // Fallback gradient poster
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, 
                                                    hsl(${(index * 40) % 360}, 60%, 20%) 0%, 
                                                    hsl(${(index * 40 + 30) % 360}, 50%, 10%) 100%)`,
                                            }}
                                        >
                                            <Play className="w-16 h-16 text-white/30" />
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: isCenter
                                                ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 60%)'
                                                : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                                        }}
                                    />

                                    {/* Center Card Content */}
                                    {isCenter && (
                                        <motion.div
                                            className="absolute inset-x-0 bottom-0 p-6"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            {/* Title */}
                                            <h3 className="text-white font-bold text-xl mb-2 line-clamp-1 drop-shadow-lg">
                                                {video.title || 'Untitled Video'}
                                            </h3>

                                            {/* Metadata Row */}
                                            <div className="flex items-center gap-3 text-white/60 text-sm mb-4">
                                                {video.duration && (
                                                    <span>{video.duration}s</span>
                                                )}
                                                <span>•</span>
                                                <span>AI Generated</span>
                                            </div>

                                            {/* Watch Now Button */}
                                            <motion.button
                                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (video.videoUrl) {
                                                        window.open(video.videoUrl, '_blank');
                                                    }
                                                }}
                                            >
                                                <Play className="w-4 h-4" fill="currentColor" />
                                                Watch Now
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {/* Side Card Title */}
                                    {!isCenter && video.title && (
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <p className="text-white/80 font-semibold text-sm line-clamp-2 drop-shadow-lg">
                                                {video.title}
                                            </p>
                                        </div>
                                    )}

                                    {/* Glow Border Effect for Center */}
                                    {isCenter && (
                                        <div
                                            className="absolute inset-0 rounded-3xl pointer-events-none"
                                            style={{
                                                boxShadow: 'inset 0 0 0 2px rgba(240,66,28,0.5)',
                                            }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Dock - Glass Effect */}
            {currentVideo && (
                <motion.div
                    className="mt-6 flex items-center gap-1 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <ActionButton
                        icon={<Download className="w-5 h-5" />}
                        label="Download"
                        onClick={() => onDownload?.(currentVideo)}
                        variant="primary"
                    />
                    <ActionButton
                        icon={<Share2 className="w-5 h-5" />}
                        label="Share"
                        onClick={() => onShare?.(currentVideo)}
                    />
                    <ActionButton
                        icon={<Sparkles className="w-5 h-5" />}
                        label="Phở 4K"
                        onClick={() => onUpscale?.(currentVideo)}
                        variant="accent"
                    />
                    <ActionButton
                        icon={<FastForward className="w-5 h-5" />}
                        label="Extend"
                        onClick={() => onExtend?.(currentVideo)}
                    />
                    <ActionButton
                        icon={<Music className="w-5 h-5" />}
                        label="Sound"
                        onClick={() => onAddSound?.(currentVideo)}
                    />
                </motion.div>
            )}
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'accent';
}

function ActionButton({ icon, label, onClick, variant = 'default' }: ActionButtonProps) {
    const variantStyles = {
        default: 'text-white/70 hover:text-white hover:bg-white/10',
        primary: 'bg-gradient-to-r from-primary to-orange-500 text-white hover:brightness-110 shadow-lg shadow-primary/20',
        accent: 'text-orange-300 border border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50',
    };

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-sm font-medium',
                variantStyles[variant]
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </motion.button>
    );
}

export default CinemaCardsSlider;
