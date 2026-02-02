"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon, Check } from "lucide-react"

interface StylePreset {
    id: string
    label: string
    icon?: LucideIcon
    description?: string
}

interface StylePresetGridProps {
    presets: StylePreset[]
    selected?: string
    onSelect: (id: string) => void
    columns?: 2 | 3 | 4
    size?: "sm" | "md" | "lg"
    className?: string
}

/**
 * StylePresetGrid - Pixel Perfect Style Selection Grid
 * 
 * Used for music styles, TTS voices, video presets, etc.
 */
export function StylePresetGrid({
    presets,
    selected,
    onSelect,
    columns = 3,
    size = "md",
    className
}: StylePresetGridProps) {
    const sizeStyles = {
        sm: "p-2 text-xs",
        md: "p-3 text-sm",
        lg: "p-4 text-base"
    }

    return (
        <div className={cn(
            "grid gap-2",
            columns === 2 && "grid-cols-2",
            columns === 3 && "grid-cols-3",
            columns === 4 && "grid-cols-4",
            className
        )}>
            {presets.map((preset) => {
                const isSelected = selected === preset.id
                const Icon = preset.icon

                return (
                    <motion.button
                        key={preset.id}
                        onClick={() => onSelect(preset.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative flex flex-col items-center justify-center",
                            "rounded-[var(--pho-radius-lg)]",
                            "transition-all duration-[var(--pho-duration-normal)]",
                            sizeStyles[size],
                            isSelected
                                ? "bg-primary/10 border border-[var(--pho-border-active)]"
                                : "bg-[var(--pho-glass-light)] border border-[var(--pho-border-default)] hover:border-[var(--pho-border-strong)]"
                        )}
                        style={{
                            boxShadow: isSelected ? 'var(--pho-glow-primary)' : 'none'
                        }}
                    >
                        {/* Selected indicator */}
                        {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}

                        {Icon && (
                            <Icon className={cn(
                                "w-5 h-5 mb-1",
                                isSelected ? "text-primary" : "text-[var(--pho-text-muted)]"
                            )} />
                        )}

                        <span className={cn(
                            "font-medium text-center",
                            isSelected ? "text-[var(--pho-text-primary)]" : "text-[var(--pho-text-secondary)]"
                        )}>
                            {preset.label}
                        </span>

                        {preset.description && (
                            <span className="text-[10px] text-[var(--pho-text-muted)] mt-0.5 line-clamp-1">
                                {preset.description}
                            </span>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * ActionButton - Common action button for studios
 */
interface ActionButtonProps {
    icon: LucideIcon
    label?: string
    onClick?: () => void
    variant?: "primary" | "secondary" | "ghost"
    size?: "sm" | "md"
    disabled?: boolean
    className?: string
}

export function ActionButton({
    icon: Icon,
    label,
    onClick,
    variant = "secondary",
    size = "md",
    disabled = false,
    className
}: ActionButtonProps) {
    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-[var(--pho-glass-light)] text-[var(--pho-text-secondary)] border border-[var(--pho-border-default)] hover:bg-[var(--pho-glass-medium)]",
        ghost: "bg-transparent text-[var(--pho-text-muted)] hover:text-[var(--pho-text-primary)] hover:bg-[var(--pho-glass-light)]"
    }

    const sizeStyles = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm"
    }

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={cn(
                "flex items-center justify-center gap-2",
                "rounded-[var(--pho-radius-lg)]",
                "font-medium",
                "transition-all duration-[var(--pho-duration-normal)]",
                variantStyles[variant],
                sizeStyles[size],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
            {label && <span>{label}</span>}
        </motion.button>
    )
}
