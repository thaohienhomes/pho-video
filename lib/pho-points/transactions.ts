/**
 * Phở Points Transaction Functions
 * 
 * Core functions for deducting, adding, and tracking Phở Points
 */

import { db } from '@/lib/db';
import { TRANSACTION_TYPES, SUBSCRIPTION_PHO_POINTS, SubscriptionTier } from './constants';
import { getMonthStart, getAllocationExpiry } from './utils';

// ==========================================
// Types
// ==========================================

export type TransactionResult = {
    success: boolean;
    newBalance: number;
    error?: string;
    transactionId?: string;
};

export type TransactionMetadata = {
    model?: string;
    duration?: number;
    resolution?: string;
    prompt?: string;
    checkoutId?: string;
    subscriptionId?: string;
    generationId?: string;
    [key: string]: any;
};

// ==========================================
// Core Transaction Functions
// ==========================================

/**
 * Deduct Phở Points from user balance
 * 
 * @param userId - User database ID (not Clerk ID)
 * @param amount - Amount of Phở Points to deduct (positive number)
 * @param transactionType - Type of transaction for logging
 * @param metadata - Optional metadata for transaction log
 * @returns Transaction result with new balance or error
 */
export async function deductPhoPoints(
    userId: string,
    amount: number,
    transactionType: string,
    metadata?: TransactionMetadata
): Promise<TransactionResult> {
    try {
        // Check current balance
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { phoPointsBalance: true }
        });

        if (!user) {
            return { success: false, newBalance: 0, error: 'User not found' };
        }

        if (user.phoPointsBalance < amount) {
            return {
                success: false,
                newBalance: user.phoPointsBalance,
                error: 'Insufficient Phở Points'
            };
        }

        // Atomic transaction: Update balance and log transaction
        const [updatedUser, transaction] = await db.$transaction([
            db.user.update({
                where: { id: userId },
                data: {
                    phoPointsBalance: { decrement: amount },
                    phoPointsLifetimeSpent: { increment: amount }
                }
            }),
            db.phoPointsTransaction.create({
                data: {
                    userId,
                    amount: -amount, // Negative for spend
                    balanceAfter: user.phoPointsBalance - amount,
                    transactionType,
                    metadata: metadata ? (metadata as any) : undefined,
                }
            })
        ]);

        return {
            success: true,
            newBalance: updatedUser.phoPointsBalance,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error('Error deducting Phở Points:', error);
        return {
            success: false,
            newBalance: 0,
            error: error instanceof Error ? error.message : 'Transaction failed'
        };
    }
}

/**
 * Add Phở Points to user balance
 * 
 * @param userId - User database ID (not Clerk ID)
 * @param amount - Amount of Phở Points to add (positive number)
 * @param transactionType - Type of transaction for logging
 * @param metadata - Optional metadata for transaction log
 * @returns Transaction result with new balance
 */
export async function addPhoPoints(
    userId: string,
    amount: number,
    transactionType: string,
    metadata?: TransactionMetadata
): Promise<TransactionResult> {
    try {
        // Atomic transaction: Update balance and log transaction
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { phoPointsBalance: true }
        });

        if (!user) {
            return { success: false, newBalance: 0, error: 'User not found' };
        }

        const [updatedUser, transaction] = await db.$transaction([
            db.user.update({
                where: { id: userId },
                data: {
                    phoPointsBalance: { increment: amount },
                    phoPointsLifetimeEarned: { increment: amount }
                }
            }),
            db.phoPointsTransaction.create({
                data: {
                    userId,
                    amount, // Positive for earn
                    balanceAfter: user.phoPointsBalance + amount,
                    transactionType,
                    metadata: metadata ? (metadata as any) : undefined,
                }
            })
        ]);

        return {
            success: true,
            newBalance: updatedUser.phoPointsBalance,
            transactionId: transaction.id,
        };
    } catch (error) {
        console.error('Error adding Phở Points:', error);
        return {
            success: false,
            newBalance: 0,
            error: error instanceof Error ? error.message : 'Transaction failed'
        };
    }
}

/**
 * Refund Phở Points after failed generation
 * Wrapper around addPhoPoints with refund type
 */
