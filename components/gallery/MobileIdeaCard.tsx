'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TouchControls } from './TouchControls';

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

interface MobileIdeaCardProps {
    idea: Idea;
    isActive: boolean;
}

export function MobileIdeaCard({ idea, isActive }: MobileIdeaCardProps) {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPoster, setShowPoster] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Auto-play when card becomes active
    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(() => {
                    // Autoplay blocked, show poster
                    setShowPoster(true);
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                setIsPlaying(false);
                setShowPoster(true);
                setVideoLoaded(false);
            }
        }
    }, [isActive]);

    const handleToggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        // Only toggle play if click is in center area (not on controls)
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Check if click is within center 60% area
        const isCenter =
            Math.abs(clickX - centerX) < rect.width * 0.3 &&
            Math.abs(clickY - centerY) < rect.height * 0.25;

        if (isCenter) {
            handleTogglePlay();
        }
    };

    const videoSrc = idea.videoPreview || idea.videoUrl;

    return (
        <div
            className="mobile-feed-item relative w-full bg-black"
            onClick={handleVideoClick}
        >
            {/* Poster Image (Thumbnail) - Shows first for performance */}
            {showPoster && idea.thumbnail && (
                <motion.div
                    className="absolute inset-0 z-10"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: videoLoaded ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img
                        src={idea.thumbnail}
                        alt={idea.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    {/* Blurhash-like overlay while loading */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                </motion.div>
            )}

            {/* Video Player */}
            {videoSrc && (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted={isMuted}
                    loop
                    playsInline
                    preload={isActive ? "auto" : "none"}
                    onLoadedData={() => {
                        setVideoLoaded(true);
                        setShowPoster(false);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            )}

            {/* Fallback for items without video */}
            {!videoSrc && idea.thumbnail && (
                <img
                    src={idea.thumbnail}
                    alt={idea.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Touch Controls Overlay */}
            <TouchControls
                idea={idea}
                isMuted={isMuted}
                isPlaying={isPlaying}
                onToggleMute={handleToggleMute}
                onTogglePlay={handleTogglePlay}
            />

            {/* Gradient overlays for better text readability */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
            </div>
        </div>
    );
}
