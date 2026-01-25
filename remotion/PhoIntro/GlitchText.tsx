import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, random } from 'remotion';

interface GlitchTextProps {
    text: string;
    typingSpeed?: number;
    glitchIntensity?: number;
    fontSize?: string;
    showCursor?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
    text,
    typingSpeed = 20,
    glitchIntensity = 1,
    fontSize = 'text-2xl',
    showCursor = true,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Calculate visible characters
    const charsPerFrame = typingSpeed / fps;
    const visibleChars = Math.floor(frame * charsPerFrame);
    const displayText = text.slice(0, Math.min(visibleChars, text.length));
    const isTypingComplete = visibleChars >= text.length;

    // Glitch timing - more complex pattern
    const glitchCycle = frame % 60;
    const isGlitching = (glitchCycle > 45 && glitchCycle < 52) || (glitchCycle > 20 && glitchCycle < 23);

    // RGB split offsets
    const rgbOffset = isGlitching ? (random(`rgb-${Math.floor(frame / 2)}`) - 0.5) * 8 * glitchIntensity : 0;

    // Scanline distortion
    const scanlineOffset = isGlitching ? Math.sin(frame * 2) * 3 : 0;

    // Block corruption - random characters replaced
    const corruptedText = useMemo(() => {
        if (!isGlitching) return displayText;

        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`';
        return displayText.split('').map((char, i) => {
            if (random(`corrupt-${i}-${Math.floor(frame / 3)}`) > 0.85) {
                return glitchChars[Math.floor(random(`gc-${i}-${frame}`) * glitchChars.length)];
            }
            return char;
        }).join('');
    }, [displayText, isGlitching, frame]);

    // Cursor blink
    const cursorVisible = Math.floor(frame / 12) % 2 === 0;

    // Fade in
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

    // Horizontal shift glitch
    const xShift = isGlitching ? (random(`xshift-${Math.floor(frame / 2)}`) - 0.5) * 10 * glitchIntensity : 0;

    // Noise injection overlay
    const noiseOpacity = isGlitching ? 0.3 * glitchIntensity : 0;

    return (
        <div
            className={`relative font-mono ${fontSize}`}
            style={{
                opacity,
                transform: `translateX(${xShift}px) translateY(${scanlineOffset}px)`,
            }}
        >
            {/* Noise overlay during glitch */}
            {isGlitching && (
                <div
                    className="absolute inset-0 -inset-x-4 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        opacity: noiseOpacity,
                        mixBlendMode: 'overlay',
                    }}
                />
            )}

            {/* Red channel (offset left) */}
            <span
                className="absolute text-red-500"
                style={{
                    transform: `translateX(${-rgbOffset}px)`,
                    opacity: 0.7,
                    mixBlendMode: 'screen',
                    clipPath: isGlitching ? `inset(${random(`clip-${frame}`) * 100}% 0 ${random(`clip2-${frame}`) * 50}% 0)` : 'none',
                }}
            >
                {corruptedText}
            </span>

            {/* Blue channel (offset right) */}
            <span
                className="absolute text-blue-400"
                style={{
                    transform: `translateX(${rgbOffset}px)`,
                    opacity: 0.7,
                    mixBlendMode: 'screen',
                }}
            >
                {corruptedText}
            </span>

            {/* Cyan channel (offset down) */}
            <span
                className="absolute text-cyan-400"
                style={{
                    transform: `translateY(${rgbOffset * 0.5}px)`,
                    opacity: 0.5,
                    mixBlendMode: 'screen',
                }}
            >
                {corruptedText}
            </span>

            {/* Main white text */}
            <span className="relative text-white" style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>
                {displayText}
                {/* Cursor */}
                {showCursor && !isTypingComplete && cursorVisible && (
                    <span
                        className="text-[#00F0FF] ml-0.5"
                        style={{ textShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF' }}
                    >
                        ▌
                    </span>
                )}
            </span>

            {/* Scanline effect during glitch */}
            {isGlitching && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `repeating-linear-gradient(
                            0deg,
                            transparent 0px,
                            transparent 2px,
                            rgba(0,240,255,0.1) 2px,
                            rgba(0,240,255,0.1) 4px
                        )`,
                        transform: `translateY(${frame % 4}px)`,
                    }}
                />
            )}
        </div>
    );
};
