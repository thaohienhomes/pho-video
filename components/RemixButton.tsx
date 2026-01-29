"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Copy, Check, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface RemixButtonProps {
    prompt: string
    authorName?: string
    authorId?: string
    videoId?: string
    variant?: "default" | "compact" | "icon"
    className?: string
}

export function RemixButton({
    prompt,
    authorName,
    authorId,
    videoId,
    variant = "default",
    className,
}: RemixButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const router = useRouter()

    const handleRemix = () => {
        setIsAnimating(true)
        setShowCopied(true)

        // Copy prompt to clipboard
        navigator.clipboard.writeText(prompt)

        // Track remix (optional)
        if (videoId) {
            fetch("/api/community/remix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId }),
            }).catch(() => { })
        }

        // Redirect to studio with prompt after animation
        setTimeout(() => {
            setIsAnimating(false)
            // Navigate to studio with prompt in URL
            const encodedPrompt = encodeURIComponent(prompt)
            router.push(`/studio?prompt=${encodedPrompt}&remixFrom=${authorId || ""}`)
        }, 800)

        setTimeout(() => setShowCopied(false), 2000)
    }

    if (variant === "icon") {
        return (
            <motion.button
                onClick={handleRemix}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "p-2 rounded-lg hover:bg-primary/10 transition-colors",
                    className
                )}
            >
                <motion.div
                    animate={isAnimating ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
            </motion.button>
        )
    }

    if (variant === "compact") {
        return (
            <motion.button
                onClick={handleRemix}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors",
                    className
                )}
            >
                <motion.div
                    animate={isAnimating ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
                {showCopied ? "Copied!" : "Remix"}
            </motion.button>
        )
    }

    return (
        <motion.div className={cn("relative", className)}>
            <Button
                onClick={handleRemix}
                className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400"
            >
                <motion.div
                    animate={isAnimating ? { rotate: 360, scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.6 }}
                    className="mr-2"
                >
                    <Sparkles className="w-4 h-4" />
                </motion.div>
                {showCopied ? (
                    <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied! Opening Studio...
                    </>
                ) : (
                    "Remix This Video"
                )}
            </Button>

            {/* Author Credit */}
            {authorName && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/50"
                >
                    <span>Original by</span>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="text-white/70">{authorName}</span>
                    </div>
                </motion.div>
            )}

            {/* Success Animation Overlay */}
            {isAnimating && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, scale: 0 }}
                            animate={{
                                opacity: 0,
                                scale: 2,
                                x: Math.cos((i * Math.PI) / 4) * 40,
                                y: Math.sin((i * Math.PI) / 4) * 40,
                            }}
                            transition={{ duration: 0.6, delay: i * 0.03 }}
                            className="absolute"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    )
}
