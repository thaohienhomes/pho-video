
'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, Wand2, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
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

interface IdeaCardProps {
    idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <motion.div
            className="group relative break-inside-avoid mb-6 rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsMuted(true); }}
        >
            {/* 1. Base Image (Always Visible) */}
            <div className="relative w-full overflow-hidden bg-black/50">
                {/* Use thumbnail if available, otherwise show video as poster */}
                {idea.thumbnail ? (
                    <img
                        src={idea.thumbnail}
                        alt={idea.title}
                        className="w-full h-auto object-cover transition-opacity duration-300"
                        loading="lazy"
                    />
                ) : idea.videoUrl ? (
                    <video
                        src={idea.videoUrl}
                        className="w-full h-auto object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        poster=""
                    />
                ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white/20" />
                    </div>
                )}

                {/* 2. Video Overlay (Only if videoPreview exists) */}
                {idea.videoPreview && isHovered && (
                    <video
                        ref={videoRef}
                        src={idea.videoPreview}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        onLoadedData={() => setVideoLoaded(true)}
                    />
                )}

                {/* Sound Toggle Button */}
                {idea.videoPreview && isHovered && videoLoaded && (
                    <button
                        onClick={toggleMute}
                        className="absolute bottom-3 right-3 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-vermilion transition-colors"
                        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                        {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </button>
                )}

                {/* Play Icon Indicator (Hidden when video is playing) */}
                {idea.videoPreview && !videoLoaded && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                            <Play className="h-3 w-3 fill-current" />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Text Overlay (Gradient) - Using absolute positioning as requested in snippet, or stick to previous content area? 
               User snippet had: "absolute inset-x-0 bottom-0 ... p-4 translate-y-2 group-hover:translate-y-0"
               But the original design had a separate content area below.
               I will blend both: Keep the clean Masonry look (Image on top, text below) OR overlay text?
               The user said "Pinterest-style gallery". Usually that means image + text below.
               BUT the user's snippet for IdeaCard has text overlay: "absolute inset-x-0 bottom-0 bg-gradient-to-t...".
               I will follow the User's Snippet for the card internals strictly to ensure satisfaction.
            */}

            {/* Text Overlay (Gradient) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-30">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">{idea.title}</h3>
                </div>

                <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/80 backdrop-blur-md">
                        {idea.modelId}
                    </span>
                    {idea.cost && (
                        <span className="text-[10px] bg-[#F0421C]/20 px-2 py-0.5 rounded-full text-[#F0421C] border border-[#F0421C]/20">
                            {formatPhoPoints(idea.cost)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 pt-2 border-t border-white/10">
                    <Link
                        href={`/studio?prompt=${encodeURIComponent(idea.prompt)}&model=${idea.modelId}&style=${idea.stylePreset}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#F0421C] hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Wand2 className="h-3 w-3" />
                        Remix This
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
