"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

interface ComparisonSliderProps {
    beforeSrc: string
    afterSrc: string
    beforeLabel?: string
    afterLabel?: string
    className?: string
    aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3"
    defaultPosition?: number
}

/**
 * ComparisonSlider - Before/After image comparison
 * 
 * Specs from component-specs.md:
 * - Divider Width: 4px
 * - Divider Color: #FFFFFF
 * - Handle Size: 48px circle
 * - Handle Background: #0A0A0A with border
 * - Label Background: rgba(0, 0, 0, 0.60)
 * - Label Padding: 8px 16px
 * - Label Border Radius: 8px
 */
export function ComparisonSlider({
    beforeSrc,
    afterSrc,
    beforeLabel = "Before",
    afterLabel = "After",
    className,
    aspectRatio = "16:9",
    defaultPosition = 50
}: ComparisonSliderProps) {
    const [position, setPosition] = useState(defaultPosition)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const aspectRatioClass: Record<string, string> = {
        "16:9": "aspect-video",
        "9:16": "aspect-[9/16]",
        "1:1": "aspect-square",
        "4:3": "aspect-[4/3]"
    }

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setPosition(percentage)
    }, [])

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        handleMove(e.clientX)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        handleMove(e.touches[0].clientX)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove(e.clientX)
        }
        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) handleMove(e.touches[0].clientX)
        }
        const handleEnd = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("touchmove", handleTouchMove)
            window.addEventListener("mouseup", handleEnd)
            window.addEventListener("touchend", handleEnd)
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("touchmove", handleTouchMove)
            window.removeEventListener("mouseup", handleEnd)
            window.removeEventListener("touchend", handleEnd)
        }
    }, [isDragging, handleMove])

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-hidden rounded-[var(--pho-radius-xl)] select-none cursor-ew-resize",
                aspectRatioClass[aspectRatio],
                className
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* After Image (Full) */}
            <img
                src={afterSrc}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />

            {/* Before Image (Clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${position}%` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeLabel}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: `${containerRef.current?.offsetWidth || 100}px` }}
                    draggable={false}
                />
            </div>

            {/* Divider Line - 4px white */}
            <motion.div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
                animate={{ scale: isDragging ? 1.1 : 1 }}
            />

            {/* Handle - 48px circle */}
            <motion.div
                className={cn(
                    "absolute top-1/2 w-12 h-12 -translate-y-1/2",
                    "rounded-full bg-[#0A0A0A]",
                    "border-2 border-white",
                    "flex items-center justify-center",
                    "shadow-lg cursor-grab",
                    isDragging && "cursor-grabbing"
                )}
                style={{ left: `${position}%`, transform: "translate(-50%, -50%)" }}
                animate={{ scale: isDragging ? 1.15 : 1 }}
                whileHover={{ scale: 1.1 }}
            >
                <GripVertical className="w-5 h-5 text-white" />
            </motion.div>

            {/* Before Label */}
            <div
                className={cn(
                    "absolute top-4 left-4",
                    "px-4 py-2 rounded-[8px]",
                    "bg-black/60 backdrop-blur-sm",
                    "text-sm font-medium text-white"
                )}
            >
                {beforeLabel}
            </div>

            {/* After Label */}
            <div
                className={cn(
                    "absolute top-4 right-4",
                    "px-4 py-2 rounded-[8px]",
                    "bg-black/60 backdrop-blur-sm",
                    "text-sm font-medium text-white"
                )}
            >
                {afterLabel}
            </div>
        </div>
    )
}
