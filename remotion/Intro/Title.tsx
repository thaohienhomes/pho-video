import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

interface TitleProps {
    title: string;
    subtitle: string;
}

export const Title: React.FC<TitleProps> = ({ title, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleProgress = spring({
        frame: frame - 10,
        fps,
        config: {
            damping: 12,
        },
    });

    const subtitleProgress = spring({
        frame: frame - 30,
        fps,
        config: {
            damping: 12,
        },
    });

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <div className="flex flex-col items-center justify-center h-full w-full z-10" style={{ opacity }}>
            <h1
                className="text-9xl font-bold tracking-tighter text-white"
                style={{
                    transform: `scale(${interpolate(titleProgress, [0, 1], [0.8, 1])})`,
                    textShadow: '0 0 40px rgba(240, 66, 28, 0.5)',
                }}
            >
                {title.split('').map((char, i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            color: char === 'ở' ? '#F0421C' : 'white'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>

            <div
                className="mt-6 px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full"
                style={{
                    transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
                    opacity: subtitleProgress,
                }}
            >
                <p className="text-2xl font-medium tracking-wide text-white/80 uppercase">
                    {subtitle}
                </p>
            </div>
        </div>
    );
};