export async function refundPhoPoints(
    userId: string,
    amount: number,
    metadata?: TransactionMetadata
): Promise<TransactionResult> {
    return addPhoPoints(userId, amount, TRANSACTION_TYPES.REFUND, {
        ...metadata,
        refundedAt: new Date().toISOString(),
    });
}

// ==========================================
// Balance & History Functions
// ==========================================

/**
 * Get user's current Phở Points balance
 */
export async function getPhoPointsBalance(userId: string): Promise<number> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { phoPointsBalance: true }
    });
    return user?.phoPointsBalance ?? 0;
}

/**
 * Get user's Phở Points transaction history
 */
export async function getPhoPointsHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
) {
    return await db.phoPointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
}

/**
 * Get user's stats (lifetime earned, spent, current balance)
 */
export async function getPhoPointsStats(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            phoPointsBalance: true,
            phoPointsLifetimeEarned: true,
            phoPointsLifetimeSpent: true,
            subscriptionTier: true,
            subscriptionStatus: true,
        }
    });

    return {
        balance: user?.phoPointsBalance ?? 0,
        lifetimeEarned: user?.phoPointsLifetimeEarned ?? 0,
        lifetimeSpent: user?.phoPointsLifetimeSpent ?? 0,
        tier: (user?.subscriptionTier as SubscriptionTier) ?? 'free',
        status: user?.subscriptionStatus ?? 'inactive',
    };
}

// ==========================================
// Subscription Functions
// ==========================================

/**
 * Grant monthly Phở Points for subscription
 * Called when a new subscription period starts
 */
export async function grantSubscriptionPhoPoints(
    userId: string,
    tier: SubscriptionTier,
    metadata?: TransactionMetadata
): Promise<TransactionResult> {
    const points = SUBSCRIPTION_PHO_POINTS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_PHO_POINTS];

    if (!points) {
        return {
            success: false,
            newBalance: 0,
            error: `Invalid tier: ${tier}`
        };
    }

    // Add points and create allocation record
    const result = await addPhoPoints(
        userId,
        points,
        TRANSACTION_TYPES.SUBSCRIPTION_GRANT,
        {
            tier,
            period: getMonthStart().toISOString(),
            ...metadata,
        }
    );

    if (result.success) {
        // Create allocation record for tracking
        await db.phoPointsAllocation.upsert({
            where: {
                userId_allocationPeriod: {
                    userId,
                    allocationPeriod: getMonthStart(),
                }
            },
            update: {
                pointsAllocated: { increment: points },
            },
            create: {
                userId,
                subscriptionTier: tier,
                pointsAllocated: points,
                allocationPeriod: getMonthStart(),
                expiresAt: getAllocationExpiry(),
            }
        });
    }

    return result;
}

/**
 * Update user's subscription tier
 */
export async function updateSubscriptionTier(
    userId: string,
    tier: SubscriptionTier,
    status: 'active' | 'canceled' | 'past_due' = 'active'
) {
    return await db.user.update({
        where: { id: userId },
        data: {
            subscriptionTier: tier,
            subscriptionStatus: status,
        }
    });
}

// ==========================================
// Bonus Functions
// ==========================================

/**
 * Grant signup bonus to new user (only once)
 */
export async function grantSignupBonus(userId: string): Promise<TransactionResult> {
    // Check if user already received bonus
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { hasReceivedSignupBonus: true }
    });

    if (!user) {
        return { success: false, newBalance: 0, error: 'User not found' };
    }

    if (user.hasReceivedSignupBonus) {
        return { success: false, newBalance: 0, error: 'Signup bonus already claimed' };
    }

    // Grant bonus
    const result = await addPhoPoints(
        userId,
        50000, // BONUS_PHO_POINTS.SIGNUP
        TRANSACTION_TYPES.BONUS_SIGNUP,
        { reason: 'New user signup bonus' }
    );

    if (result.success) {
        // Mark bonus as received
        await db.user.update({
            where: { id: userId },
            data: { hasReceivedSignupBonus: true }
        });
    }

    return result;
}

/**
 * Check if user has enough points for an action
 */
