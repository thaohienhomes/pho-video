"use client"

import { motion } from "framer-motion"
import Image from "next/image"

// Video showcase items - using high-quality thumbnails
const MARQUEE_ITEMS = [
    // Row 1 (Left to Right)
    [
        { id: "1", title: "Cyberpunk City", thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80", prompt: "Neon-lit cyberpunk cityscape at night" },
        { id: "2", title: "Ocean Waves", thumbnail: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80", prompt: "Cinematic ocean waves crashing" },
        { id: "3", title: "Forest Path", thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80", prompt: "Misty forest with sun rays" },
        { id: "4", title: "Mountain Peak", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", prompt: "Epic mountain sunrise timelapse" },
        { id: "5", title: "City Traffic", thumbnail: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&q=80", prompt: "Urban traffic light trails" },
    ],
    // Row 2 (Right to Left)
    [
        { id: "6", title: "Aurora Sky", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80", prompt: "Northern lights dancing" },
        { id: "7", title: "Desert Dunes", thumbnail: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80", prompt: "Golden desert dunes at sunset" },
        { id: "8", title: "Rainy Street", thumbnail: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&q=80", prompt: "Moody rainy city street" },
        { id: "9", title: "Space Galaxy", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80", prompt: "Deep space galaxy formation" },
        { id: "10", title: "Waterfall", thumbnail: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80", prompt: "Majestic waterfall slow motion" },
    ],
    // Row 3 (Left to Right)
    [
        { id: "11", title: "Neon Signs", thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80", prompt: "Tokyo neon signs at night" },
        { id: "12", title: "Sunset Beach", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", prompt: "Tropical beach sunset panorama" },
        { id: "13", title: "Snow Mountain", thumbnail: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400&q=80", prompt: "Snowy mountain peak aerial" },
        { id: "14", title: "City Skyline", thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80", prompt: "Modern city skyline timelapse" },
        { id: "15", title: "Autumn Forest", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", prompt: "Colorful autumn forest flyover" },
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
                className="space-y-4"
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
