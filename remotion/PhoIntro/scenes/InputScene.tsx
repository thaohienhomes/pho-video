import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { GlitchText } from '../GlitchText';
import { AuroraBackground } from '../effects/AuroraBackground';
import { ParticleField } from '../effects/ParticleField';
import { FilmGrain } from '../effects/FilmGrain';

export const InputScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Terminal entrance animation
    const terminalProgress = spring({
        frame: frame - 5,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const terminalScale = interpolate(terminalProgress, [0, 1], [0.9, 1]);
    const terminalOpacity = interpolate(terminalProgress, [0, 1], [0, 1]);

    // Holographic scan effect
    const scanY = (frame * 3) % 120;

    // Floating effect for terminal
    const floatY = Math.sin(frame * 0.05) * 5;

    // Corner bracket animation
    const bracketProgress = spring({
        frame: frame - 15,
        fps,
        config: { damping: 20 },
    });

    return (
        <AbsoluteFill>
            {/* Aurora nebula background */}
            <AuroraBackground
                intensity={0.8}
                speed={0.5}
                colors={{
                    primary: '#F0421C',
                    secondary: '#00F0FF',
                    accent: '#8B5CF6',
                }}
            />

            {/* Floating particles */}
            <ParticleField
                count={40}
                direction="random"
                speed={0.5}
                colors={['#F0421C', '#00F0FF', '#ffffff']}
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,240,255,0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,240,255,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    perspective: '500px',
                    transform: 'rotateX(60deg) translateY(-50%)',
                    transformOrigin: 'center bottom',
                }}
            />

            {/* Main terminal container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="relative"
                    style={{
                        transform: `scale(${terminalScale}) translateY(${floatY}px)`,
                        opacity: terminalOpacity,
                    }}
                >
                    {/* Glow behind terminal */}
                    <div
                        className="absolute -inset-8 rounded-2xl -z-10"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.15) 0%, transparent 70%)',
                            filter: 'blur(20px)',
                        }}
                    />

                    {/* Terminal window */}
                    <div
                        className="relative px-12 py-8 rounded-xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(180deg, rgba(0,240,255,0.08) 0%, rgba(0,0,0,0.9) 100%)',
                            border: '1px solid rgba(0,240,255,0.3)',
                            boxShadow: `
                                0 0 40px rgba(0,240,255,0.2),
                                inset 0 0 60px rgba(0,240,255,0.05),
                                0 20px 60px rgba(0,0,0,0.5)
                            `,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {/* Holographic scan line */}
                        <div
                            className="absolute left-0 right-0 h-px pointer-events-none"
                            style={{
                                top: `${scanY}%`,
                                background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.8), transparent)',
                                boxShadow: '0 0 10px rgba(0,240,255,0.5)',
                            }}
                        />

                        {/* Terminal header */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            </div>
                            <span className="ml-4 text-white/40 text-sm font-mono tracking-wider">
                                pho-video://prompt.ai
                            </span>
                            <div className="ml-auto flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"
                                    style={{ opacity: interpolate(Math.sin(frame * 0.2), [-1, 1], [0.3, 1]) }}
                                />
                            </div>
                        </div>

                        {/* Command line */}
                        <div className="flex items-start gap-4">
                            <span
                                className="text-[#00F0FF] font-mono text-2xl"
                                style={{ textShadow: '0 0 10px #00F0FF' }}
                            >
                                ❯
                            </span>
                            <div className="flex-1">
                                <GlitchText
                                    text="A steaming bowl of Phở floating in a neon-lit cyberpunk alley, holographic steam rising into the night sky, rain reflections on chrome surfaces..."
                                    typingSpeed={30}
                                    glitchIntensity={1.5}
                                    fontSize="text-xl"
                                />
                            </div>
                        </div>

                        {/* Status bar */}
                        <div
                            className="mt-6 pt-4 border-t border-white/5 flex items-center gap-4 text-xs font-mono text-white/30"
                            style={{
                                opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' }),
                            }}
                        >
                            <span className="text-[#F0421C]">● KLING 2.0</span>
                            <span>|</span>
                            <span>1920×1080</span>
                            <span>|</span>
                            <span>5.0s</span>
                            <span className="ml-auto text-[#00F0FF]">Ready</span>
                        </div>
                    </div>

                    {/* Animated corner brackets */}
                    <div
                        className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2 border-[#F0421C]"
                        style={{
                            opacity: bracketProgress,
                            transform: `scale(${bracketProgress})`,
                            boxShadow: '-2px -2px 10px rgba(240,66,28,0.5)',
                        }}
                    />
                    <div
                        className="absolute -top-4 -right-4 w-12 h-12 border-r-2 border-t-2 border-[#F0421C]"
                        style={{
                            opacity: bracketProgress,
                            transform: `scale(${bracketProgress})`,
                            boxShadow: '2px -2px 10px rgba(240,66,28,0.5)',
                        }}
                    />
                    <div
                        className="absolute -bottom-4 -left-4 w-12 h-12 border-l-2 border-b-2 border-[#00F0FF]"
                        style={{
                            opacity: bracketProgress,
                            transform: `scale(${bracketProgress})`,
                            boxShadow: '-2px 2px 10px rgba(0,240,255,0.5)',
                        }}
                    />
                    <div
                        className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2 border-[#00F0FF]"
                        style={{
                            opacity: bracketProgress,
                            transform: `scale(${bracketProgress})`,
                            boxShadow: '2px 2px 10px rgba(0,240,255,0.5)',
                        }}
                    />
                </div>
            </div>

            {/* Film grain overlay */}
            <FilmGrain intensity={0.03} showVignette={true} vignetteIntensity={0.5} />
        </AbsoluteFill>
    );
};
