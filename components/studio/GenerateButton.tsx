"use client"

import { motion } from "framer-motion"
import { Sparkles, Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GenerateButtonProps {
    onClick?: () => void
    isLoading?: boolean
    disabled?: boolean
    cost?: string | number
    label?: string
    variant?: "primary" | "secondary"
    size?: "md" | "lg"
    className?: string
    icon?: "sparkles" | "play"
}

/**
 * GenerateButton - Pixel Perfect Implementation
 * 
 * Specs from component-specs.md:
 * - Width: 100%
 * - Height: 48px
 * - Border Radius: 9999px (full)
 * - Background: #F0421C
 * - Text: #FFFFFF, 16px, font-weight: 600
 * - Icon: 20px (Sparkles or Play)
 * - Cost Badge: 14px, margin-left 8px
 * - Animation: pulse-subtle on idle
 */
export function GenerateButton({
    onClick,
    isLoading = false,
    disabled = false,
    cost,
    label = "Generate",
    variant = "primary",
    size = "lg",
    className,
    icon = "sparkles"
}: GenerateButtonProps) {
    const isDisabled = disabled || isLoading

    const Icon = icon === "play" ? Play : Sparkles

    return (
        <motion.button
            onClick={onClick}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
            className={cn(
                // Pixel-perfect dimensions
                "relative w-full flex items-center justify-center gap-2",
                size === "lg" ? "h-[48px]" : "h-[40px]",
                "rounded-[var(--pho-radius-full)]",
                "font-semibold",
                size === "lg" ? "text-[16px]" : "text-[14px]",
                // Transitions
                "transition-all duration-[var(--pho-duration-normal)]",
                // Variant styles
                variant === "primary"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-[var(--pho-glass-medium)] text-[var(--pho-text-primary)] border border-[var(--pho-border-default)] hover:bg-[var(--pho-glass-light)]",
                // Disabled state
                isDisabled && "opacity-50 cursor-not-allowed",
                // Pulse animation when not loading
                !isLoading && variant === "primary" && "animate-pulse-subtle",
                className
            )}
            style={{
                boxShadow: variant === "primary" && !isDisabled
                    ? 'var(--pho-glow-primary)'
                    : 'none'
            }}
        >
            {/* Loading spinner */}
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Icon className={cn(
                    size === "lg" ? "w-5 h-5" : "w-4 h-4",
                    icon === "play" && "ml-0.5" // Optical alignment for play icon
                )} />
            )}

            {/* Label */}
            <span>{isLoading ? "Generating..." : label}</span>

            {/* Cost badge */}
            {cost && !isLoading && (
                <span className={cn(
                    "text-[14px] font-normal opacity-80",
                    "ml-1.5 px-2 py-0.5 rounded-full",
                    variant === "primary"
                        ? "bg-white/20"
                        : "bg-[var(--pho-glass-light)]"
                )}>
                    ~{cost}
                </span>
            )}
        </motion.button>
    )
}

/**
 * GenerateButtonCompact - Smaller version for inline use
 */
export function GenerateButtonCompact({
    onClick,
    isLoading = false,
    disabled = false,
    label = "Generate",
    className
}: Pick<GenerateButtonProps, 'onClick' | 'isLoading' | 'disabled' | 'label' | 'className'>) {
    return (
        <GenerateButton
            onClick={onClick}
            isLoading={isLoading}
            disabled={disabled}
            label={label}
            size="md"
            className={cn("w-auto px-6", className)}
        />
    )
}
