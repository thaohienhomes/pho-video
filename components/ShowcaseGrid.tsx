"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Sparkles, Wand2 } from "lucide-react"
import { formatPhoPoints } from "@/lib/pho-points"
import { SHOWCASE_ITEMS } from "@/data/showcase"
import Image from "next/image"

interface ShowcaseCardProps {
    item: typeof SHOWCASE_ITEMS[0]
    className?: string
}

function ShowcaseCard({ item, className = "" }: ShowcaseCardProps) {
    const t = useTranslations("landing.showcase")
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()

    const handleTryStyle = () => {
        // Encode the prompt and model for URL
        const params = new URLSearchParams({
            prompt: item.prompt,
            model: item.model,
        })

        // Navigate to studio with prefilled data
        router.push(`/studio?${params.toString()}`)
    }

    // Determine if this is a large/featured card based on class name for internal logic
    const isLarge = className.includes("row-span-2")

    return (
        <Card
            className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out
                bg-black/40 backdrop-blur-md border border-white/10 
                hover:border-primary/50 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/20 hover:z-10
                ${className}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Video/Image */}
            <div className="absolute inset-0 transition-opacity duration-500">
                {/* Thumbnail */}
                <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className={`object-cover transition-all duration-700 ${isHovered ? "opacity-0 scale-110" : "opacity-100 scale-100"
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
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-6">
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-xs font-semibold text-primary">
                        {t(item.id + ".category" as any, { fallback: item.category })}
                    </span>
                </div>

                {/* Model & Credits Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/70">
                        {item.model}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-xs font-bold text-primary">
                        {formatPhoPoints(item.credits)} pts
                    </span>
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                    <h3 className={`font-bold text-white mb-2 font-heading ${isLarge ? "text-2xl" : "text-lg"}`}>
                        {t(item.id + ".title" as any, { fallback: item.title })}
                    </h3>
                    <p className={`text-white/70 line-clamp-2 ${isLarge ? "text-base" : "text-sm"}`}>
                        {t(item.id + ".description" as any, { fallback: item.description })}
                    </p>
                </div>

                {/* Prompt Preview (shown on hover) */}
                <div className={`overflow-hidden transition-all duration-500 ${isHovered ? "max-h-24 opacity-100 mb-4" : "max-h-0 opacity-0"
                    }`}>
                    <p className="text-xs text-white/60 line-clamp-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-primary font-semibold">Prompt: </span>
                        {item.prompt}
                    </p>
                </div>

                {/* CTA Button (centered on hover) */}
                <div className={`transition-all duration-500 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}>
                    <Button
                        onClick={handleTryStyle}
                        className="w-full btn-vermilion glow-vermilion-sm h-12 text-base font-semibold"
                    >
                        <Wand2 className="w-5 h-5 mr-2" />
                        {t("try_style")}
                    </Button>
                </div>

                {/* Play indicator (default state) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? "opacity-0 scale-75" : "opacity-100 scale-100"
                    }`}>
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                </div>
            </div>
        </Card>
    )
}

export function ShowcaseGrid() {
    const t = useTranslations("landing.showcase")
    const [activeCategory, setActiveCategory] = useState("All")

    // Categories mapping for translation
    const categoryMapping: Record<string, string> = {
        "All": "tab_all",
        "Product Ads": "tab_product",
        "Cinematic": "tab_cinematic",
        "Animation": "tab_character",
        "Architecture": "tab_social" // Reusing social for architecture if not defined
    }

    const CATEGORIES = ["All", ...Array.from(new Set(SHOWCASE_ITEMS.map(item => item.category)))]

    const filteredItems = activeCategory === "All"
        ? SHOWCASE_ITEMS
        : SHOWCASE_ITEMS.filter(item => item.category === activeCategory)

    return (
        <section id="showcase" className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Showcase</span>
                    </div>
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
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                                ? "bg-primary text-white glow-vermilion-sm"
                                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                                }`}
                        >
                            {t(categoryMapping[category] as any, { fallback: category })}
                        </button>
                    ))}
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] gap-4 grid-flow-dense">
                    {filteredItems.map((item, index) => {
                        // Dynamic Bento Pattern
                        let spanClass = "col-span-1 row-span-1"

                        if (activeCategory === "All") {
                            const patternIndex = index % 10
                            if (patternIndex === 0) spanClass = "md:col-span-2 md:row-span-2" // Large Square
                            else if (patternIndex === 1) spanClass = "md:col-span-1 md:row-span-1"
                            else if (patternIndex === 2) spanClass = "md:col-span-1 md:row-span-2" // Tall
                            else if (patternIndex === 5) spanClass = "md:col-span-2 md:row-span-1" // Wide
                            else if (patternIndex === 6) spanClass = "md:col-span-2 md:row-span-1" // Wide
                        }

                        return (
                            <ShowcaseCard
                                key={item.id}
                                item={item}
                                className={spanClass}
                            />
                        )
                    })}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">{t("no_results")}</p>
                    </div>
                )}
            </div>
        </section>
    )
}
