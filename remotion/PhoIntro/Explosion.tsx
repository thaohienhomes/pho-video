import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, random } from 'remotion';

interface ExplosionProps {
    logoText?: string;
}

// Explosion particle
interface Particle {
    angle: number;
    speed: number;
    size: number;
    color: string;
    delay: number;
}

const ExplosionParticle: React.FC<{ particle: Particle; frame: number; centerX: number; centerY: number }> = ({
    particle,
    frame,
    centerX,
    centerY,
}) => {
    const adjustedFrame = Math.max(0, frame - particle.delay);

    // Particle flies outward
    const distance = adjustedFrame * particle.speed * 3;
    const x = centerX + Math.cos(particle.angle) * distance;
    const y = centerY + Math.sin(particle.angle) * distance;

    // Fade out as it travels
    const opacity = interpolate(adjustedFrame, [0, 10, 50], [0, 1, 0], { extrapolateRight: 'clamp' });

    // Shrink over time
    const scale = interpolate(adjustedFrame, [0, 50], [1, 0.3], { extrapolateRight: 'clamp' });

    return (
        <div
            className="absolute rounded-full"
            style={{
                left: x,
                top: y,
                width: particle.size * scale,
                height: particle.size * scale,
                backgroundColor: particle.color,
                opacity,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
};

// Shockwave ring
const Shockwave: React.FC<{ frame: number; delay: number; color: string }> = ({ frame, delay, color }) => {
    const adjustedFrame = Math.max(0, frame - delay);

    const size = interpolate(adjustedFrame, [0, 40], [0, 1000], { extrapolateRight: 'clamp' });
    const opacity = interpolate(adjustedFrame, [0, 10, 40], [0, 0.6, 0], { extrapolateRight: 'clamp' });
    const borderWidth = interpolate(adjustedFrame, [0, 40], [8, 2], { extrapolateRight: 'clamp' });

    return (
        <div
            className="absolute rounded-full border"
            style={{
                left: '50%',
                top: '50%',
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
                borderColor: color,
                borderWidth,
                opacity,
                boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`,
            }}
        />
    );
};

export const Explosion: React.FC<ExplosionProps> = ({
    logoText = 'Phở Video',
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const centerX = width / 2;
    const centerY = height / 2;

    // Generate explosion particles
    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: 80 }, (_, i) => ({
            angle: (i / 80) * Math.PI * 2 + random(`angle-${i}`) * 0.3,
            speed: 3 + random(`speed-${i}`) * 5,
            size: 4 + random(`size-${i}`) * 12,
            color: random(`color-${i}`) > 0.5 ? '#F0421C' : '#00F0FF',
            delay: random(`delay-${i}`) * 8,
        }));
    }, []);

    // White flash
    const flashOpacity = interpolate(frame, [0, 3, 8, 20], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    // Camera shake effect
    const shakeIntensity = interpolate(frame, [0, 5, 30], [0, 15, 0], { extrapolateRight: 'clamp' });
    const shakeX = Math.sin(frame * 2) * shakeIntensity;
    const shakeY = Math.cos(frame * 2.5) * shakeIntensity;

    // Logo entrance
    const logoProgress = spring({
        frame: frame - 20,
        fps,
        config: { damping: 8, stiffness: 80 },
    });
    const logoScale = interpolate(logoProgress, [0, 1], [0.2, 1]);
    const logoOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Chromatic aberration on logo
    const aberrationOffset = interpolate(frame, [20, 40], [6, 0], { extrapolateRight: 'clamp' });

    // Energy outline pulse
    const outlinePulse = interpolate(Math.sin(frame * 0.2), [-1, 1], [2, 6]);

    return (
        <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
            {/* Background */}
            <AbsoluteFill className="bg-[#0A0A0A]" />

            {/* Radial energy burst background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at center, rgba(240,66,28,${interpolate(frame, [0, 15, 50], [0, 0.4, 0.1])}) 0%, transparent 60%)`,
                }}
            />

            {/* Explosion particles */}
            <div className="absolute inset-0">
                {particles.map((particle, i) => (
                    <ExplosionParticle
                        key={i}
                        particle={particle}
                        frame={frame}
                        centerX={centerX}
                        centerY={centerY}
                    />
                ))}
            </div>

            {/* Shockwave rings */}
            <Shockwave frame={frame} delay={0} color="#F0421C" />
            <Shockwave frame={frame} delay={5} color="#00F0FF" />
            <Shockwave frame={frame} delay={10} color="#F0421C" />

            {/* White flash overlay */}
            <AbsoluteFill style={{ backgroundColor: 'white', opacity: flashOpacity }} />

            {/* Logo with chromatic aberration */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                    transform: `scale(${logoScale})`,
                    opacity: logoOpacity,
                }}
            >
                {/* Red channel offset */}
                <h1
                    className="absolute text-8xl font-bold tracking-tighter text-red-500/50"
                    style={{
                        transform: `translateX(${-aberrationOffset}px)`,
                        mixBlendMode: 'screen',
                    }}
                >
                    {logoText}
                </h1>

                {/* Cyan channel offset */}
                <h1
                    className="absolute text-8xl font-bold tracking-tighter text-cyan-400/50"
                    style={{
                        transform: `translateX(${aberrationOffset}px)`,
                        mixBlendMode: 'screen',
                    }}
                >
                    {logoText}
                </h1>

                {/* Main logo */}
                <h1
                    className="relative text-8xl font-bold tracking-tighter"
                    style={{
                        textShadow: `
                            0 0 ${outlinePulse * 10}px rgba(240,66,28,0.8),
                            0 0 ${outlinePulse * 20}px rgba(240,66,28,0.5),
                            0 0 ${outlinePulse * 40}px rgba(240,66,28,0.3)
                        `,
                    }}
                >
                    {logoText.split('').map((char, i) => (
                        <span
                            key={i}
                            style={{
                                display: 'inline-block',
                                color: char === 'ở' ? '#F0421C' : 'white',
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </h1>

                {/* Tagline */}
                <div
                    className="mt-6 text-2xl text-white/70 tracking-[0.3em] uppercase"
                    style={{
                        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                        transform: `translateY(${interpolate(frame, [50, 70], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                        textShadow: '0 0 20px rgba(0,240,255,0.5)',
                    }}
                >
                    AI Video Generation
                </div>
            </div>

            {/* Lens flare at center */}
            <div
                className="absolute rounded-full"
                style={{
                    left: '50%',
                    top: '50%',
                    width: interpolate(frame, [5, 15, 30], [0, 200, 0]),
                    height: interpolate(frame, [5, 15, 30], [0, 200, 0]),
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, white 0%, rgba(240,66,28,0.5) 30%, transparent 70%)',
                    opacity: interpolate(frame, [5, 15, 30], [0, 0.8, 0]),
                }}
            />
        </AbsoluteFill>
    );
};
