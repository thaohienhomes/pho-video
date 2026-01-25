import React from 'react';
import { AbsoluteFill, useCurrentFrame, random } from 'remotion';

interface FilmGrainProps {
    intensity?: number;
    showVignette?: boolean;
    vignetteIntensity?: number;
    tint?: string;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({
    intensity = 0.05,
    showVignette = true,
    vignetteIntensity = 0.4,
    tint,
}) => {
    const frame = useCurrentFrame();

    // Generate noise pattern that changes each frame
    const noiseOpacity = intensity * (0.8 + random(`grain-${frame}`) * 0.4);

    return (
        <AbsoluteFill className="pointer-events-none" style={{ mixBlendMode: 'overlay' }}>
            {/* Film grain noise */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    opacity: noiseOpacity,
                    transform: `translate(${random(`tx-${frame}`) * 10}px, ${random(`ty-${frame}`) * 10}px)`,
                }}
            />

            {/* Vignette */}
            {showVignette && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
                    }}
                />
            )}

            {/* Color tint overlay */}
            {tint && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: tint,
                        opacity: 0.1,
                        mixBlendMode: 'color',
                    }}
                />
            )}

            {/* Subtle scanlines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.03) 2px,
                        rgba(0,0,0,0.03) 4px
                    )`,
                }}
            />

            {/* Occasional dust/scratch simulation */}
            {random(`scratch-${Math.floor(frame / 10)}`) > 0.9 && (
                <div
                    className="absolute bg-white/5"
                    style={{
                        left: `${random(`sx-${frame}`) * 100}%`,
                        top: 0,
                        width: 1,
                        height: '100%',
                        opacity: 0.3,
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
