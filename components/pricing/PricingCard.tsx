"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Sparkles, LucideIcon } from "lucide-react"

interface PricingFeature {
    text: string
    included: boolean
}

interface PricingCardProps {
    name: string
    description?: string
    price: number
    period?: "month" | "year"
    currency?: string
    features: PricingFeature[]
    ctaLabel?: string
    onSelect?: () => void
    isPopular?: boolean
    badge?: string
    icon?: LucideIcon
    className?: string
}

/**
 * PricingCard - Subscription pricing card
 * 
 * Specs from component-specs.md:
 * - Width: 320px
 * - Border Radius: 24px
 * - Padding: 32px
 * - Background: #121212
 * - Border: 1px solid rgba(255, 255, 255, 0.10)
 * - Price Amount: 48px, font-weight: 700
 * - Period: 16px, rgba(255, 255, 255, 0.50)
 * - Feature List Gap: 12px
 * - Feature Icon: 20px, color #22C55E
 * - Feature Text: 14px
 */
export function PricingCard({
    name,
    description,
    price,
    period = "month",
    currency = "$",
    features,
    ctaLabel = "Get Started",
    onSelect,
    isPopular = false,
    badge,
    icon: Icon,
    className
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                "relative w-[320px] p-8 rounded-[24px]",
                "bg-[#121212]",
                "border border-[rgba(255,255,255,0.10)]",
                isPopular && [
                    "border-2 border-primary",
                    "shadow-[0_0_60px_rgba(240,66,28,0.3)]"
                ],
                className
            )}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold uppercase">
                    {badge || "POPULAR"}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                {Icon && (
                    <div className="w-12 h-12 rounded-[var(--pho-radius-lg)] bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                )}
                <h3 className="text-xl font-semibold text-[var(--pho-text-primary)]">{name}</h3>
                {description && (
                    <p className="text-sm text-[var(--pho-text-muted)] mt-1">{description}</p>
                )}
            </div>

            {/* Price - 48px, font-weight: 700 */}
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-[48px] font-bold text-[var(--pho-text-primary)] leading-none">
                        {currency}{price}
                    </span>
                    <span className="text-base text-[rgba(255,255,255,0.50)]">
                        /{period}
                    </span>
                </div>
            </div>

            {/* CTA Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelect}
                className={cn(
                    "w-full h-12 rounded-full font-semibold text-base",
                    "flex items-center justify-center gap-2",
                    "transition-all duration-[var(--pho-duration-normal)]",
                    isPopular
                        ? "bg-primary text-white shadow-[0_0_30px_rgba(240,66,28,0.4)] hover:bg-[#E53A15]"
                        : "bg-[var(--pho-glass-light)] text-[var(--pho-text-primary)] border border-[var(--pho-border-default)] hover:border-[var(--pho-border-strong)]"
                )}
            >
                <Sparkles className="w-5 h-5" />
                {ctaLabel}
            </motion.button>

            {/* Features - Gap: 12px */}
            <div className="mt-6 space-y-3">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            feature.included ? "bg-[#22C55E]/20" : "bg-white/5"
                        )}>
                            <Check className={cn(
                                "w-3 h-3",
                                feature.included ? "text-[#22C55E]" : "text-white/30"
                            )} />
                        </div>
                        <span className={cn(
                            "text-sm",
                            feature.included ? "text-[var(--pho-text-secondary)]" : "text-white/30 line-through"
                        )}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

/**
 * FeaturedPricingCard - Pro/Premium pricing card with extra emphasis
 * 
 * Specs from component-specs.md:
 * - Border: 2px solid #F0421C
 * - Shadow: 0 0 60px rgba(240, 66, 28, 0.3)
 * - Badge: "POPULAR", background #F0421C, top -16px center
 */
export function FeaturedPricingCard(props: Omit<PricingCardProps, 'isPopular'>) {
    return <PricingCard {...props} isPopular={true} />
}
