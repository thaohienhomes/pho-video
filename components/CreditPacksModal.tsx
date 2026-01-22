'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Zap, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CREDIT_PACKS } from '@/config/products';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditPacksModalProps {
    open: boolean;
    onCloseAction: () => void;
}

export function CreditPacksModal({ open, onCloseAction }: CreditPacksModalProps) {
    const [purchasing, setPurchasing] = useState<string | null>(null);

    const handlePurchase = (packId: string, polarLinkId: string) => {
        setPurchasing(packId);
        // In a real scenario, we might call an API to get the checkout URL
        // for now we directly redirect as requested or use the link
        window.location.href = polarLinkId;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCloseAction}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header Decor */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-vermilion/10 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onCloseAction}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-white/60" />
                </button>

                <div className="relative p-8 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-vermilion/20 border border-vermilion/30 rounded-full mb-2">
                            <Sparkles className="w-4 h-4 text-vermilion" />
                            <span className="text-[10px] font-bold text-vermilion uppercase tracking-widest">Top Up Phở Points</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            More <span className="text-vermilion">Phở Points</span>,<br />More Magic.
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Need more juice for your cinematic creations? Grab a pack and keep generating instantly.
                        </p>
                    </div>

                    {/* Packs Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {CREDIT_PACKS.map((pack) => (
                            <div
                                key={pack.id}
                                className={cn(
                                    "group relative p-6 rounded-2xl border transition-all duration-300",
                                    pack.popular
                                        ? "bg-gradient-to-b from-vermilion/10 to-black border-vermilion/40 shadow-[0_0_30px_-10px_rgba(240,66,28,0.3)]"
                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                )}
                            >
                                {pack.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vermilion text-white text-[10px] font-black rounded-full shadow-lg z-10">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                                            <Coins className={cn(
                                                "w-6 h-6",
                                                pack.popular ? "text-vermilion" : "text-gray-400"
                                            )} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 font-medium italic">Price</div>
                                            <div className="text-3xl font-black text-white">{pack.displayPrice}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-3xl font-black text-white flex items-baseline gap-1">
                                            {pack.credits.toLocaleString()}
                                            <span className="text-sm font-normal text-gray-500 italic">pts</span>
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            One-time purchase • Never expire
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        {[
                                            `Instant ${pack.credits.toLocaleString()} Points`,
                                            "Unlock Professional Models",
                                            "Priority Queue Access",
                                            "Private Gallery Mode"
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                                <Check className="w-3.5 h-3.5 text-vermilion" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handlePurchase(pack.id, pack.polarLinkId)}
                                        disabled={purchasing !== null}
                                        className={cn(
                                            "w-full h-12 rounded-xl font-bold transition-all duration-300 mb-2",
                                            pack.popular
                                                ? "bg-vermilion hover:bg-vermilion/90 text-white shadow-lg shadow-vermilion/20"
                                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                        )}
                                    >
                                        {purchasing === pack.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Redirecting...
                                            </div>
                                        ) : (
                                            `Buy for ${pack.displayPrice}`
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-2">
                        <button
                            onClick={onCloseAction}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            Return to Studio
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
