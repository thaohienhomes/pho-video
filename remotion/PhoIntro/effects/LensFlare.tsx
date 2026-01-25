import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface LensFlareProps {
    x?: number; // percentage 0-100
    y?: number; // percentage 0-100
    intensity?: number;
    color?: string;
    delay?: number;
    showStreak?: boolean;
}

export const LensFlare: React.FC<LensFlareProps> = ({
    x = 50,
    y = 50,
    intensity = 1,
    color = '#F0421C',
    delay = 0,
    showStreak = true,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const adjustedFrame = Math.max(0, frame - delay);

    // Flare entrance
    const flareProgress = spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const flareScale = interpolate(flareProgress, [0, 1], [0, 1]);
    const flareOpacity = interpolate(flareProgress, [0, 0.5, 1], [0, 1, 0.8]);

    // Pulsing effect
    const pulse = interpolate(
        Math.sin(adjustedFrame * 0.15),
        [-1, 1],
        [0.8, 1.2]
    );

    // Core glow size
    const coreSize = 60 * intensity * flareScale * pulse;
    const outerSize = 150 * intensity * flareScale;

    // Hexagonal artifacts positions (typical lens flare pattern)
    const artifacts = [
        { offset: 0.3, size: 20, opacity: 0.3 },
        { offset: 0.5, size: 35, opacity: 0.2 },
        { offset: 0.7, size: 15, opacity: 0.4 },
        { offset: 1.2, size: 25, opacity: 0.15 },
        { offset: 1.5, size: 40, opacity: 0.1 },
    ];

    // Direction to center for artifacts
    const centerX = 50;
    const centerY = 50;
    const dirX = centerX - x;
    const dirY = centerY - y;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Anamorphic horizontal streak */}
            {showStreak && (
                <div
                    className="absolute"
                    style={{
                        left: 0,
                        top: `${y}%`,
                        width: '100%',
                        height: 4,
                        background: `linear-gradient(90deg, transparent 0%, ${color}00 20%, ${color}80 50%, ${color}00 80%, transparent 100%)`,
                        opacity: flareOpacity * 0.6 * intensity,
                        filter: 'blur(2px)',
                        transform: `scaleX(${flareScale})`,
                    }}
                />
            )}

            {/* Core glow */}
            <div
                className="absolute rounded-full"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: coreSize,
                    height: coreSize,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, white 0%, ${color} 30%, transparent 70%)`,
                    opacity: flareOpacity * intensity,
                    boxShadow: `0 0 ${coreSize}px ${color}, 0 0 ${coreSize * 2}px ${color}`,
                }}
            />

            {/* Outer bloom */}
            <div
                className="absolute rounded-full"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: outerSize,
                    height: outerSize,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${color}40 0%, ${color}10 40%, transparent 70%)`,
                    opacity: flareOpacity * 0.5 * intensity,
                    filter: 'blur(10px)',
                }}
            />

            {/* Hexagonal artifacts */}
            {artifacts.map((artifact, i) => {
                const artifactX = x + dirX * artifact.offset * flareScale;
                const artifactY = y + dirY * artifact.offset * flareScale;
                const artifactSize = artifact.size * intensity * flareScale;

                return (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${artifactX}%`,
                            top: `${artifactY}%`,
                            width: artifactSize,
                            height: artifactSize,
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
                            opacity: artifact.opacity * flareOpacity * intensity,
                            borderRadius: '50%',
                            filter: 'blur(1px)',
                        }}
                    />
                );
            })}

            {/* Ring artifact */}
            <div
                className="absolute rounded-full border"
                style={{
                    left: `${x + dirX * 0.4}%`,
                    top: `${y + dirY * 0.4}%`,
                    width: 50 * intensity * flareScale,
                    height: 50 * intensity * flareScale,
                    transform: 'translate(-50%, -50%)',
                    borderColor: `${color}30`,
                    opacity: flareOpacity * 0.4,
                }}
            />
        </div>
    );
};
