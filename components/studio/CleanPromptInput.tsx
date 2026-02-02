"use client"

import { Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CleanPromptInputProps {
    value: string
    onChange: (value: string) => void
    onEnhance?: () => void
    isEnhancing?: boolean
    placeholder?: string
    charCount?: number
    className?: string
}

/**
 * CleanPromptInput - Simple prompt textarea matching mockup
 * 
 * Mockup specs:
 * - Dark bg: rgba(255,255,255,0.05)
 * - Rounded corners: 12px
 * - Wand icon top-right
 * - Placeholder: "Describe your vision..."
 * - Simple, clean design
 */
export function CleanPromptInput({
    value,
    onChange,
    onEnhance,
    isEnhancing = false,
    placeholder = "Describe your vision...",
    charCount,
    className
}: CleanPromptInputProps) {
    return (
        <div className={cn("relative", className)}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full h-20 px-3 py-2.5 pr-10",
                    "bg-white/5 rounded-xl",
                    "border border-white/10 focus:border-primary/50",
                    "text-sm text-white placeholder:text-white/30",
                    "resize-none outline-none",
                    "transition-colors"
                )}
            />

            {/* Wand icon - top right */}
            {onEnhance && (
                <button
                    onClick={onEnhance}
                    disabled={!value.trim() || isEnhancing}
                    className={cn(
                        "absolute top-2.5 right-2.5",
                        "w-6 h-6 rounded-md",
                        "flex items-center justify-center",
                        "bg-purple-500/20 text-purple-400",
                        "hover:bg-purple-500/30 transition-colors",
                        "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                >
                    <Wand2 className={cn(
                        "w-3.5 h-3.5",
                        isEnhancing && "animate-pulse"
                    )} />
                </button>
            )}

            {/* Char count - bottom left */}
            {typeof charCount === "number" && (
                <div className="flex justify-between mt-1.5 text-[10px] text-white/25">
                    <span>{charCount} chars</span>
                    <span>⌘+Enter to generate</span>
                </div>
            )}
        </div>
    )
}
