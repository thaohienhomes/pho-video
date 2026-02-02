"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon, Download, Share2, Repeat, Trash2, ExternalLink, Copy } from "lucide-react"

interface ActionButton {
    id: string
    icon: LucideIcon
    label: string
    onClick: () => void
    variant?: "primary" | "secondary" | "danger"
    disabled?: boolean
}

interface ActionButtonsRowProps {
    actions: ActionButton[]
    className?: string
    size?: "sm" | "md"
}

/**
 * ActionButtonsRow - Row of action buttons for video/image results
 * 
 * Specs from component-specs.md:
 * - Gap: 16px
 * - Button Height: 40px
 * - Primary Button: #F0421C background
 * - Secondary Buttons: transparent, border rgba(255, 255, 255, 0.10)
 * - Icons: 20px
 */
export function ActionButtonsRow({ actions, className, size = "md" }: ActionButtonsRowProps) {
    const sizeStyles = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2"
    }

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5"
    }

    return (
        <div className={cn("flex items-center gap-4", className)}>
            {actions.map((action) => {
                const Icon = action.icon
                const isPrimary = action.variant === "primary"
                const isDanger = action.variant === "danger"

                return (
                    <motion.button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "flex items-center justify-center rounded-full",
                            "font-medium transition-all duration-[var(--pho-duration-normal)]",
                            sizeStyles[size],
                            isPrimary && [
                                "bg-primary text-white",
                                "shadow-[0_0_30px_rgba(240,66,28,0.4)]",
                                "hover:bg-[#E53A15]"
                            ],
                            isDanger && [
                                "bg-red-500/10 text-red-400 border border-red-500/30",
                                "hover:bg-red-500/20 hover:border-red-500/50"
                            ],
                            !isPrimary && !isDanger && [
                                "bg-transparent text-[var(--pho-text-secondary)]",
                                "border border-[var(--pho-border-default)]",
                                "hover:bg-[var(--pho-glass-light)] hover:text-[var(--pho-text-primary)]",
                                "hover:border-[var(--pho-border-strong)]"
                            ],
                            action.disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Icon className={iconSizes[size]} />
                        <span>{action.label}</span>
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * Preset action configurations for common use cases
 */
export const createDownloadAction = (onClick: () => void): ActionButton => ({
    id: "download",
    icon: Download,
    label: "Download",
    onClick,
    variant: "primary"
})

export const createShareAction = (onClick: () => void): ActionButton => ({
    id: "share",
    icon: Share2,
    label: "Share",
    onClick,
    variant: "secondary"
})

export const createRemixAction = (onClick: () => void): ActionButton => ({
    id: "remix",
    icon: Repeat,
    label: "Remix",
    onClick,
    variant: "secondary"
})

export const createDeleteAction = (onClick: () => void): ActionButton => ({
    id: "delete",
    icon: Trash2,
    label: "Delete",
    onClick,
    variant: "danger"
})

export const createCopyAction = (onClick: () => void): ActionButton => ({
    id: "copy",
    icon: Copy,
    label: "Copy",
    onClick,
    variant: "secondary"
})

export const createOpenAction = (onClick: () => void): ActionButton => ({
    id: "open",
    icon: ExternalLink,
    label: "Open",
    onClick,
    variant: "secondary"
})
