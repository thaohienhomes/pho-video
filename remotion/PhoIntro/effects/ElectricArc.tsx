import React, { useMemo } from 'react';
import { useCurrentFrame, random, interpolate } from 'remotion';

interface ElectricArcProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color?: string;
    thickness?: number;
    segments?: number;
    jitter?: number;
    delay?: number;
}

export const ElectricArc: React.FC<ElectricArcProps> = ({
    startX,
    startY,
    endX,
    endY,
    color = '#00F0FF',
    thickness = 2,
    segments = 8,
    jitter = 30,
    delay = 0,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = Math.max(0, frame - delay);

    // Generate jittery path points
    const pathPoints = useMemo(() => {
        const points: { x: number; y: number }[] = [{ x: startX, y: startY }];

        const dx = (endX - startX) / segments;
        const dy = (endY - startY) / segments;

        for (let i = 1; i < segments; i++) {
            points.push({
                x: startX + dx * i,
                y: startY + dy * i,
            });
        }
        points.push({ x: endX, y: endY });

        return points;
    }, [startX, startY, endX, endY, segments]);

    // Animate jitter per frame
    const animatedPath = pathPoints.map((point, i) => {
        if (i === 0 || i === pathPoints.length - 1) return point;

        const jitterX = (random(`jx-${i}-${Math.floor(adjustedFrame / 2)}`) - 0.5) * jitter;
        const jitterY = (random(`jy-${i}-${Math.floor(adjustedFrame / 2)}`) - 0.5) * jitter;

        return {
            x: point.x + jitterX,
            y: point.y + jitterY,
        };
    });

    // Create SVG path
    const pathD = animatedPath.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;
        return `${acc} L ${point.x} ${point.y}`;
    }, '');

    // Flicker effect
    const flicker = random(`flicker-${Math.floor(adjustedFrame / 3)}`) > 0.2 ? 1 : 0.3;

    // Fade in
    const opacity = interpolate(adjustedFrame, [0, 10], [0, 1], {
        extrapolateRight: 'clamp',
    }) * flicker;

    // Glow intensity
    const glowSize = thickness * 4;

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity }}
        >
            <defs>
                <filter id={`arc-glow-${startX}-${startY}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation={glowSize} result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer glow layer */}
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={thickness * 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.3}
                filter={`url(#arc-glow-${startX}-${startY})`}
            />

            {/* Main arc */}
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#arc-glow-${startX}-${startY})`}
            />

            {/* Core white line */}
            <path
                d={pathD}
                fill="none"
                stroke="white"
                strokeWidth={thickness * 0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
            />
        </svg>
    );
};

// Convenience component for multiple arcs
interface ElectricArcsProps {
    centerX: number;
    centerY: number;
    radius: number;
    count?: number;
    color?: string;
}

export const ElectricArcs: React.FC<ElectricArcsProps> = ({
    centerX,
    centerY,
    radius,
    count = 4,
    color = '#00F0FF',
}) => {
    const frame = useCurrentFrame();

    const arcs = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const endAngle = angle + (random(`angle-${i}`) - 0.5) * 0.5;

            return {
                startX: centerX + Math.cos(angle) * (radius * 0.3),
                startY: centerY + Math.sin(angle) * (radius * 0.3),
                endX: centerX + Math.cos(endAngle) * radius,
                endY: centerY + Math.sin(endAngle) * radius,
                delay: i * 5,
            };
        });
    }, [centerX, centerY, radius, count]);

    // Rotate arcs over time
    const rotation = frame * 0.5;

    return (
        <div
            className="absolute inset-0"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {arcs.map((arc, i) => (
                <ElectricArc
                    key={i}
                    {...arc}
                    color={color}
                    thickness={2}
                    segments={6}
                    jitter={25}
                />
            ))}
        </div>
    );
};
