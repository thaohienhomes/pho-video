"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Coins, Gift, Zap, Crown } from "lucide-react"

interface CreditPackCardProps {
    id: string
    credits: number
    price: number
    currency?: string
    bonusPercentage?: number
    isPopular?: boolean
    isSelected?: boolean
    onSelect?: () => void
    className?: string
}

/**
 * CreditPackCard - Credit pack selection card
 * 
 * Specs from component-specs.md:
 * - Height: 80px
 * - Border Radius: 16px
 * - Background: rgba(255, 255, 255, 0.05)
 * - Border: 1px solid rgba(255, 255, 255, 0.10)
 * - Padding: 16px 20px
 * - Selected: border #F0421C, background rgba(240, 66, 28, 0.10)
 * - Bonus Badge: background #22C55E, padding 4px 8px, border-radius 4px, font 12px bold
 */
export function CreditPackCard({
    id,
    credits,
    price,
    currency = "$",
    bonusPercentage,
    isPopular = false,
    isSelected = false,
    onSelect,
    className
}: CreditPackCardProps) {
    const formatCredits = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
        return num.toString()
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={cn(
                "relative w-full h-20 px-5 py-4 rounded-[16px]",
                "flex items-center justify-between",
                "transition-all duration-[var(--pho-duration-normal)]",
                isSelected
                    ? "bg-primary/10 border-2 border-primary shadow-[0_0_20px_rgba(240,66,28,0.2)]"
                    : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] hover:border-[var(--pho-border-strong)]",
                className
            )}
        >
            {/* Left side - Credits */}
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-[var(--pho-radius-lg)] flex items-center justify-center",
                    isSelected ? "bg-primary/20" : "bg-[var(--pho-glass-light)]"
                )}>
                    <Coins className={cn(
                        "w-6 h-6",
                        isSelected ? "text-primary" : "text-[var(--pho-text-muted)]"
                    )} />
                </div>

                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[var(--pho-text-primary)]">
                            {formatCredits(credits)} Phở
                        </span>
                        {isPopular && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">
                                <Crown className="w-3 h-3" />
                                BEST
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-[var(--pho-text-muted)]">
                        {currency}{(price / credits * 1000).toFixed(2)} per 1K credits
                    </span>
                </div>
            </div>

            {/* Right side - Price & Bonus */}
            <div className="flex items-center gap-3">
                {bonusPercentage && bonusPercentage > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#22C55E] text-white text-xs font-bold">
                        <Gift className="w-3 h-3" />
                        +{bonusPercentage}%
                    </div>
                )}
                <div className="text-right">
                    <span className="text-xl font-bold text-[var(--pho-text-primary)]">
                        {currency}{price}
                    </span>
                </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
                <motion.div
                    layoutId="credit-pack-selected"
                    className="absolute inset-0 rounded-[16px] border-2 border-primary pointer-events-none"
                    initial={false}
                />
            )}
        </motion.button>
    )
}

/**
 * CreditPackGrid - Grid of credit pack options
 */
interface CreditPackGridProps {
    packs: Array<{
        id: string
        credits: number
        price: number
        bonusPercentage?: number
        isPopular?: boolean
    }>
    selectedId?: string
    onSelect: (id: string) => void
    className?: string
}

export function CreditPackGrid({ packs, selectedId, onSelect, className }: CreditPackGridProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {packs.map((pack) => (
                <CreditPackCard
                    key={pack.id}
                    id={pack.id}
                    credits={pack.credits}
                    price={pack.price}
                    bonusPercentage={pack.bonusPercentage}
                    isPopular={pack.isPopular}
                    isSelected={selectedId === pack.id}
                    onSelect={() => onSelect(pack.id)}
                />
            ))}
        </div>
    )
}
