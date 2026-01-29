"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles,
    Film,
    Zap,
    Gift,
    ChevronRight,
    ChevronLeft,
    X,
    Wand2,
    ImageIcon,
    Music,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

const ONBOARDING_KEY = "pho_video_onboarded_v1"
const STARTER_CREDITS = 50000 // 50K starter credits

interface WelcomeModalProps {
    onComplete?: () => void
    forceShow?: boolean
}

const STEPS = [
    {
        id: "welcome",
        icon: Sparkles,
        title: "Welcome to Phở Video",
        subtitle: "AI-powered video creation at your fingertips",
        description: "Create stunning videos, images, and audio with the power of AI. From text to cinematic masterpieces in seconds.",
        gradient: "from-primary via-orange-500 to-amber-500",
        features: [
            { icon: Film, label: "Text-to-Video" },
            { icon: ImageIcon, label: "Image Generation" },
            { icon: Music, label: "AI Music & TTS" },
        ]
    },
    {
        id: "features",
        icon: Wand2,
        title: "Powerful Features",
        subtitle: "Everything you need to create",
        description: "Access multiple AI models, camera controls, upscaling, and more. All in one beautiful workspace.",
        gradient: "from-blue-500 via-indigo-500 to-purple-500",
        features: [
            { icon: Zap, label: "Instant Preview" },
            { icon: Film, label: "Motion Controls" },
            { icon: Sparkles, label: "Magic Prompt" },
        ]
    },
    {
        id: "credits",
        icon: Gift,
        title: "Free Starter Credits",
        subtitle: "Start creating today",
        description: `You've received ${(STARTER_CREDITS / 1000).toFixed(0)}K free credits to explore all features. Create videos, images, and more!`,
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        highlight: true,
        creditsAmount: STARTER_CREDITS,
    },
]

export function WelcomeModal({ onComplete, forceShow }: WelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    // Check if first visit
    useEffect(() => {
        if (forceShow) {
            setIsOpen(true)
            return
        }

        const hasOnboarded = localStorage.getItem(ONBOARDING_KEY)
        if (!hasOnboarded) {
            setIsOpen(true)
        }
    }, [forceShow])

    // Trigger confetti on credits step
    useEffect(() => {
        if (currentStep === 2 && isOpen) {
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#F0421C", "#FF6B35", "#FFD93D", "#6BCB77"]
                })
            }, 300)
        }
    }, [currentStep, isOpen])

    const handleNext = () => {
        if (isAnimating) return

        if (currentStep < STEPS.length - 1) {
            setIsAnimating(true)
            setCurrentStep(prev => prev + 1)
            setTimeout(() => setIsAnimating(false), 300)
        } else {
            handleComplete()
        }
    }

    const handlePrev = () => {
        if (isAnimating || currentStep === 0) return
        setIsAnimating(true)
        setCurrentStep(prev => prev - 1)
        setTimeout(() => setIsAnimating(false), 300)
    }

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, "true")
        setIsOpen(false)
        onComplete?.()
    }

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, "true")
        setIsOpen(false)
    }

    if (!isOpen) return null

    const step = STEPS[currentStep]
    const StepIcon = step.icon
    const isLastStep = currentStep === STEPS.length - 1

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-[#0A0A0A] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                >
                    {/* Close/Skip Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Animated Gradient Header */}
                    <div className={cn(
                        "relative h-48 bg-gradient-to-br",
                        step.gradient
                    )}>
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_40%)]" />
                        </div>

                        {/* Icon */}
                        <motion.div
                            key={step.id}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                                <StepIcon className="w-12 h-12 text-white" />
                            </div>
                        </motion.div>

                        {/* Credits Amount (on credits step) */}
                        {step.creditsAmount && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm"
                            >
                                <span className="text-2xl font-bold text-white">
                                    🎁 {(step.creditsAmount / 1000).toFixed(0)}K Credits
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold text-white text-center">
                                    {step.title}
                                </h2>
                                <p className="text-primary text-center mt-1 font-medium">
                                    {step.subtitle}
                                </p>
                                <p className="text-white/60 text-center mt-3 leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Feature Icons */}
                                {step.features && (
                                    <div className="flex items-center justify-center gap-4 mt-6">
                                        {step.features.map((feature, i) => (
                                            <motion.div
                                                key={feature.label}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <feature.icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-xs text-white/50">{feature.label}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Dots */}
                        <div className="flex items-center justify-center gap-2 pt-4">
                            {STEPS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentStep(i)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i === currentStep
                                            ? "w-6 bg-primary"
                                            : "bg-white/20 hover:bg-white/30"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            {currentStep > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrev}
                                    className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                            )}

                            <Button
                                onClick={handleNext}
                                className={cn(
                                    "flex-1",
                                    isLastStep
                                        ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400"
                                        : "bg-primary hover:bg-primary/90"
                                )}
                            >
                                {isLastStep ? (
                                    <>
                                        Get Started
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// Hook to check onboarding status
export function useOnboardingStatus() {
    const [hasOnboarded, setHasOnboarded] = useState(true) // default true to prevent flash

    useEffect(() => {
        const status = localStorage.getItem(ONBOARDING_KEY)
        setHasOnboarded(!!status)
    }, [])

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY)
        setHasOnboarded(false)
    }

    return { hasOnboarded, resetOnboarding }
}
