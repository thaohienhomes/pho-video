"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Sparkles, ArrowRight } from "lucide-react"

// Inspiration examples with prompts and video URLs
const INSPIRATION_DATA = [
    {
        id: "1",
        category: "Cinematic",
        categoryKey: "tab_cinematic",
        prompt: "A lone astronaut walking across a vast Martian desert at sunset, cinematic lighting, dust particles floating in the air, dramatic shadows, 4K quality",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
        span: "large", // large = spans 2 columns
    },
    {
        id: "2",
        category: "Marketing",
        categoryKey: "tab_product",
        prompt: "Luxury perfume bottle rotating slowly on a marble surface, soft bokeh lights in background, golden hour lighting, premium product shot",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
        span: "normal",
    },
    {
        id: "3",
        category: "Anime",
        categoryKey: "tab_character",
        prompt: "Anime girl with flowing pink hair running through a cherry blossom forest, Studio Ghibli style, magical particles, dreamy atmosphere",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
        span: "normal",
    },
    {
        id: "4",
        category: "Social Media",
        categoryKey: "tab_social",
        prompt: "Trendy coffee being poured into a glass cup with ice, slow motion splash, aesthetic cafe vibes, warm tones, vertical format for Reels",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
        span: "normal",
    },
    {
        id: "5",
        category: "Cinematic",
        categoryKey: "tab_cinematic",
        prompt: "Drone shot flying through foggy mountains at dawn, revealing a hidden temple, epic orchestral mood, cinematic color grading",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
        span: "normal",
    },
    {
        id: "6",
        category: "Marketing",
        categoryKey: "tab_product",
        prompt: "Sleek electric car driving through a futuristic city at night, neon reflections on wet streets, cyberpunk aesthetic, high-end automotive commercial",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnail: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&q=80",
        span: "large",
    },
    {
        id: "7",
        category: "Anime",
        categoryKey: "tab_character",
        prompt: "Epic anime battle scene with lightning effects, two samurai clashing swords, dynamic camera movement, intense energy aura",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600&q=80",
        span: "normal",
    },
    {
        id: "8",
        category: "Social Media",
        categoryKey: "tab_social",
        prompt: "Satisfying ASMR slime being stretched and squeezed, pastel colors, soft lighting, calming aesthetic, TikTok vertical format",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        span: "normal",
    },
]

const CATEGORIES = [
    { label: "tab_all", value: "All" },
    { label: "tab_cinematic", value: "Cinematic" },
    { label: "tab_product", value: "Marketing" },
    { label: "tab_character", value: "Anime" },
    { label: "tab_social", value: "Social Media" }
]

interface InspirationCardProps {
    item: typeof INSPIRATION_DATA[0]
}

function InspirationCard({ item }: InspirationCardProps) {
    const t = useTranslations("landing.showcase")
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Card
            className={`group relative overflow-hidden rounded-2xl border-white/10 bg-card/30 cursor-pointer transition-all duration-500 ${item.span === "large" ? "md:col-span-2 md:row-span-2" : ""
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail / Video */}
            <div className="relative w-full h-full min-h-[200px] md:min-h-[280px]">
                {/* Thumbnail */}
                <img
                    src={item.thumbnail}
                    alt={item.prompt.substring(0, 50)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"
                        }`}
                />

                {/* Video (plays on hover) */}
                {isHovered && (
                    <video
                        src={item.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Play indicator */}
                <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"
                    }`}>
                    <Play className="w-3 h-3 text-white fill-white" />
                    <span className="text-xs text-white font-medium">{t("hover_to_play")}</span>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
                    <span className="text-xs text-white font-bold">{t(item.categoryKey as any)}</span>
                </div>

                {/* Glassmorphism overlay with prompt */}
                <div className={`absolute inset-x-0 bottom-0 glass-panel border-t border-white/10 transform transition-all duration-500 ease-out ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}>
                    <div className="p-4 md:p-6">
                        <p className="text-sm text-white/90 line-clamp-3 mb-4">
                            <span className="text-primary font-semibold">Prompt: </span>
                            {item.prompt}
                        </p>
                        <Link href={`/studio?prompt=${encodeURIComponent(item.prompt)}`}>
                            <Button className="w-full btn-vermilion glow-vermilion-sm">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t("try_style")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
        </Card>
    )
}

export function InspirationGallery() {
    const t = useTranslations("landing.showcase")
    const [activeCategory, setActiveCategory] = useState("All")

    const filteredItems = activeCategory === "All"
        ? INSPIRATION_DATA
        : INSPIRATION_DATA.filter(item => item.category === activeCategory)

    return (
        <section id="gallery" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        {t.rich('title', {
                            span: (chunks) => <span className="text-gradient-vermilion">{chunks}</span>
                        })}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => setActiveCategory(category.value)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category.value
                                ? "bg-primary text-white glow-vermilion-sm"
                                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {t(category.label as any)}
                        </button>
                    ))}
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
                    {filteredItems.map((item) => (
                        <InspirationCard key={item.id} item={item} />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">
                        {t("cta_text")}
                    </p>
                    <Link href="/studio">
                        <Button size="lg" className="btn-vermilion glow-vermilion">
                            <Sparkles className="w-5 h-5 mr-2" />
                            {t("cta_button")}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
