"use client"

import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "sidebar" | "dock"
    withBorder?: boolean
    withGlow?: boolean
    glowColor?: string
}

/**
 * GlassPanel - Pixel Perfect Glassmorphism Component
 * 
 * Specs from component-specs.md:
 * - Background: rgba(255, 255, 255, 0.05)
 * - Backdrop Filter: blur(24px)
 * - Border: 1px solid rgba(255, 255, 255, 0.10)
 * - Border Radius: 16px
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(({
    className,
    variant = "default",
    withBorder = true,
    withGlow = false,
    glowColor,
    children,
    ...props
}, ref) => {
    const variantStyles = {
        default: cn(
            "bg-[var(--pho-glass-light)]",
            "backdrop-blur-[var(--pho-blur-lg)]",
            "rounded-[var(--pho-radius-xl)]"
        ),
        elevated: cn(
            "bg-[var(--pho-glass-medium)]",
            "backdrop-blur-[var(--pho-blur-xl)]",
            "rounded-[var(--pho-radius-xl)]",
            "shadow-[var(--pho-shadow-lg)]"
        ),
        sidebar: cn(
            "bg-[var(--pho-bg-base)]",
            "backdrop-blur-[var(--pho-blur-2xl)]",
            "rounded-none"
        ),
        dock: cn(
            "bg-[var(--pho-glass-light)]",
            "backdrop-blur-[var(--pho-blur-lg)]",
            "rounded-t-[var(--pho-radius-xl)]"
        )
    }

    return (
        <div
            ref={ref}
            className={cn(
                variantStyles[variant],
                withBorder && "border border-[var(--pho-border-default)]",
                className
            )}
            style={{
                boxShadow: withGlow && glowColor
                    ? `0 0 40px ${glowColor}`
                    : undefined
            }}
            {...props}
        >
            {children}
        </div>
    )
})

GlassPanel.displayName = "GlassPanel"

/**
 * GlassCard - Card variant of GlassPanel
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassPanelProps>(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <GlassPanel
            ref={ref}
            className={cn("p-4", className)}
            {...props}
        >
            {children}
        </GlassPanel>
    )
})

GlassCard.displayName = "GlassCard"

/**
 * GlassDivider - Subtle divider for glass surfaces
 */
export function GlassDivider({ className }: { className?: string }) {
    return (
        <div className={cn(
            "h-px w-full",
            "bg-[var(--pho-border-subtle)]",
            className
        )} />
    )
}
