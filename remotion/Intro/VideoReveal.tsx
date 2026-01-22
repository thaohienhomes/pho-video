import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from 'remotion';
import { Video } from '@remotion/media';

export const VideoReveal: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Start reveal at frame 150 (5 seconds)
    const revealStart = 150;

    const revealProgress = spring({
        frame: frame - revealStart,
        fps,
        config: { damping: 20 },
    });

    const opacity = interpolate(frame, [revealStart, revealStart + 10], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    if (frame < revealStart) return null;

    return (
        <AbsoluteFill style={{ opacity }}>
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    transform: `scale(${interpolate(revealProgress, [0, 1], [0.5, 1])})`,
                    borderRadius: interpolate(revealProgress, [0, 1], [40, 0]),
                }}
            >
                <Video
                    src={staticFile('remotion/sample-video.mp4')}
                    style={{ width, height, objectFit: 'cover' }}
                />

                {/* Overlay Gradient to keep professional look */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

                <div
                    className="absolute bottom-20 left-20 border-l-4 border-primary pl-6"
                    style={{
                        transform: `translateX(${interpolate(revealProgress, [0, 1], [-100, 0])}px)`,
                        opacity: revealProgress,
                    }}
                >
                    <h2 className="text-6xl font-bold text-white mb-2 uppercase tracking-tighter">Result Generated</h2>
                    <p className="text-xl text-white/60 font-mono">Model: Kling-AI-v1.5-Pro | Seed: 1337420</p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
