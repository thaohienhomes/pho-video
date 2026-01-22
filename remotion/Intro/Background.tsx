import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Background: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Subtle drift for energy
    const drift = interpolate(frame, [0, 300], [0, 50], {
        extrapolateRight: 'clamp',
    });

    return (
        <div
            className="absolute inset-0 bg-[#0A0A0A] overflow-hidden"
            style={{ width, height }}
        >
            {/* Electric Vermilion Glow */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(240, 66, 28, 0.15) 0%, rgba(240, 66, 28, 0) 70%)',
                    top: -200 + drift,
                    right: -200 - drift,
                    filter: 'blur(100px)',
                }}
            />

            <div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(240, 66, 28, 0.1) 0%, rgba(240, 66, 28, 0) 70%)',
                    bottom: -150 - drift,
                    left: -150 + drift,
                    filter: 'blur(80px)',
                }}
            />

            {/* Mesh Grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), 
                                     linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px',
                    transform: `perspective(1000px) rotateX(60deg) translateY(${drift}px)`,
                }}
            />
        </div>
    );
};
