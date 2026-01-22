/**
 * Phở Points Utility Functions
 * 
 * Helper functions for formatting, converting, and calculating Phở Points
 */

// ==========================================
// Conversion Functions
// ==========================================

/**
 * Convert USD amount to Phở Points
 * 1 USD = 100,000 Phở Points
 */
export const convertUSDtoPhoPoints = (usd: number): number =>
    Math.round(usd * 100000);

/**
 * Convert Phở Points to USD amount
 * 100,000 Phở Points = 1 USD
 */
export const convertPhoPointsToUSD = (points: number): number =>
    points / 100000;

// ==========================================
// Formatting Functions
// ==========================================

/**
 * Format Phở Points for display (e.g., 3000000 → "3.0M")
 */
export const formatPhoPoints = (points: number): string => {
    if (points >= 1000000) {
        const millions = points / 1000000;
        return `${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
    }
    if (points >= 1000) {
        const thousands = points / 1000;
        return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}K`;
    }
    return points.toLocaleString();
};

/**
 * Format Phở Points with full precision for transactions
 */
export const formatPhoPointsFull = (points: number): string => {
    return points.toLocaleString('en-US');
};

/**
 * Format Phở Points as USD value
 */
export const formatPhoPointsAsUSD = (points: number): string => {
    const usd = convertPhoPointsToUSD(points);
    return `$${usd.toFixed(2)}`;
};

// ==========================================
// Calculation Functions
// ==========================================

/**
 * Calculate if user has enough points for an action
 */
export const hasEnoughPoints = (balance: number, cost: number): boolean => {
    return balance >= cost;
};

/**
 * Calculate remaining points after action
 */
export const calculateRemainingPoints = (balance: number, cost: number): number => {
    return Math.max(0, balance - cost);
};

/**
 * Calculate usage percentage (for progress bars)
 */
export const calculateUsagePercentage = (
    pointsUsed: number,
    pointsAllocated: number
): number => {
    if (pointsAllocated === 0) return 0;
    return Math.min(100, Math.round((pointsUsed / pointsAllocated) * 100));
};

/**
 * Calculate gross margin for a transaction
 * @param revenue - Phở Points charged to user (converted to USD)
 * @param cogs - Cost of goods sold in USD
 */
export const calculateMargin = (pointsCharged: number, cogsUSD: number): number => {
    const revenueUSD = convertPhoPointsToUSD(pointsCharged);
    if (revenueUSD === 0) return 0;
    return ((revenueUSD - cogsUSD) / revenueUSD) * 100;
};

// ==========================================
// Tier Helpers
// ==========================================

import { SubscriptionTier, TIER_HIERARCHY, TIER_FEATURES } from './constants';

/**
 * Check if a tier has access to a feature tier
 * Example: hasTierAccess('starter', 'free') → true
 */
export const hasTierAccess = (
    userTier: SubscriptionTier,
    requiredTier: SubscriptionTier
): boolean => {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
};

/**
 * Get tier features
 */
export const getTierFeatures = (tier: SubscriptionTier) => {
    return TIER_FEATURES[tier] || TIER_FEATURES.free;
};

/**
 * Check if user can generate 4K content
 */
export const canGenerate4K = (tier: SubscriptionTier): boolean => {
    return getTierFeatures(tier).has4K;
};

/**
 * Check if user can use Pro models (LTX Pro, etc.)
 */
export const canUseProModels = (tier: SubscriptionTier): boolean => {
    return getTierFeatures(tier).hasProModels;
};

/**
 * Get maximum video duration for tier (in seconds)
 */
export const getMaxVideoDuration = (tier: SubscriptionTier): number => {
    return getTierFeatures(tier).maxVideoDuration;
};

/**
 * Check if output should have watermark
 */
export const shouldAddWatermark = (tier: SubscriptionTier): boolean => {
    return getTierFeatures(tier).hasWatermark;
};

// ==========================================
// Date/Time Helpers
// ==========================================

/**
 * Get the first day of the current month
 */
export const getMonthStart = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the current month
 */
export const getMonthEnd = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
};

/**
 * Get expiration date for monthly allocation (30 days after month end for rollover)
 */
export const getAllocationExpiry = (date: Date = new Date()): Date => {
    const monthEnd = getMonthEnd(date);
    monthEnd.setDate(monthEnd.getDate() + 30); // 30-day rollover buffer
    return monthEnd;
};

/**
 * Get current allocation period as ISO string (YYYY-MM-01)
 */
export const getCurrentPeriod = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};
