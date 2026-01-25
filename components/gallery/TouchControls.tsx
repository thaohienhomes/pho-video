'use client';

import { motion } from 'framer-motion';
import { Wand2, Heart, Share2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { formatPhoPoints } from '@/lib/pho-points';

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

interface TouchControlsProps {
    idea: Idea;
    isMuted: boolean;
    isPlaying: boolean;
    onToggleMute: () => void;
    onTogglePlay: () => void;
    onLike?: () => void;
    onShare?: () => void;
}

export function TouchControls({
    idea,
    isMuted,
    isPlaying,
    onToggleMute,
    onTogglePlay,
    onLike,
    onShare,
}: TouchControlsProps) {
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        onLike?.();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: idea.title,
                    text: idea.prompt,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled share
            }
        }
        onShare?.();
    };

    return (
        <>
            {/* Right Edge Actions - Vertical Stack */}
            <div className="absolute right-4 bottom-[35%] flex flex-col items-center gap-5 z-40">
                {/* Like Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className="touch-target flex flex-col items-center gap-1"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${liked ? 'bg-[#F0421C] text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'
                        }`}>
                        <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-xs text-white/70">{idea.likes || 0}</span>
                </motion.button>

                {/* Share Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="touch-target flex flex-col items-center gap-1"
                >
                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-black/60 transition-all">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-white/70">Share</span>
                </motion.button>

                {/* Sound Toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggleMute}
                    className="touch-target"
                >
                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-black/60 transition-all">
                        {isMuted ? (
                            <VolumeX className="w-6 h-6" />
                        ) : (
                            <Volume2 className="w-6 h-6" />
                        )}
                    </div>
                </motion.button>
            </div>

            {/* Center Play/Pause Indicator */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: isPlaying ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    {isPlaying ? (
                        <Pause className="w-10 h-10 text-white" />
                    ) : (
                        <Play className="w-10 h-10 text-white ml-1" />
                    )}
                </div>
            </motion.div>

            {/* Bottom Thumb Zone - Info & Remix */}
            <div className="thumb-zone absolute bottom-0 left-0 right-0 z-40">
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-8 px-4">
                    {/* Model & Cost Tags */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/80 backdrop-blur-md">
                            {idea.modelId}
                        </span>
                        {idea.cost && (
                            <span className="text-xs bg-[#F0421C]/20 px-3 py-1 rounded-full text-[#F0421C] border border-[#F0421C]/20">
                                {formatPhoPoints(idea.cost)}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                        {idea.title}
                    </h3>

                    {/* Prompt Preview */}
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {idea.prompt}
                    </p>

                    {/* Remix Button - Primary CTA in Thumb Zone */}
                    <Link
                        href={`/studio?prompt=${encodeURIComponent(idea.prompt)}&model=${idea.modelId}&style=${idea.stylePreset}`}
                        className="w-full"
                    >
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full btn-vermilion py-3.5 px-6 rounded-full flex items-center justify-center gap-2 text-base font-semibold touch-target"
                        >
                            <Wand2 className="w-5 h-5" />
                            Remix This
                        </motion.button>
                    </Link>
                </div>
            </div>
        </>
    );
}
