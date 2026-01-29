"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

const TOAST_KEY = "pho_video_starter_credits_shown"

interface StarterCreditsToastProps {
    credits?: number
    onClose?: () => void
    forceShow?: boolean
}

export function StarterCreditsToast({
    credits = 50000,
    onClose,
    forceShow,
}: StarterCreditsToastProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (forceShow) {
            setIsVisible(true)
            triggerCelebration()
            return
        }

        // Check if already shown
        const hasShown = localStorage.getItem(TOAST_KEY)
        if (!hasShown) {
            // Delay to appear after welcome modal
            const timer = setTimeout(() => {
                setIsVisible(true)
                localStorage.setItem(TOAST_KEY, "true")
                triggerCelebration()
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [forceShow])

    const triggerCelebration = () => {
        // Multiple confetti bursts
        const count = 200
        const defaults = {
            origin: { y: 0.7 },
            colors: ["#F0421C", "#FF6B35", "#FFD93D", "#6BCB77", "#4ECDC4"],
        }

        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
    }

    const handleClose = () => {
        setIsVisible(false)
        onClose?.()
    }

    // Auto-hide after 8 seconds
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(handleClose, 8000)
            return () => clearTimeout(timer)
        }
    }, [isVisible])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Animated Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/10 to-primary/20 animate-pulse" />

                        {/* Sparkle Effects */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                    }}
                                    className="absolute"
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${10 + (i % 3) * 30}%`,
                                    }}
                                >
                                    <Sparkles className="w-3 h-3 text-primary/50" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="relative p-4 flex items-start gap-4">
                            {/* Icon */}
                            <motion.div
                                initial={{ rotate: -30 }}
                                animate={{ rotate: [0, 10, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg"
                            >
                                <Gift className="w-7 h-7 text-white" />
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1 pt-1">
                                <h4 className="text-lg font-bold text-white">
                                    🎉 Welcome Gift!
                                </h4>
                                <p className="text-sm text-white/60 mt-1">
                                    You've received{" "}
                                    <span className="font-bold text-primary">
                                        {(credits / 1000).toFixed(0)}K credits
                                    </span>{" "}
                                    to start creating!
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar (auto-dismiss indicator) */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 8, ease: "linear" }}
                            className="h-1 bg-gradient-to-r from-primary to-orange-500"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
