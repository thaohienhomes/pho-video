import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from 'remotion';

export const TerminalWindow: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const command = 'npx pho-video create --prompt "A cyberpunk street in Hanoi"';

    // 1. Entrance Animation (Pop-in)
    const entrance = spring({
        frame,
        fps,
        config: { damping: 12 },
    });

    // 2. Typing Animation
    // Starts at frame 30 (1 second), duration 90 frames (3 seconds)
    const typingDuration = 90;
    const typingStartTime = 30;
    const charsToShow = Math.floor(
        interpolate(frame, [typingStartTime, typingStartTime + typingDuration], [0, command.length], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        })
    );

    // 3. 3D Rotation Effect
    const rotateX = interpolate(frame, [0, 300], [5, -5]);
    const rotateY = interpolate(frame, [0, 300], [-5, 5]);

    // 4. Cursor Blinking
    const cursorVisible = Math.floor(frame / 10) % 2 === 0;

    // 5. Success State (Pulse) after typing
    const isDoneTyping = frame > typingStartTime + typingDuration;
    const successPulse = isDoneTyping
        ? Math.sin((frame - (typingStartTime + typingDuration)) / 5) * 0.05 + 1
        : 1;

    return (
        <AbsoluteFill className="flex items-center justify-center p-20">
            <div
                className="w-[900px] h-[500px] bg-[#1A1A1A]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                style={{
                    transform: `
                        perspective(1000px) 
                        scale(${entrance}) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg)
                        scale(${successPulse})
                    `,
                }}
            >
                {/* macOS Title Bar */}
                <div className="h-10 bg-white/5 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    <div className="flex-1 text-center">
                        <span className="text-white/30 text-xs font-mono tracking-tight">pho-video — 1920×1080</span>
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="p-8 font-mono text-xl leading-relaxed">
                    <div className="flex gap-3">
                        <span className="text-[#27C93F] font-bold">➜</span>
                        <span className="text-[#3FB9B1]">~</span>
                        <div className="text-white flex-1 overflow-hidden">
                            <span>{command.slice(0, charsToShow)}</span>
                            {cursorVisible && <span className="bg-white/60 ml-1">_</span>}
                        </div>
                    </div>

                    {isDoneTyping && (
                        <div
                            className="mt-6 space-y-2"
                            style={{
                                opacity: spring({
                                    frame: frame - (typingStartTime + typingDuration),
                                    fps,
                                    config: { damping: 20 }
                                })
                            }}
                        >
                            <p className="text-[#8B949E]">Initializing WaveSpeed-Kling adapter...</p>
                            <p className="text-[#E3B341]">Warning: High GPU demand detected. Optimizing...</p>
                            <div className="flex gap-2 text-[#27C93F]">
                                <span>[SUCCESS]</span>
                                <span className="text-white uppercase tracking-widest font-bold">Generating Cinematic Masterpiece...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};
