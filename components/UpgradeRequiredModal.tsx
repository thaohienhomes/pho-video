'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles, ArrowRight, X, Zap, Video, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradeRequiredModalProps {
    open: boolean;
    onCloseAction: () => void;
    currentTier?: string;
    featureName?: string;
}

const VN_UPGRADE_OPTIONS = [
    {
        tier: 'creator',
        name: 'Creator',
        priceVND: '199,000đ/tháng',
        priceUSD: '$8/mo',
        features: ['Video Generation', 'Standard Quality', '500K Phở Points'],
        color: 'from-vermilion/20 to-orange-500/20',
        borderColor: 'border-vermilion/50',
        iconColor: 'text-vermilion',
        recommended: true,
    },
    {
        tier: 'pro',
        name: 'Pro',
        priceVND: '499,000đ/tháng',
        priceUSD: '$20/mo',
        features: ['Priority Video', 'Ultra Quality', '2M Phở Points'],
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30',
        iconColor: 'text-purple-400',
        recommended: false,
    },
];

export function UpgradeRequiredModal({
    open,
    onCloseAction,
    currentTier = 'free',
    featureName = 'Video Generation',
}: UpgradeRequiredModalProps) {
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgrade = (tier: string) => {
        setUpgrading(true);
        // Redirect to Phở Chat pricing page
        window.location.href = `https://pho.chat/pricing?upgrade=${tier}&from=studio`;
    };

    if (!open) return null;

    const tierDisplayName = currentTier === 'free' ? 'Free' : currentTier === 'vn_basic' ? 'Basic' : currentTier;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onCloseAction}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-900/95 to-black/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-vermilion/20 rounded-full blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onCloseAction}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-4 h-4 text-white/60" />
                </button>

                <div className="relative p-6 space-y-5">
                    {/* Header with Lock Icon */}
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-vermilion/20 to-orange-500/20 border border-vermilion/30">
                                <Lock className="w-8 h-8 text-vermilion" />
                            </div>
                            <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full">
                                <Crown className="w-3 h-3 text-black" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Upgrade to Unlock
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                <span className="text-vermilion font-medium">{featureName}</span> requires Creator plan or higher
                            </p>
                        </div>
                    </div>

                    {/* Current tier badge */}
                    <div className="flex items-center justify-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-xs text-gray-500">Current Plan:</span>
                        <span className="text-xs font-bold text-gray-300 px-2 py-0.5 bg-gray-800 rounded">
                            {tierDisplayName}
                        </span>
                    </div>

                    {/* Feature Preview */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-vermilion/10 to-transparent border border-vermilion/20 rounded-xl">
                        <Video className="w-5 h-5 text-vermilion flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-white font-medium">AI Video Generation</p>
                            <p className="text-xs text-gray-400">Create stunning videos from text or images</p>
                        </div>
                        <Sparkles className="w-4 h-4 text-vermilion animate-pulse" />
                    </div>

                    {/* Upgrade Options */}
                    <div className="space-y-3">
                        {VN_UPGRADE_OPTIONS.map((option) => (
                            <button
                                key={option.tier}
                                onClick={() => handleUpgrade(option.tier)}
                                disabled={upgrading}
                                className={cn(
                                    "relative w-full flex items-center gap-4 p-4 rounded-xl border transition-all group",
                                    "bg-gradient-to-br hover:scale-[1.02] hover:shadow-lg",
                                    option.color,
                                    option.borderColor,
                                    option.recommended && "ring-2 ring-vermilion/50"
                                )}
                            >
                                {option.recommended && (
                                    <div className="absolute -top-2 left-4 px-2 py-0.5 bg-vermilion text-black text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3" /> RECOMMENDED
                                    </div>
                                )}

                                <div className={cn("p-2 rounded-lg bg-black/30", option.iconColor)}>
                                    <Zap className="w-5 h-5" />
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{option.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-lg font-black text-white">{option.priceVND}</span>
                                        <span className="text-xs text-gray-500">({option.priceUSD})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {option.features.map((feature) => (
                                            <span key={feature} className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-black/30 rounded">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCloseAction}
                            disabled={upgrading}
                            className="text-gray-400 hover:text-white"
                        >
                            Maybe Later
                        </Button>
                        <p className="text-[10px] text-gray-600 text-center">
                            🔒 Secure payment via Sepay &amp; Polar
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
