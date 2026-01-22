'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Zap, ArrowRight, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CREDIT_PACKS } from '@/config/products';
import { CreditPacksModal } from './CreditPacksModal';

interface InsufficientPointsModalProps {
    open: boolean;
    onCloseAction: () => void;
    requiredPoints: number;
    currentBalance: number;
    actionName?: string;
}

/**
 * Format Phở Points for display
 */
function formatPoints(points: number): string {
    if (points >= 1000000) {
        const millions = points / 1000000;
        return `${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
    }
    if (points >= 1000) {
        const thousands = points / 1000;
        return `${thousands.toFixed(0)}K`;
    }
    return points.toLocaleString();
}

const UPGRADE_OPTIONS = [
    {
        tier: 'starter',
        name: 'Starter',
        points: '1M',
        price: '$9/mo',
        color: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/30',
    },
    {
        tier: 'creator',
        name: 'Creator',
        points: '3M',
        price: '$24/mo',
        color: 'from-vermilion/20 to-orange-500/20',
        borderColor: 'border-vermilion/50',
        popular: true,
    },
    {
        tier: 'pro',
        name: 'Pro',
        points: '7M',
        price: '$49/mo',
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30',
    },
];

export function InsufficientPointsModal({
    open,
    onCloseAction,
    requiredPoints,
    currentBalance,
    actionName = 'this action',
}: InsufficientPointsModalProps) {
    const [upgrading, setUpgrading] = useState(false);
    const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);
    const shortfall = requiredPoints - currentBalance;

    const handleUpgrade = async (tier: string) => {
        setUpgrading(true);
        try {
            const res = await fetch('/api/polar/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, billingCycle: 'monthly' }),
            });

            if (res.ok) {
                const { checkoutUrl } = await res.json();
                window.location.href = checkoutUrl;
            }
        } catch (error) {
            console.error('Failed to create checkout:', error);
        } finally {
            setUpgrading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCloseAction}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onCloseAction}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-white/60" />
                </button>

                <div className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-vermilion/20 border border-vermilion/30">
                            <Coins className="w-6 h-6 text-vermilion" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Insufficient Phở Points</h2>
                            <p className="text-sm text-gray-400">You need more points for {actionName}.</p>
                        </div>
                    </div>

                    {/* Balance Overview */}
                    <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Your Balance</span>
                            <span className="text-2xl font-bold text-white">{formatPoints(currentBalance)}</span>
                        </div>

                        <ArrowRight className="w-5 h-5 text-gray-600" />

                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500">Required</span>
                            <span className="text-2xl font-bold text-vermilion">{formatPoints(requiredPoints)}</span>
                        </div>
                    </div>

                    {/* Shortfall Alert */}
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">
                            You need <span className="font-bold">{formatPoints(shortfall)}</span> more Phở Points
                        </p>
                    </div>
                    {/* Choice: Subscription or Packs */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Subscriptions */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subscription Plans</p>
                            <div className="grid gap-2">
                                {UPGRADE_OPTIONS.slice(0, 2).map((option) => (
                                    <button
                                        key={option.tier}
                                        onClick={() => handleUpgrade(option.tier)}
                                        disabled={upgrading}
                                        className={cn(
                                            "relative flex flex-col items-start p-3 rounded-xl border transition-all text-left group",
                                            "bg-gradient-to-br",
                                            option.color,
                                            option.borderColor,
                                            "hover:scale-[1.02] hover:shadow-lg"
                                        )}
                                    >
                                        <span className="font-bold text-white text-sm">{option.name}</span>
                                        <span className="text-[10px] text-gray-400">{option.points} / mo</span>
                                        <div className="mt-2 text-xs font-black text-white">{option.price}</div>
                                        <ArrowRight className="absolute bottom-3 right-3 w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Credit Packs */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">One-time Packs</p>
                            <div className="grid gap-2">
                                {CREDIT_PACKS.map((pack) => (
                                    <button
                                        key={pack.id}
                                        onClick={() => window.location.href = pack.polarLinkId}
                                        disabled={upgrading}
                                        className={cn(
                                            "relative flex flex-col items-start p-3 rounded-xl border border-white/10 bg-white/5 transition-all text-left hover:border-vermilion/50 hover:bg-vermilion/5 hover:scale-[1.02] group"
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-white text-sm">{pack.credits.toLocaleString()} pts</span>
                                            {pack.popular && <Sparkles className="w-3 h-3 text-vermilion animate-pulse" />}
                                        </div>
                                        <span className="text-[10px] text-gray-400">Never expires</span>
                                        <div className="mt-2 text-xs font-black text-vermilion">{pack.displayPrice}</div>
                                        <ArrowRight className="absolute bottom-3 right-3 w-3 h-3 text-vermilion/40 group-hover:text-vermilion transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => setIsPacksModalOpen(true)}
                            className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
                        >
                            View all payment options
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-2">
                        <Button variant="ghost" size="sm" onClick={onCloseAction} disabled={upgrading} className="text-gray-400 hover:text-white">
                            Maybe Later
                        </Button>
                    </div>

                    <CreditPacksModal
                        open={isPacksModalOpen}
                        onCloseAction={() => setIsPacksModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}
