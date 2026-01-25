import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AuroraBackground } from '../effects/AuroraBackground';
import { ParticleField } from '../effects/ParticleField';
import { LensFlare } from '../effects/LensFlare';
import { FilmGrain } from '../effects/FilmGrain';

export const OutroScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Slogan entrance
    const sloganProgress = spring({
        frame: frame - 5,
        fps,
        config: { damping: 12, stiffness: 80 },
    });

    // CTA button entrance
    const ctaProgress = spring({
        frame: frame - 35,
        fps,
        config: { damping: 10, stiffness: 100 },
    });

    // Website URL entrance
    const urlProgress = spring({
        frame: frame - 55,
        fps,
        config: { damping: 15 },
    });

    // Fade out at end
    const fadeOut = interpolate(frame, [100, 120], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // CTA glow pulse
    const ctaGlow = interpolate(Math.sin(frame * 0.15), [-1, 1], [30, 60]);

    // Light rays from behind text
    const rayOpacity = interpolate(frame, [10, 40], [0, 0.3], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ opacity: fadeOut }}>
            {/* Aurora background */}
            <AuroraBackground
                intensity={1.2}
                speed={0.8}
                colors={{
                    primary: '#F0421C',
                    secondary: '#00F0FF',
                    accent: '#8B5CF6',
                }}
            />

            {/* Floating particles */}
            <ParticleField
                count={50}
                direction="up"
                speed={0.3}
                colors={['#F0421C', '#00F0FF', '#ffffff', '#FF6B4A']}
                minSize={1}
                maxSize={4}
            />

            {/* Light rays from center */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        conic-gradient(
                            from 0deg at 50% 45%,
                            transparent 0deg,
                            rgba(240,66,28,0.1) 10deg,
                            transparent 20deg,
                            rgba(0,240,255,0.08) 30deg,
                            transparent 40deg,
                            rgba(240,66,28,0.1) 50deg,
                            transparent 60deg,
                            rgba(0,240,255,0.08) 70deg,
                            transparent 80deg,
                            rgba(240,66,28,0.1) 90deg,
                            transparent 100deg
                        )
                    `,
                    opacity: rayOpacity,
                    transform: `rotate(${frame * 0.1}deg)`,
                }}
            />

            {/* Content container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">

                {/* Main slogan */}
                <div
                    style={{
                        transform: `translateY(${interpolate(sloganProgress, [0, 1], [60, 0])}px)`,
                        opacity: sloganProgress,
                    }}
                >
                    <h2
                        className="text-7xl font-bold text-center tracking-tight leading-tight"
                        style={{
                            textShadow: `
                                0 0 40px rgba(255,255,255,0.3),
                                0 4px 20px rgba(0,0,0,0.5)
                            `,
                        }}
                    >
                        <span className="text-white">Create </span>
                        <span
                            className="text-[#F0421C]"
                            style={{ textShadow: '0 0 30px rgba(240,66,28,0.6)' }}
                        >
                            Stunning
                        </span>
                        <br />
                        <span className="text-white">AI Videos</span>
                    </h2>
                </div>

                {/* Features list */}
                <div
                    className="mt-8 flex items-center gap-6 text-lg text-white/60"
                    style={{
                        opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' }),
                        transform: `translateY(${interpolate(frame, [25, 45], [20, 0], { extrapolateRight: 'clamp' })}px)`,
                    }}
                >
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F0421C]" />
                        Kling 2.0
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                        Wan 2.1
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                        LTX-Video
                    </span>
                </div>

                {/* CTA Button */}
                <div
                    className="mt-12"
                    style={{
                        transform: `scale(${interpolate(ctaProgress, [0, 1], [0.8, 1])})`,
                        opacity: ctaProgress,
                    }}
                >
                    <div
                        className="relative px-12 py-5 rounded-full cursor-pointer group"
                        style={{
                            background: 'linear-gradient(135deg, #F0421C 0%, #FF6B4A 50%, #F0421C 100%)',
                            boxShadow: `
                                0 0 ${ctaGlow}px rgba(240,66,28,0.6),
                                0 0 ${ctaGlow * 2}px rgba(240,66,28,0.3),
                                0 10px 40px rgba(0,0,0,0.4),
                                inset 0 1px 0 rgba(255,255,255,0.2)
                            `,
                        }}
                    >
                        {/* Button shine effect */}
                        <div
                            className="absolute inset-0 rounded-full overflow-hidden"
                            style={{
                                background: `linear-gradient(
                                    105deg,
                                    transparent 40%,
                                    rgba(255,255,255,0.2) 45%,
                                    rgba(255,255,255,0.3) 50%,
                                    rgba(255,255,255,0.2) 55%,
                                    transparent 60%
                                )`,
                                transform: `translateX(${interpolate(frame, [35, 70], [-100, 200])}%)`,
                            }}
                        />

                        <span
                            className="relative text-white text-2xl font-semibold tracking-wide"
                            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                        >
                            Start Creating Free →
                        </span>
                    </div>
                </div>

                {/* Website URL */}
                <div
                    className="mt-16"
                    style={{
                        opacity: urlProgress,
                        transform: `translateY(${interpolate(urlProgress, [0, 1], [20, 0])}px)`,
                    }}
                >
                    <span
                        className="text-xl font-mono tracking-widest"
                        style={{
                            background: 'linear-gradient(90deg, #F0421C, #00F0FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: 'none',
                            filter: 'drop-shadow(0 0 10px rgba(240,66,28,0.3))',
                        }}
                    >
                        pho.video
                    </span>
                </div>
            </div>

            {/* Lens flare accents */}
            <LensFlare x={30} y={25} intensity={0.3} color="#00F0FF" delay={20} showStreak={false} />
            <LensFlare x={75} y={70} intensity={0.2} color="#F0421C" delay={40} showStreak={false} />

            {/* Film grain */}
            <FilmGrain intensity={0.03} showVignette={true} vignetteIntensity={0.5} />
        </AbsoluteFill>
    );
};
