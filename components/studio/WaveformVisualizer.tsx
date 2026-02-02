"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WaveformVisualizerProps {
    isPlaying: boolean
    color?: string
    count?: number
    height?: number
    className?: string
}

export function WaveformVisualizer({
    isPlaying,
    color = "bg-primary",
    count = 24,
    height = 40,
    className
}: WaveformVisualizerProps) {
    const [bars, setBars] = useState<number[]>([])

    // Initialize bars
    useEffect(() => {
        setBars(Array.from({ length: count }, () => Math.random()))
    }, [count])

    return (
        <div className={cn("flex items-center justify-center gap-[2px] h-full w-full", className)}>
            {bars.map((_, i) => (
                <motion.div
                    key={i}
                    className={cn("w-1.5 rounded-full", color)}
                    style={{ height: "20%" }}
                    animate={{
                        height: isPlaying
                            ? [
                                `${20 + Math.random() * 30}%`,
                                `${40 + Math.random() * 60}%`,
                                `${20 + Math.random() * 30}%`
                            ]
                            : "20%"
                    }}
                    transition={{
                        duration: 0.5 + Math.random() * 0.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    )
}
