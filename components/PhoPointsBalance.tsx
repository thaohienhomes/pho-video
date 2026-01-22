'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Coins, Loader2, Plus } from 'lucide-react';
import { CreditPacksModal } from './CreditPacksModal';

interface PhoPointsBalanceProps {
    className?: string;
    showIcon?: boolean;
    variant?: 'default' | 'compact' | 'large';
}

interface BalanceData {
    balance: number;
    balanceFormatted: string;
    tier: string;
}

export function PhoPointsBalance({
    className,
    showIcon = true,
    variant = 'default'
}: PhoPointsBalanceProps) {
    const [data, setData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPacksModalOpen, setIsPacksModalOpen] = useState(false);

    useEffect(() => {
        async function fetchBalance() {
            try {
                const res = await fetch('/api/pho-points/balance');
                if (!res.ok) {
                    throw new Error('Failed to fetch balance');
                }
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error');
            } finally {
                setLoading(false);
            }
        }

        fetchBalance();
    }, []);

    if (loading) {
        return (
            <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg",
                className
            )}>
                <Loader2 className="w-4 h-4 animate-spin text-vermilion" />
                <span className="text-xs text-gray-400">Loading...</span>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "flex items-center gap-2 rounded-lg transition-all",
                variant === 'default' && "px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 hover:border-vermilion/30",
                variant === 'compact' && "px-2 py-1 bg-black/30 border border-white/5",
                variant === 'large' && "px-4 py-2 bg-gradient-to-r from-vermilion/10 to-orange-500/10 border border-vermilion/20",
                className
            )}>
                {showIcon && (
                    <Coins className={cn(
                        "text-vermilion",
                        variant === 'compact' && "w-3 h-3",
                        variant === 'default' && "w-4 h-4",
                        variant === 'large' && "w-5 h-5"
                    )} />
                )}

                <div className="flex items-baseline gap-1">
                    <span className={cn(
                        "font-bold text-vermilion",
                        variant === 'compact' && "text-sm",
                        variant === 'default' && "text-base",
                        variant === 'large' && "text-lg"
                    )}>
                        {data.balanceFormatted}
                    </span>

                    {variant !== 'compact' && (
                        <span className={cn(
                            "text-gray-400",
                            variant === 'default' && "text-xs",
                            variant === 'large' && "text-sm"
                        )}>
                            Phở Points
                        </span>
                    )}
                </div>
            </div>

            {variant !== 'compact' && (
                <button
                    onClick={() => setIsPacksModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-vermilion/10 hover:bg-vermilion text-vermilion hover:text-white border border-vermilion/20 rounded-lg text-xs font-bold transition-all duration-300 group"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Top Up</span>
                </button>
            )}

            <CreditPacksModal
                open={isPacksModalOpen}
                onCloseAction={() => setIsPacksModalOpen(false)}
            />
        </div>
    );
}

// Hook for fetching Phở Points balance
export function usePhoPointsBalance() {
    const [balance, setBalance] = useState<number>(0);
    const [balanceFormatted, setBalanceFormatted] = useState<string>('0');
    const [tier, setTier] = useState<string>('free');
    const [loading, setLoading] = useState(true);

    const refetch = async () => {
        try {
            const res = await fetch('/api/pho-points/balance');
            if (res.ok) {
                const json = await res.json();
                setBalance(json.balance);
                setBalanceFormatted(json.balanceFormatted);
                setTier(json.tier);
            }
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { balance, balanceFormatted, tier, loading, refetch };
}