export async function checkSufficientPhoPoints(
    userId: string,
    requiredAmount: number
): Promise<{ sufficient: boolean; balance: number; shortfall: number }> {
    const balance = await getPhoPointsBalance(userId);
    const sufficient = balance >= requiredAmount;
    const shortfall = sufficient ? 0 : requiredAmount - balance;

    return { sufficient, balance, shortfall };
}

/**
 * Grant referral bonus to referrer when referred user completes signup
 * 
 * @param referrerId - The user ID of the person who made the referral
 * @param referredUserId - The user ID of the new user who was referred
 * @returns Transaction result
 */
export async function grantReferralBonus(
    referrerId: string,
    referredUserId: string
): Promise<TransactionResult> {
    // Check if referral bonus already granted for this pair
    const existingReferral = await db.phoPointsTransaction.findFirst({
        where: {
            userId: referrerId,
            transactionType: TRANSACTION_TYPES.BONUS_REFERRAL,
            metadata: {
                path: ['referredUserId'],
                equals: referredUserId,
            },
        },
    });

    if (existingReferral) {
        return { success: false, newBalance: 0, error: 'Referral bonus already granted for this user' };
    }

    // Grant 100K points to referrer
    const REFERRAL_BONUS = 100000; // 100K Phở Points ($1 value)

    const result = await addPhoPoints(
        referrerId,
        REFERRAL_BONUS,
        TRANSACTION_TYPES.BONUS_REFERRAL,
        {
            referredUserId,
            reason: 'Referral bonus - friend signed up',
            grantedAt: new Date().toISOString(),
        }
    );

    console.log(`[Bonus] Referral bonus granted to ${referrerId} for referring ${referredUserId}`);

    return result;
}

/**
 * Grant streak bonus for consecutive daily activity
 * Only grants once per day when user completes first generation
 * 
 * @param userId - User ID
 * @returns Transaction result or null if already claimed today
 */
export async function grantDailyStreakBonus(userId: string): Promise<TransactionResult | null> {
    // Check if streak bonus already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBonus = await db.phoPointsTransaction.findFirst({
        where: {
            userId,
            transactionType: TRANSACTION_TYPES.BONUS_STREAK,
            createdAt: {
                gte: today,
            },
        },
    });

    if (todayBonus) {
        return null; // Already claimed today
    }

    // Count consecutive days with streak bonus
    const recentBonuses = await db.phoPointsTransaction.findMany({
        where: {
            userId,
            transactionType: TRANSACTION_TYPES.BONUS_STREAK,
        },
        orderBy: { createdAt: 'desc' },
        take: 7, // Look at last 7 streak bonuses
    });

    // Calculate streak length
    let streakDays = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    for (const bonus of recentBonuses) {
        const bonusDate = new Date(bonus.createdAt);
        bonusDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - (streakDays + 1));
        expectedDate.setHours(0, 0, 0, 0);

        if (bonusDate.getTime() === expectedDate.getTime()) {
            streakDays++;
        } else {
            break;
        }
    }

    // Calculate bonus amount based on streak
    // Day 1: 5K, Day 2: 10K, Day 3: 15K, Day 4: 20K, Day 5: 25K, Day 6: 30K, Day 7+: 50K
    const currentStreak = streakDays + 1;
    let bonusAmount: number;
    if (currentStreak >= 7) {
        bonusAmount = 50000;
    } else {
        bonusAmount = currentStreak * 5000;
    }

    const result = await addPhoPoints(
        userId,
        bonusAmount,
        TRANSACTION_TYPES.BONUS_STREAK,
        {
            streakDay: currentStreak,
            reason: `Daily streak bonus - Day ${currentStreak}`,
        }
    );

    if (result.success) {
        console.log(`[Bonus] Streak bonus (Day ${currentStreak}): ${bonusAmount} points to ${userId}`);
    }

    return result;
}

/**
 * Validate referral code (which is just the referrer's user ID or custom code)
 */
export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string }> {
    // Check if code is a valid user ID
    const user = await db.user.findFirst({
        where: {
            OR: [
                { id: code },
                { clerkId: code },
            ],
        },
        select: { id: true },
    });

    if (user) {
        return { valid: true, referrerId: user.id };
    }

    return { valid: false };
}

// ==========================================
// Export Index
// ==========================================

export { db } from '@/lib/db';
