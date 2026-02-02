"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Monitor, Smartphone, Square, RectangleHorizontal, RectangleVertical } from "lucide-react"

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9"

interface AspectRatioConfig {
    id: AspectRatio
    label: string
    icon: typeof Monitor
    iconClassName?: string
}

const ASPECT_RATIOS: AspectRatioConfig[] = [
    { id: "16:9", label: "16:9", icon: RectangleHorizontal },
    { id: "9:16", label: "9:16", icon: RectangleVertical },
    { id: "1:1", label: "1:1", icon: Square },
    { id: "4:3", label: "4:3", icon: Monitor },
    { id: "21:9", label: "21:9", icon: RectangleHorizontal, iconClassName: "scale-x-125" },
]

interface AspectRatioSelectorProps {
    selected: AspectRatio
    onChange: (ratio: AspectRatio) => void
    availableRatios?: AspectRatio[]
    className?: string
    showLabels?: boolean
}

/**
 * AspectRatioSelector - Pixel Perfect Implementation
 * 
 * Specs from component-specs.md:
 * - Width: flex
 * - Height: 36px
 * - Border Radius: 8px
 * - Background: transparent
 * - Border: 1px solid rgba(255, 255, 255, 0.10)
 * - Selected: border #F0421C, background rgba(240, 66, 28, 0.10)
 * - Text: 14px
 */
export function AspectRatioSelector({
    selected,
    onChange,
    availableRatios = ["16:9", "9:16", "1:1"],
    className,
    showLabels = true
}: AspectRatioSelectorProps) {
    const filteredRatios = ASPECT_RATIOS.filter(r => availableRatios.includes(r.id))

    return (
        <div className={cn(
            "flex gap-2",
            className
        )}>
            {filteredRatios.map((ratio) => {
                const Icon = ratio.icon
                const isSelected = selected === ratio.id

                return (
                    <motion.button
                        key={ratio.id}
                        onClick={() => onChange(ratio.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            // Pixel-perfect dimensions
                            "flex-1 flex items-center justify-center gap-1.5",
                            "h-[36px] px-3",
                            "rounded-[var(--pho-radius-md)]",
                            "transition-all duration-[var(--pho-duration-normal)]",
                            // Border and background
                            isSelected
                                ? "border border-primary bg-primary/10"
                                : "border border-[var(--pho-border-default)] bg-transparent hover:bg-[var(--pho-glass-light)]"
                        )}
                    >
                        <Icon className={cn(
                            "w-4 h-4",
                            isSelected ? "text-primary" : "text-[var(--pho-text-muted)]",
                            ratio.iconClassName
                        )} />

                        {showLabels && (
                            <span className={cn(
                                "text-[14px] font-medium",
                                isSelected ? "text-primary" : "text-[var(--pho-text-muted)]"
                            )}>
                                {ratio.label}
                            </span>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * AspectRatioSelectorCompact - Icon-only version
 */
export function AspectRatioSelectorCompact(props: Omit<AspectRatioSelectorProps, 'showLabels'>) {
    return <AspectRatioSelector {...props} showLabels={false} />
}
