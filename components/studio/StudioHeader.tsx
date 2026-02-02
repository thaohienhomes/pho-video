"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StudioHeaderProps {
    icon: LucideIcon
    title: string
    subtitle?: string
    accentColor?: string
    badge?: string
    className?: string
    actions?: React.ReactNode
}

/**
 * StudioHeader - Pixel Perfect Header for Secondary Studios
 * 
 * Provides consistent header styling across all studio modes
 * Uses design tokens for pixel-perfect rendering
 */
export function StudioHeader({
    icon: Icon,
    title,
    subtitle,
    accentColor = "primary",
    badge,
    className,
    actions
}: StudioHeaderProps) {
    const colorMap: Record<string, string> = {
        primary: "from-primary/20 to-orange-500/10",
        pink: "from-pink-500/20 to-rose-500/10",
        purple: "from-purple-500/20 to-violet-500/10",
        blue: "from-blue-500/20 to-cyan-500/10",
        green: "from-emerald-500/20 to-teal-500/10",
    }

    const iconColorMap: Record<string, string> = {
        primary: "text-primary",
        pink: "text-pink-400",
        purple: "text-purple-400",
        blue: "text-blue-400",
        green: "text-emerald-400",
    }

    return (
        <div className={cn(
            "flex items-center justify-between p-4",
            "bg-[var(--pho-glass-light)]",
            "border-b border-[var(--pho-border-default)]",
            "backdrop-blur-[var(--pho-blur-lg)]",
            className
        )}>
            <div className="flex items-center gap-3">
                <motion.div
                    className={cn(
                        "w-10 h-10 rounded-[var(--pho-radius-lg)]",
                        "flex items-center justify-center",
                        "bg-gradient-to-br",
                        colorMap[accentColor] || colorMap.primary
                    )}
                    whileHover={{ scale: 1.05 }}
                >
                    <Icon className={cn(
                        "w-5 h-5",
                        iconColorMap[accentColor] || iconColorMap.primary
                    )} />
                </motion.div>

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-[var(--pho-text-primary)]">
                            {title}
                        </h2>
                        {badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-[12px] text-[var(--pho-text-muted)]">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    )
}
