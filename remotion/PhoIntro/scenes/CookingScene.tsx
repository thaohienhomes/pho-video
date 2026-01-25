import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, random } from 'remotion';
import { CyberBowl } from '../CyberBowl';
import { ParticleField } from '../effects/ParticleField';
import { ElectricArcs } from '../effects/ElectricArc';
import { LensFlare } from '../effects/LensFlare';
import { FilmGrain } from '../effects/FilmGrain';

// SVG ingredient icons instead of emojis
const INGREDIENTS = [
    { icon: '🍜', label: 'noodles' },
    { icon: '🥢', label: 'chopsticks' },
    { icon: '🌶️', label: 'chili' },
    { icon: '🧅', label: 'onion' },
    { icon: '🌿', label: 'herbs' },
    { icon: '🥩', label: 'meat' },
];

interface SpiralIconProps {
    index: number;
    frame: number;
    fps: number;
    icon: string;
}

const SpiralIcon: React.FC<SpiralIconProps> = ({ index, frame, fps, icon }) => {
    const delay = index * 8;
    const adjustedFrame = Math.max(0, frame - delay);

    // Spiral inward motion
    const spiralProgress = spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 15, stiffness: 60 },
    });

    const angle = index * (Math.PI * 2 / INGREDIENTS.length) + adjustedFrame * 0.03;
    const startRadius = 400;
    const endRadius = 80;
    const radius = interpolate(spiralProgress, [0, 1], [startRadius, endRadius]);

    const x = 50 + Math.cos(angle) * (radius / 10);
    const y = 50 + Math.sin(angle) * (radius / 20); // Flattened for perspective

    const scale = interpolate(spiralProgress, [0, 1], [1.5, 0.8]);
    const opacity = interpolate(adjustedFrame, [0, 10, 40, 60], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    // Glow intensity
    const glow = interpolate(spiralProgress, [0.7, 1], [0, 30], { extrapolateLeft: 'clamp' });

    return (
        <div
            className="absolute text-4xl"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${adjustedFrame * 2}deg)`,
                opacity,
                filter: `drop-shadow(0 0 ${glow}px #F0421C)`,
            }}
        >
            {icon}
        </div>
    );
};

export const CookingScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Vortex rotation
    const vortexRotation = frame * 0.8;

    // Energy buildup
    const energyIntensity = interpolate(frame, [0, 60, 90], [0, 0.5, 1], { extrapolateRight: 'clamp' });

    // Background pulse
    const bgPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.05, 0.15]);

    // "Generating" text appear
    const textOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
    const textPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.7, 1]);

    return (
        <AbsoluteFill className="bg-[#050508] overflow-hidden">
            {/* Deep space background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse at 50% 50%, rgba(240,66,28,${bgPulse}) 0%, transparent 50%),
                        radial-gradient(ellipse at 30% 30%, rgba(0,240,255,0.05) 0%, transparent 40%),
                        radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 40%)
                    `,
                }}
            />

            {/* Rotating vortex effect */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${vortexRotation}deg)` }}
            >
                {/* Vortex rings */}
                {[200, 300, 400, 500].map((size, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full border"
                        style={{
                            width: size,
                            height: size * 0.3,
                            borderColor: i % 2 === 0 ? 'rgba(240,66,28,0.2)' : 'rgba(0,240,255,0.15)',
                            opacity: interpolate(energyIntensity, [0, 1], [0.2, 0.6]),
                        }}
                    />
                ))}
            </div>

            {/* Particle vortex */}
            <div
                className="absolute inset-0"
                style={{ transform: `rotate(${vortexRotation * 0.5}deg)` }}
            >
                <ParticleField
                    count={60}
                    direction="random"
                    speed={1.5}
                    colors={['#F0421C', '#00F0FF', '#FF6B4A', '#00D4FF']}
                    minSize={2}
                    maxSize={8}
                />
            </div>

            {/* Electric arcs around center */}
            <div
                className="absolute inset-0"
                style={{ opacity: energyIntensity }}
            >
                <ElectricArcs
                    centerX={960}
                    centerY={540}
                    radius={250}
                    count={6}
                    color="#00F0FF"
                />
            </div>

            {/* CyberBowl centered */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <CyberBowl scale={1.3} rotationSpeed={20} showEnergy={true} />
            </div>

            {/* Spiral ingredients */}
            <div className="absolute inset-0">
                {INGREDIENTS.map((item, i) => (
                    <SpiralIcon
                        key={i}
                        index={i}
                        frame={frame}
                        fps={fps}
                        icon={item.icon}
                    />
                ))}
            </div>

            {/* Lens flare at center */}
            <LensFlare
                x={50}
                y={48}
                intensity={energyIntensity * 0.6}
                color="#F0421C"
                delay={30}
                showStreak={true}
            />

            {/* "Generating" status */}
            <div
                className="absolute bottom-20 left-0 right-0 flex flex-col items-center"
                style={{ opacity: textOpacity * textPulse }}
            >
                <div className="flex items-center gap-3 mb-3">
                    {/* Loading dots */}
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#00F0FF]"
                            style={{
                                opacity: interpolate(
                                    Math.sin(frame * 0.2 - i * 0.5),
                                    [-1, 1],
                                    [0.3, 1]
                                ),
                                boxShadow: '0 0 10px #00F0FF',
                            }}
                        />
                    ))}
                </div>
                <span
                    className="text-[#00F0FF] font-mono text-xl tracking-[0.5em] uppercase"
                    style={{ textShadow: '0 0 20px rgba(0,240,255,0.5)' }}
                >
                    Generating
                </span>
                <div
                    className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                    style={{ width: 200 }}
                >
                    <div
                        className="h-full bg-gradient-to-r from-[#F0421C] to-[#00F0FF] rounded-full"
                        style={{
                            width: `${interpolate(frame, [0, 90], [0, 100], { extrapolateRight: 'clamp' })}%`,
                            boxShadow: '0 0 10px #F0421C',
                        }}
                    />
                </div>
            </div>

            {/* Film grain */}
            <FilmGrain intensity={0.04} showVignette={true} vignetteIntensity={0.6} />
        </AbsoluteFill>
    );
};
