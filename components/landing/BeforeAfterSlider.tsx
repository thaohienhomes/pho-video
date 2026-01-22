"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import Image from "next/image"

export function BeforeAfterSlider() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [sliderPosition, setSliderPosition] = useState(50) // Percentage

    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.touches[0].clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }

    return (
        <section className="py-24 relative">
            <div className="max-w-5xl mx-auto px-6">
                {/* Section header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-sm font-medium uppercase tracking-widest text-primary/80 mb-3">
                        The Magic
                    </p>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white/90 mb-4">
                        From Static to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
                            Motion
                        </span>
                    </h2>
                    <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
                        Drag the slider to see the transformation.
                    </p>
                </motion.div>

                {/* Before/After Container */}
                <motion.div
                    ref={containerRef}
                    className="relative aspect-square sm:aspect-video rounded-3xl overflow-hidden cursor-ew-resize select-none"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{
                        boxShadow: "0 0 60px rgba(240, 66, 28, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}
                >
                    {/* "After" - Video (Bottom layer, full width) */}
                    <div className="absolute inset-0">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            {/* Using Pixabay CDN - Verified Working Ocean Waves */}
                            <source src="https://cdn.pixabay.com/video/2016/07/26/4006-176282263_large.mp4" type="video/mp4" />
                        </video>
                        {/* "After" Label */}
                        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                            <span className="text-sm font-medium text-green-400">Motion Video</span>
                        </div>
                    </div>

                    {/* "Before" - Static Image (Top layer, clipped) */}
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&q=80"
                            alt="Before - Static Image"
                            fill
                            className="object-cover grayscale"
                        />
                        {/* "Before" Label */}
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                            <span className="text-sm font-medium text-white/80">Static Image</span>
                        </div>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white/80 z-10"
                        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
                    >
                        {/* Drag handle circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-2xl flex items-center justify-center">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Gradient border overlay */}
                    <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
                </motion.div>

                {/* CTA below */}
                <motion.div
                    className="text-center mt-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <a
                        href="/studio"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-primary hover:border-primary text-white font-medium transition-all duration-500"
                    >
                        Start Creating for $0
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
