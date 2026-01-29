"use client"

import { cn } from "@/lib/utils"
import { Grid2x2, LayoutGrid, Coins } from "lucide-react"

interface BatchSizeSelectorProps {
    value: number
    onChange: (size: number) => void
    baseCost: number // Cost per single generation
    className?: string
}

const batchOptions = [
    { value: 1, label: "1", icon: "□", description: "Single" },
    { value: 2, label: "2", icon: "▫▫", description: "Pair" },
    { value: 4, label: "4", icon: "⊞", description: "Grid" },
]

export function BatchSizeSelector({
    value,
    onChange,
    baseCost,
    className,
}: BatchSizeSelectorProps) {
    const totalCost = value * baseCost

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <label className="text-xs text-white/60 font-medium">
                    Batch Size
                </label>
                <span className="flex items-center gap-1 text-xs text-primary">
                    <Coins className="w-3 h-3" />
                    {Math.round(totalCost / 1000)}K pts
                </span>
            </div>

            <div className="flex gap-2">
                {batchOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex-1 py-2.5 px-3 rounded-lg border transition-all",
                            "flex flex-col items-center gap-1",
                            value === option.value
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-black/30 border-white/10 text-white/60 hover:border-white/20"
                        )}
                    >
                        <span className="text-lg leading-none">{option.icon}</span>
                        <span className="text-xs font-medium">{option.description}</span>
                    </button>
                ))}
            </div>

            {value > 1 && (
                <p className="text-xs text-white/40 text-center">
                    Generate {value} variations with different seeds
                </p>
            )}
        </div>
    )
}
