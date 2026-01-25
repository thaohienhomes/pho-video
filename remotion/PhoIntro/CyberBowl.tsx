import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, random } from 'remotion';

interface CyberBowlProps {
    scale?: number;
    rotationSpeed?: number;
    showEnergy?: boolean;
}

// Steam particle component
const SteamParticle: React.FC<{ id: number; frame: number }> = ({ id, frame }) => {
    const startX = 100 + (random(`steam-x-${id}`) - 0.5) * 100;
    const speed = 0.8 + random(`steam-speed-${id}`) * 0.4;
    const drift = Math.sin(frame * 0.05 + id) * 20;

    const y = 60 - (frame * speed) % 80;
    const opacity = interpolate(y, [60, 30, 0, -20], [0, 0.6, 0.4, 0]);
    const size = 3 + random(`steam-size-${id}`) * 4;

    return (
        <circle
            cx={startX + drift}
            cy={y}
            r={size}
            fill="url(#steamGradient)"
            opacity={opacity}
            style={{ filter: 'blur(2px)' }}
        />
    );
};

// Energy ring component
const EnergyRing: React.FC<{ frame: number; delay: number; color: string }> = ({ frame, delay, color }) => {
    const adjustedFrame = Math.max(0, frame - delay);
    const cycle = adjustedFrame % 60;

    const radius = interpolate(cycle, [0, 60], [80, 180]);
    const opacity = interpolate(cycle, [0, 20, 60], [0.8, 0.4, 0]);
    const strokeWidth = interpolate(cycle, [0, 60], [3, 1]);

    return (
        <ellipse
            cx="150"
            cy="100"
            rx={radius}
            ry={radius * 0.3}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={opacity}
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
    );
};

export const CyberBowl: React.FC<CyberBowlProps> = ({
    scale = 1,
    rotationSpeed = 30,
    showEnergy = true,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Continuous rotation
    const rotation = (frame / fps) * rotationSpeed;

    // Pulsing glow
    const glowIntensity = interpolate(Math.sin(frame * 0.1), [-1, 1], [20, 40]);
    const innerGlow = interpolate(Math.sin(frame * 0.15 + 1), [-1, 1], [10, 25]);

    // Scale entrance
    const scaleProgress = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 80 },
    });
    const currentScale = interpolate(scaleProgress, [0, 1], [0.3, scale]);

    // Liquid wave animation
    const waveOffset = Math.sin(frame * 0.08) * 5;

    // Generate steam particles
    const steamParticles = useMemo(() =>
        Array.from({ length: 15 }, (_, i) => i),
        []);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{
                transform: `scale(${currentScale}) rotateY(${rotation}deg)`,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            <svg
                width="300"
                height="220"
                viewBox="0 0 300 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    filter: `drop-shadow(0 0 ${glowIntensity}px #F0421C) drop-shadow(0 0 ${glowIntensity * 0.5}px #00F0FF)`,
                }}
            >
                <defs>
                    {/* Gradients */}
                    <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F0421C" />
                        <stop offset="50%" stopColor="#FF6B4A" />
                        <stop offset="100%" stopColor="#F0421C" />
                    </linearGradient>

                    <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B4513" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#654321" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#3D2314" stopOpacity="1" />
                    </linearGradient>

                    <radialGradient id="steamGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#00F0FF" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.5" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Energy rings behind bowl */}
                {showEnergy && (
                    <g>
                        <EnergyRing frame={frame} delay={0} color="#F0421C" />
                        <EnergyRing frame={frame} delay={20} color="#00F0FF" />
                        <EnergyRing frame={frame} delay={40} color="#F0421C" />
                    </g>
                )}

                {/* Bowl shadow */}
                <ellipse
                    cx="150"
                    cy="190"
                    rx="100"
                    ry="20"
                    fill="black"
                    opacity="0.3"
                    style={{ filter: 'blur(10px)' }}
                />

                {/* Bowl outer body */}
                <path
                    d="M 30 80 
                       Q 30 170, 150 180 
                       Q 270 170, 270 80"
                    stroke="url(#bowlGradient)"
                    strokeWidth="4"
                    fill="none"
                    filter="url(#neonGlow)"
                />

                {/* Bowl rim - outer */}
                <ellipse
                    cx="150"
                    cy="80"
                    rx="120"
                    ry="28"
                    stroke="url(#bowlGradient)"
                    strokeWidth="4"
                    fill="none"
                    filter="url(#neonGlow)"
                />

                {/* Liquid surface */}
                <ellipse
                    cx="150"
                    cy={85 + waveOffset}
                    rx="105"
                    ry="22"
                    fill="url(#liquidGradient)"
                    opacity="0.9"
                />

                {/* Bowl rim - inner accent */}
                <ellipse
                    cx="150"
                    cy="82"
                    rx="105"
                    ry="22"
                    stroke="url(#neonCyan)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                    filter="url(#neonGlow)"
                />

                {/* Noodle strands */}
                <g opacity="0.7" filter="url(#neonGlow)">
                    <path
                        d={`M 80 ${90 + waveOffset} Q 120 ${100 + waveOffset}, 100 ${110 + waveOffset} Q 80 ${120 + waveOffset}, 130 ${115 + waveOffset}`}
                        stroke="#F0421C"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M 170 ${88 + waveOffset} Q 200 ${95 + waveOffset}, 190 ${105 + waveOffset} Q 175 ${115 + waveOffset}, 210 ${110 + waveOffset}`}
                        stroke="#F0421C"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path
                        d={`M 130 ${92 + waveOffset} Q 150 ${102 + waveOffset}, 145 ${112 + waveOffset}`}
                        stroke="#FF8C69"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />
                </g>

                {/* Chopsticks */}
                <g filter="url(#neonGlow)">
                    <line x1="210" y1="40" x2="160" y2="100" stroke="#00F0FF" strokeWidth="5" strokeLinecap="round" />
                    <line x1="225" y1="45" x2="175" y2="105" stroke="#00F0FF" strokeWidth="5" strokeLinecap="round" />
                    {/* Chopstick highlight */}
                    <line x1="212" y1="42" x2="162" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <line x1="227" y1="47" x2="177" y2="103" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </g>

                {/* Steam particles */}
                <g>
                    {steamParticles.map(id => (
                        <SteamParticle key={id} id={id} frame={frame} />
                    ))}
                </g>

                {/* Decorative elements - herbs */}
                <g opacity="0.8">
                    <ellipse cx="90" cy={95 + waveOffset} rx="8" ry="5" fill="#22C55E" opacity="0.7" />
                    <ellipse cx="200" cy={92 + waveOffset} rx="6" ry="4" fill="#22C55E" opacity="0.6" />
                    <circle cx="110" cy={90 + waveOffset} r="4" fill="#EF4444" opacity="0.8" /> {/* Chili */}
                </g>

                {/* Reflection highlight */}
                <ellipse
                    cx="120"
                    cy="75"
                    rx="30"
                    ry="8"
                    fill="white"
                    opacity={interpolate(Math.sin(frame * 0.1), [-1, 1], [0.1, 0.25])}
                    style={{ filter: 'blur(3px)' }}
                />
            </svg>

            {/* Ambient glow behind */}
            <div
                className="absolute -inset-20 rounded-full -z-10"
                style={{
                    background: `radial-gradient(circle, rgba(240,66,28,${innerGlow / 100}) 0%, transparent 60%)`,
                }}
            />
        </div>
    );
};
