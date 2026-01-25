import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface AuroraBackgroundProps {
    intensity?: number;
    speed?: number;
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
    intensity = 1,
    speed = 1,
    colors = {
        primary: '#F0421C',
        secondary: '#00F0FF',
        accent: '#8B5CF6',
    },
}) => {
    const frame = useCurrentFrame();

    // Animated positions for gradient centers
    const pos1X = 30 + Math.sin(frame * 0.02 * speed) * 20;
    const pos1Y = 20 + Math.cos(frame * 0.015 * speed) * 15;

    const pos2X = 70 + Math.cos(frame * 0.018 * speed) * 25;
    const pos2Y = 80 + Math.sin(frame * 0.022 * speed) * 20;

    const pos3X = 50 + Math.sin(frame * 0.025 * speed + 2) * 30;
    const pos3Y = 50 + Math.cos(frame * 0.02 * speed + 1) * 25;

    // Pulsing opacity
    const pulse1 = interpolate(Math.sin(frame * 0.03), [-1, 1], [0.1, 0.25]) * intensity;
    const pulse2 = interpolate(Math.cos(frame * 0.025), [-1, 1], [0.08, 0.2]) * intensity;
    const pulse3 = interpolate(Math.sin(frame * 0.035 + 1), [-1, 1], [0.05, 0.15]) * intensity;

    return (
        <AbsoluteFill className="bg-[#0A0A0A]">
            {/* Base dark gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #0A0A0A 70%)',
                }}
            />

            {/* Primary aurora blob */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse 80% 50% at ${pos1X}% ${pos1Y}%, ${colors.primary}${Math.round(pulse1 * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
                    filter: 'blur(40px)',
                }}
            />

            {/* Secondary aurora blob */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse 60% 80% at ${pos2X}% ${pos2Y}%, ${colors.secondary}${Math.round(pulse2 * 255).toString(16).padStart(2, '0')} 0%, transparent 45%)`,
                    filter: 'blur(60px)',
                }}
            />

            {/* Accent aurora blob */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse 70% 60% at ${pos3X}% ${pos3Y}%, ${colors.accent}${Math.round(pulse3 * 255).toString(16).padStart(2, '0')} 0%, transparent 40%)`,
                    filter: 'blur(50px)',
                }}
            />

            {/* Nebula streaks */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `
                        linear-gradient(${45 + frame * 0.1}deg, transparent 40%, ${colors.primary}10 50%, transparent 60%),
                        linear-gradient(${-30 + frame * 0.05}deg, transparent 45%, ${colors.secondary}08 50%, transparent 55%)
                    `,
                }}
            />

            {/* Star field simulation */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        radial-gradient(1px 1px at 20% 30%, white 50%, transparent),
                        radial-gradient(1px 1px at 40% 70%, white 50%, transparent),
                        radial-gradient(1px 1px at 60% 20%, white 50%, transparent),
                        radial-gradient(1px 1px at 80% 60%, white 50%, transparent),
                        radial-gradient(2px 2px at 10% 80%, white 50%, transparent),
                        radial-gradient(2px 2px at 90% 40%, white 50%, transparent)
                    `,
                    opacity: interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 0.6]),
                }}
            />
        </AbsoluteFill>
    );
};
