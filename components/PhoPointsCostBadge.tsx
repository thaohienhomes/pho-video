import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface PhoPointsCostBadgeProps {
    cost: number;
    className?: string;
    variant?: 'default' | 'inline' | 'button';
    showIcon?: boolean;
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

/**
 * Badge showing the cost of an action in Phở Points
 */
export function PhoPointsCostBadge({
    cost,
    className,
    variant = 'default',
    showIcon = true,
}: PhoPointsCostBadgeProps) {
    const formattedCost = formatPoints(cost);

    return (
        <div className={cn(
            "inline-flex items-center gap-1 font-medium transition-all",
            variant === 'default' && "px-2 py-1 bg-vermilion/10 border border-vermilion/20 rounded text-xs text-vermilion",
            variant === 'inline' && "text-xs text-vermilion/80",
            variant === 'button' && "px-2.5 py-1 bg-vermilion/20 rounded-full text-xs text-vermilion",
            className
        )}>
            {showIcon && (
                <Coins className={cn(
                    variant === 'inline' ? "w-3 h-3" : "w-3.5 h-3.5"
                )} />
            )}
            <span>{formattedCost}</span>
            {variant === 'default' && (
                <span className="text-vermilion/60">pts</span>
            )}
        </div>
    );
}

/**
 * Component showing cost with "insufficient" warning state
 */
interface PhoPointsCostPreviewProps {
    cost: number;
    userBalance: number;
    className?: string;
}

export function PhoPointsCostPreview({
    cost,
    userBalance,
    className
}: PhoPointsCostPreviewProps) {
    const hasEnough = userBalance >= cost;
    const formattedCost = formatPoints(cost);

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border",
            hasEnough
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20",
            className
        )}>
            <Coins className={cn(
                "w-4 h-4",
                hasEnough ? "text-green-400" : "text-red-400"
            )} />

            <div className="flex flex-col">
                <span className={cn(
                    "text-sm font-medium",
                    hasEnough ? "text-green-400" : "text-red-400"
                )}>
                    {formattedCost} Phở Points
                </span>

                {!hasEnough && (
                    <span className="text-xs text-red-400/70">
                        Need {formatPoints(cost - userBalance)} more
                    </span>
                )}
            </div>
        </div>
    );
}
