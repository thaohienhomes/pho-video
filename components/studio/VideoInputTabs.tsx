"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VideoInputTabsProps {
    activeTab: "text" | "image"
    onTabChange: (tab: "text" | "image") => void
    className?: string
}

/**
 * VideoInputTabs - "Text to Video" / "Image to Video" tabs
 * 
 * Mockup specs:
 * - 2 tabs side by side
 * - Active: white text, subtle bg
 * - Inactive: gray text
 * - Compact styling
 */
export function VideoInputTabs({
    activeTab,
    onTabChange,
    className
}: VideoInputTabsProps) {
    return (
        <div className={cn("flex gap-4", className)}>
            <button
                onClick={() => onTabChange("text")}
                className={cn(
                    "text-sm font-medium transition-colors pb-1",
                    activeTab === "text"
                        ? "text-white border-b-2 border-primary"
                        : "text-white/40 hover:text-white/70"
                )}
            >
                Text to Video
            </button>
            <button
                onClick={() => onTabChange("image")}
                className={cn(
                    "text-sm font-medium transition-colors pb-1",
                    activeTab === "image"
                        ? "text-white border-b-2 border-primary"
                        : "text-white/40 hover:text-white/70"
                )}
            >
                Image to Video
            </button>
        </div>
    )
}
