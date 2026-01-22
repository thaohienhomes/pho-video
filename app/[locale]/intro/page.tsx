'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { RemotionRoot } from '@/remotion/Root';
import { IntroVideo } from '@/remotion/Intro';

export default function IntroPreviewPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
            <div className="max-w-5xl w-full">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Intro Video Preview</h1>
                        <p className="text-white/60">Remotion composition for Phở Video project introduction.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                            1920x1080 | 30fps | 10s
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/20 aspect-video bg-black">
                    <Player
                        component={IntroVideo}
                        durationInFrames={300}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        fps={30}
                        controls
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        inputProps={{
                            title: "Phở Video",
                            subtitle: "The Future of AI Video Generation",
                        }}
                    />
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Brand Identity</h3>
                        <p className="text-sm text-white/60">Uses Electric Vermilion (#F0421C) and cinematic dark tones.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
                        <p className="text-sm text-white/60">Driven by useCurrentFrame hook for frame-perfect rendering.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Modular Design</h3>
                        <p className="text-sm text-white/60">Components are isolated for easy maintenance and tweaking.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
