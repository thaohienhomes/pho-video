import { NextResponse } from 'next/server';

export async function GET() {
    // Mock Configuration Data
    // In the future, this could be fetched from a database or remote config service.

    const config = {
        models: [
            {
                id: "kling",
                name: "Kling AI",
                description: "Best for consistency & human motion",
                isPro: false,
                badge: "Popular"
            },
            {
                id: "luma",
                name: "Luma Dream Machine",
                description: "Fast generation, great for objects",
                isPro: false
            },
            {
                id: "runway_gen3",
                name: "Runway Gen-3",
                description: "Cinematic quality, high coherence",
                isPro: true,
                badge: "Premium"
            },
            {
                id: "ltx_video",
                name: "LTX Video",
                description: "Fastest generation speed",
                isPro: false
            },
            {
                id: "pho_cinematic",
                name: "Phở Cinematic",
                description: "High contrast, movie-like look",
                isPro: true,
                badge: "Exclusive"
            },
            {
                id: "pho_realistic",
                name: "Phở Realistic",
                description: "Photorealistic styling",
                isPro: true
            },
            {
                id: "pho_instant",
                name: "Phở Instant",
                description: "Generate in seconds",
                isPro: true,
                badge: "Super Fast"
            },
            {
                id: "hailuo",
                name: "Hailuo (MiniMax)",
                description: "Best for high dynamic motion",
                isPro: true
            }
        ],
        aspectRatios: [
            { id: "16:9", label: "16:9 Landscape", icon: "rectangle-horizontal" },
            { id: "9:16", label: "9:16 Portrait", icon: "rectangle-vertical" },
            { id: "1:1", label: "1:1 Square", icon: "square" },
            { id: "21:9", label: "21:9 Cinematic", icon: "monitor" }
        ],
        features: {
            enableUpscale: true,
            enableAudio: true,
            enableMotionControl: false // Coming soon
        }
    };

    return NextResponse.json(config);
}
