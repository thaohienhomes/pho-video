"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Play, Sparkles } from "lucide-react"

// Fake live activity data for FOMO effect
const LIVE_ACTIVITIES = [
    { name: "Alex", action: "just generated a Cyberpunk City flyover" },
    { name: "Minh", action: "created an Epic Mountain Sunrise" },
    { name: "Sarah", action: "rendered a Product Ad in 8 seconds" },
    { name: "Tuấn", action: "exported a 4K Anime Character" },
    { name: "Emma", action: "generated a Cinematic Car Chase" },
]

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentActivity, setCurrentActivity] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Scroll-based animations
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    // Smoother spring physics for scroll
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    // Transform values for the "portal opening" effect
    // Flatten the tilt on mobile for performance/UX
    const rotateX = useTransform(smoothProgress, [0, 0.5], [isMobile ? 5 : 15, 0])
    const scale = useTransform(smoothProgress, [0, 0.5], [0.9, 1.05])
    const opacity = useTransform(smoothProgress, [0, 0.3], [1, 0.8])
    const y = useTransform(smoothProgress, [0, 0.5], [0, isMobile ? -50 : -100])

    // Cycle through live activities
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentActivity((prev) => (prev + 1) % LIVE_ACTIVITIES.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section ref={containerRef} className="relative min-h-[120vh] flex flex-col items-center justify-start pt-32 pb-20 overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Orb 1 - Vermilion */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(240,66,28,0.15) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                {/* Orb 2 - Purple */}
                <motion.div
                    className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                    animate={{
                        x: [0, -80, 60, 0],
                        y: [0, 80, -40, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                {/* Orb 3 - Cyan accent */}
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                    animate={{
                        x: [0, 60, -30, 0],
                        y: [0, -30, 60, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Typography Section - Positioned HIGH */}
            <motion.div
                className="text-center max-w-4xl mx-auto px-6 mb-12 sm:mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Main Headline - Clean & Elegant */}
                <h1 className="text-4xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-white/90 mb-6 leading-[1.1]">
                    Dream it.{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F0421C] to-purple-500">
                        Type it.
                    </span>{" "}
                    Watch it.
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-xl text-white/60 font-light max-w-2xl mx-auto mb-10 px-4">
                    The world&apos;s most powerful AI Video Studio. Generate cinematic videos from a single prompt.
                </p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <SignedOut>
                        <SignUpButton mode="modal">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 hover:bg-primary hover:border-primary text-white px-8 py-6 text-lg rounded-xl transition-all duration-500 font-medium"
                            >
                                <Play className="mr-2 w-5 h-5 fill-current" />
                                Start Creating Free
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/studio" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-primary hover:border-primary text-white px-8 py-6 text-lg rounded-xl transition-all duration-500 font-medium"
                            >
                                <Sparkles className="mr-2 w-5 h-5" />
                                Open Studio
                            </Button>
                        </Link>
                    </SignedIn>
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* THE FLOATING PORTAL - 3D Glass Container */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
                className="relative w-full max-w-4xl mx-auto px-6"
                style={{
                    perspective: "1000px",
                    y,
                    opacity,
                }}
            >
                <motion.div
                    className="relative mx-auto rounded-3xl overflow-hidden"
                    style={{
                        rotateX,
                        scale,
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Glass Container with Inner Glow */}
                    <div
                        className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
                        style={{
                            boxShadow: `
                                0 0 50px rgba(240, 66, 28, 0.4),
                                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                                inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                            `,
                        }}
                    >
                        {/* The Hero Video */}
                        <div className="relative aspect-video">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                                poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80"
                            >
                                {/* Local Hero Video - Google Veo */}
                                <source src="/videos/hero-main.mp4" type="video/mp4" />
                            </video>

                            {/* Subtle inner gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

                            {/* Corner accent lines */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/20" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/20" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/20" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/20" />
                        </div>

                        {/* Bottom bar with model info */}
                        <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm text-white/60">Generated with Google Veo</span>
                            </div>
                            <span className="text-sm text-white/40">10 seconds • 1080p</span>
                        </div>
                    </div>

                    {/* Floating reflection */}
                    <div
                        className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 to-transparent blur-2xl opacity-50"
                    />
                </motion.div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* LIVE ACTIVITY PILL - FOMO Effect */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <motion.div
                className="fixed bottom-6 left-6 z-40"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
            >
                <motion.div
                    key={currentActivity}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl"
                >
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                            {LIVE_ACTIVITIES[currentActivity].name.charAt(0)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-white/80 font-medium">
                            {LIVE_ACTIVITIES[currentActivity].name}
                        </span>
                        <span className="text-xs text-white/50">
                            {LIVE_ACTIVITIES[currentActivity].action}
                        </span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                className="flex flex-wrap items-center justify-center gap-6 md:gap-16 mt-20 text-center px-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
            >
                <div className="flex-1 min-w-[100px]">
                    <div className="text-2xl md:text-4xl font-semibold text-white/90">50K+</div>
                    <div className="text-xs md:text-sm text-white/40 font-light">Videos Created</div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/10" />
                <div className="flex-1 min-w-[100px]">
                    <div className="text-2xl md:text-4xl font-semibold text-white/90">4.9★</div>
                    <div className="text-xs md:text-sm text-white/40 font-light">User Rating</div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/10" />
                <div className="flex-1 min-w-[100px]">
                    <div className="text-2xl md:text-4xl font-semibold text-white/90">&lt;10s</div>
                    <div className="text-xs md:text-sm text-white/40 font-light">Render Time</div>
                </div>
            </motion.div>
        </section>
    )
}
