import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, random } from 'remotion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    delay: number;
    color: string;
    opacity: number;
}

interface ParticleFieldProps {
    count?: number;
    colors?: string[];
    minSize?: number;
    maxSize?: number;
    direction?: 'up' | 'down' | 'random';
    speed?: number;
    fadeIn?: boolean;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
    count = 50,
    colors = ['#F0421C', '#00F0FF', '#ffffff'],
    minSize = 2,
    maxSize = 6,
    direction = 'up',
    speed = 1,
    fadeIn = true,
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    // Generate particles once
    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: random(`x-${i}`) * 100,
            y: random(`y-${i}`) * 100,
            size: minSize + random(`size-${i}`) * (maxSize - minSize),
            speed: 0.5 + random(`speed-${i}`) * speed,
            delay: random(`delay-${i}`) * 30,
            color: colors[Math.floor(random(`color-${i}`) * colors.length)],
            opacity: 0.3 + random(`opacity-${i}`) * 0.7,
        }));
    }, [count, colors, minSize, maxSize, speed]);

    // Fade in effect
    const globalOpacity = fadeIn
        ? interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
        : 1;

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity: globalOpacity }}
        >
            {particles.map((particle) => {
                const adjustedFrame = Math.max(0, frame - particle.delay);

                // Movement based on direction
                let yOffset = 0;
                let xOffset = 0;

                if (direction === 'up') {
                    yOffset = -adjustedFrame * particle.speed * 0.5;
                } else if (direction === 'down') {
                    yOffset = adjustedFrame * particle.speed * 0.5;
                } else {
                    // Random float
                    yOffset = Math.sin(adjustedFrame * 0.02 * particle.speed) * 20;
                    xOffset = Math.cos(adjustedFrame * 0.015 * particle.speed) * 15;
                }

                // Pulsing glow
                const pulse = interpolate(
                    Math.sin(adjustedFrame * 0.1 + particle.id),
                    [-1, 1],
                    [0.5, 1]
                );

                // Wrap around for continuous effect
                const baseY = particle.y + (yOffset % 120);
                const wrappedY = baseY < -10 ? baseY + 120 : baseY > 110 ? baseY - 120 : baseY;

                return (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${particle.x + xOffset}%`,
                            top: `${wrappedY}%`,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            opacity: particle.opacity * pulse,
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}`,
                            transform: `scale(${pulse})`,
                        }}
                    />
                );
            })}
        </div>
    );
};
