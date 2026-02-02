"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, CreditCard, Coins, Sparkles, Shield, Zap } from "lucide-react"
import { CreditPackGrid } from "./CreditPackCard"

interface CreditsStoreModalProps {
    isOpen: boolean
    onClose: () => void
    onPurchase?: (packId: string) => void
    currentCredits?: number
    className?: string
}

// Default credit packs
const CREDIT_PACKS = [
    { id: "starter", credits: 50000, price: 5, bonusPercentage: 0 },
    { id: "basic", credits: 120000, price: 10, bonusPercentage: 20 },
    { id: "pro", credits: 300000, price: 20, bonusPercentage: 50, isPopular: true },
    { id: "studio", credits: 800000, price: 50, bonusPercentage: 60 },
    { id: "enterprise", credits: 2000000, price: 100, bonusPercentage: 100 },
]

/**
 * CreditsStoreModal - Modal for purchasing credit packs
 * 
 * Specs from component-specs.md:
 * - Width: 500px
 * - Border Radius: 24px
 * - Background: #0A0A0A
 * - Padding: 32px
 */
export function CreditsStoreModal({
    isOpen,
    onClose,
    onPurchase,
    currentCredits = 0,
    className
}: CreditsStoreModalProps) {
    const [selectedPack, setSelectedPack] = useState<string>("pro")
    const selectedPackData = CREDIT_PACKS.find(p => p.id === selectedPack)

    const formatCredits = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
        return num.toString()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(
                            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                            "w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto",
                            "rounded-[24px] bg-[#0A0A0A] p-8",
                            "border border-[var(--pho-border-default)]",
                            "shadow-2xl",
                            className
                        )}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white/60" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-[var(--pho-radius-xl)] bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                                <Coins className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--pho-text-primary)]">
                                    Buy Phở Credits
                                </h2>
                                <p className="text-sm text-[var(--pho-text-muted)]">
                                    Current balance: {formatCredits(currentCredits)} Phở
                                </p>
                            </div>
                        </div>

                        {/* Credit Packs */}
                        <CreditPackGrid
                            packs={CREDIT_PACKS}
                            selectedId={selectedPack}
                            onSelect={setSelectedPack}
                            className="mb-6"
                        />

                        {/* Summary */}
                        {selectedPackData && (
                            <div className="p-4 rounded-[var(--pho-radius-lg)] bg-primary/5 border border-primary/20 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[var(--pho-text-secondary)]">You'll receive</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCredits(selectedPackData.credits)} Phở
                                    </span>
                                </div>
                                {selectedPackData.bonusPercentage > 0 && (
                                    <p className="text-xs text-[var(--pho-text-muted)] mt-1">
                                        Includes +{selectedPackData.bonusPercentage}% bonus credits!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Purchase Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onPurchase?.(selectedPack)}
                            className={cn(
                                "w-full h-14 rounded-full",
                                "bg-gradient-to-r from-primary to-orange-500",
                                "text-white font-semibold text-base",
                                "flex items-center justify-center gap-2",
                                "shadow-[0_0_30px_rgba(240,66,28,0.4)]",
                                "hover:shadow-[0_0_40px_rgba(240,66,28,0.5)]",
                                "transition-shadow"
                            )}
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay ${selectedPackData?.price || 0}
                        </motion.button>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[var(--pho-text-muted)]">
                            <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Secure Payment
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Instant Delivery
                            </span>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Never Expires
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
