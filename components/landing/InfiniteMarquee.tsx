"use client"

import { motion } from "framer-motion"
import Image from "next/image"

// Video showcase items - using high-quality thumbnails
const MARQUEE_ITEMS = [
    // Row 1 (Left to Right)
    [
        { id: "1", title: "Cinematic Drone", thumbnail: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80", prompt: "Aerial cinematic footage", video: "/videos/showcase_0001.mp4" },
        { id: "2", title: "Cyberpunk Reveal", thumbnail: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&q=80", prompt: "Neon city futuristic transition", video: "/videos/showcase_0002.mp4" },
        { id: "3", title: "Nature Loop", thumbnail: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80", prompt: "Seamless calm nature scene", video: "/videos/showcase_0003.mp4" },
        { id: "4", title: "Macro Details", thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80", prompt: "Extreme close up texture", video: "/videos/showcase_0004.mp4" },
        { id: "5", title: "Liquid Physics", thumbnail: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80", prompt: "Satisfying fluid simulation", video: "/videos/showcase_0005.mp4" },
        { id: "6", title: "Urban Flow", thumbnail: "https://images.unsplash.com/photo-1449824913929-2b3d14b8ba48?w=400&q=80", prompt: "City life timelapse", video: "/videos/showcase_0006.mp4" },
    ],
    // Row 2 (Right to Left)
    [
        { id: "7", title: "Abstract Motion", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80", prompt: "Abstract 3D motion art", video: "/videos/showcase_0007.mp4" },
        { id: "8", title: "High Fashion", thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80", prompt: "Runway fashion showcase", video: "/videos/showcase_0008.mp4" },
        { id: "9", title: "Futuristic Tech", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", prompt: "Future technology reveal", video: "/videos/showcase_0009.mp4" },
        { id: "10", title: "Viral Dance", thumbnail: "https://images.unsplash.com/photo-1535525266638-c5f768b8d3ea?w=400&q=80", prompt: "Trending dance choreography", video: "/videos/showcase_0010.mp4" },
        { id: "11", title: "Morning Vibes", thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", prompt: "Cozy morning atmosphere", video: "/videos/showcase_0011.mp4" },
        { id: "12", title: "Neon Lights", thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80", prompt: "Bright neon signs cinematic", video: "/videos/showcase_0012.mp4" },
    ],
    // Row 3 (Left to Right)
    [
        { id: "13", title: "Space Journey", thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80", prompt: "Deep space cinematic travel", video: "/videos/showcase_0013.mp4" },
        { id: "14", title: "Anime Style", thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80", prompt: "Japanese animation style", video: "/videos/showcase_0014.mp4" },
        { id: "15", title: "Product Commercial", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", prompt: "Professional product ad", video: "/videos/showcase_0015.mp4" },
        { id: "16", title: "Epic Landscape", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", prompt: "Wide angle nature shot", video: "/videos/showcase_0016.mp4" },
        { id: "17", title: "Slow Motion", thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", prompt: "High frame rate action", video: "/videos/showcase_0017.mp4" },
        { id: "18", title: "Character Reveal", thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", prompt: "Detailed character portrait", video: "/videos/showcase_0018.mp4" },
    ],
]

function MarqueeRow({ items, direction = "left", speed = 30 }: {
    items: typeof MARQUEE_ITEMS[0],
    direction?: "left" | "right",
    speed?: number
}) {
    // Duplicate items for seamless loop
    const duplicatedItems = [...items, ...items, ...items]

    return (
        <div className="relative overflow-hidden py-3">
            <motion.div
                className="flex gap-4"
                animate={{
                    x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
                }}
                transition={{
                    x: {
                        duration: speed,
                        repeat: Infinity,
                        ease: "linear"
                    }
                }}
            >
                {duplicatedItems.map((item, index) => (
                    <motion.div
                        key={`${item.id}-${index}`}
                        className="relative flex-shrink-0 w-60 sm:w-72 h-36 sm:h-44 rounded-2xl overflow-hidden cursor-pointer group"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {/* Thumbnail */}
                        <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />

                        {/* Video Layer (Always Play) */}
                        {item.video && (
                            <div className="absolute inset-0 z-10 bg-black">
                                <video
                                    src={item.video}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Vermilion glow on hover */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            initial={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
                            whileHover={{
                                boxShadow: "inset 0 0 0 2px rgba(240, 66, 28, 0.6), 0 0 30px rgba(240, 66, 28, 0.4)"
                            }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                            <p className="text-xs text-white/60 line-clamp-1">{item.prompt}</p>
                        </div>

                        {/* Play icon on hover */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white fill-white ml-1" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

export function InfiniteMarquee() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mb-12">
                {/* Section header */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-sm font-medium uppercase tracking-widest text-primary/80 mb-3">
                        Showcase
                    </p>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white/90 mb-4">
                        See What&apos;s{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
                            Possible
                        </span>
                    </h2>
                    <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
                        Endless inspiration. Hover to explore.
                    </p>
                </motion.div>
            </div>

            {/* Marquee Rows */}
            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                {/* Row 1: Left to Right */}
                <MarqueeRow items={MARQUEE_ITEMS[0]} direction="left" speed={45} />

                {/* Row 2: Right to Left (opposite) */}
                <MarqueeRow items={MARQUEE_ITEMS[1]} direction="right" speed={35} />

                {/* Row 3: Left to Right */}
                <MarqueeRow items={MARQUEE_ITEMS[2]} direction="left" speed={50} />
            </motion.div>

            {/* Fade edges */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none z-10" />
        </section>
    )
}
