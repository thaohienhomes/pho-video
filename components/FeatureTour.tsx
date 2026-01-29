"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TourStep {
    target: string // CSS selector
    title: string
    description: string
    position?: "top" | "bottom" | "left" | "right"
}

interface FeatureTourProps {
    steps: TourStep[]
    onComplete?: () => void
    onSkip?: () => void
    isActive?: boolean
}

const TOUR_KEY = "pho_video_tour_completed_v1"

export function FeatureTour({
    steps,
    onComplete,
    onSkip,
    isActive = false,
}: FeatureTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [isVisible, setIsVisible] = useState(isActive)

    // Find target element and get position
    useEffect(() => {
        if (!isVisible || !steps[currentStep]) return

        const findTarget = () => {
            const target = document.querySelector(steps[currentStep].target)
            if (target) {
                const rect = target.getBoundingClientRect()
                setTargetRect(rect)
                // Scroll into view if needed
                target.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }

        // Delay to allow DOM to settle
        const timer = setTimeout(findTarget, 100)
        window.addEventListener("resize", findTarget)

        return () => {
            clearTimeout(timer)
            window.removeEventListener("resize", findTarget)
        }
    }, [currentStep, steps, isVisible])

    useEffect(() => {
        setIsVisible(isActive)
    }, [isActive])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = () => {
        localStorage.setItem(TOUR_KEY, "true")
        setIsVisible(false)
        onComplete?.()
    }

    const handleSkip = () => {
        localStorage.setItem(TOUR_KEY, "true")
        setIsVisible(false)
        onSkip?.()
    }

    if (!isVisible || !steps.length) return null

    const step = steps[currentStep]
    const position = step.position || "bottom"
    const isLastStep = currentStep === steps.length - 1

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect) return {}

        const padding = 12
        const tooltipWidth = 320

        switch (position) {
            case "top":
                return {
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                    bottom: window.innerHeight - targetRect.top + padding,
                }
            case "bottom":
                return {
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                    top: targetRect.bottom + padding,
                }
            case "left":
                return {
                    right: window.innerWidth - targetRect.left + padding,
                    top: targetRect.top + targetRect.height / 2 - 60,
                }
            case "right":
                return {
                    left: targetRect.right + padding,
                    top: targetRect.top + targetRect.height / 2 - 60,
                }
            default:
                return {}
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 pointer-events-none"
            >
                {/* Spotlight Overlay */}
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0,0,0,0.75)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Highlight Border */}
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute pointer-events-none"
                        style={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                        }}
                    >
                        <div className="w-full h-full rounded-xl border-2 border-primary shadow-[0_0_20px_rgba(240,66,28,0.5)] animate-pulse" />
                    </motion.div>
                )}

                {/* Tooltip */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute w-80 pointer-events-auto"
                    style={getTooltipStyle()}
                >
                    <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                                <p className="text-xs text-white/50">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <p className="text-sm text-white/70 leading-relaxed">
                                {step.description}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-2 p-4 pt-0">
                            {/* Progress Dots */}
                            <div className="flex items-center gap-1 flex-1">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all",
                                            i === currentStep
                                                ? "w-4 bg-primary"
                                                : i < currentStep
                                                    ? "bg-primary/50"
                                                    : "bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center gap-2">
                                {currentStep > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePrev}
                                        className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    className="h-8 bg-primary hover:bg-primary/90"
                                >
                                    {isLastStep ? "Done" : "Next"}
                                    {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// Default tour steps for the Studio
export const STUDIO_TOUR_STEPS: TourStep[] = [
    {
        target: "[data-tour='mode-selector']",
        title: "Choose Your Mode",
        description: "Switch between Video, Image, Audio, Upscale, Storyboard, and Magic modes.",
        position: "bottom",
    },
    {
        target: "[data-tour='prompt-input']",
        title: "Describe Your Vision",
        description: "Type what you want to create. Be descriptive for best results!",
        position: "bottom",
    },
    {
        target: "[data-tour='advanced-settings']",
        title: "Fine-tune Your Creation",
        description: "Access camera controls, model selection, and more advanced options.",
        position: "left",
    },
    {
        target: "[data-tour='generate-button']",
        title: "Generate!",
        description: "Click to bring your creation to life. Watch the magic happen!",
        position: "top",
    },
]

// Hook to manage tour state
export function useTour() {
    const [isActive, setIsActive] = useState(false)

    const startTour = () => setIsActive(true)
    const endTour = () => setIsActive(false)

    const hasTakenTour = () => {
        return localStorage.getItem(TOUR_KEY) === "true"
    }

    const resetTour = () => {
        localStorage.removeItem(TOUR_KEY)
    }

    return { isActive, startTour, endTour, hasTakenTour, resetTour }
}
