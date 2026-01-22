/**
 * Phở Points System - CLIENT-SAFE EXPORTS
 * 
 * This file only exports client-safe utilities (constants, formatting, calculations)
 * 
 * For server-side transaction functions, import directly from:
 * import { deductPhoPoints, ... } from '@/lib/pho-points/transactions';
 * 
 * Usage:
 * import { COST_PHO_POINTS, formatPhoPoints } from '@/lib/pho-points';
 */

// Constants (client-safe)
export {
    COST_PHO_POINTS,
    SUBSCRIPTION_PHO_POINTS,
    SUBSCRIPTION_PRICES,
    BONUS_PHO_POINTS,
    TRANSACTION_TYPES,
    TIER_HIERARCHY,
    TIER_FEATURES,
    type SubscriptionTier,
    type SubscriptionStatus,
} from './constants';

// Utility Functions (client-safe)
export {
    // Conversion
    convertUSDtoPhoPoints,
    convertPhoPointsToUSD,
    // Formatting
    formatPhoPoints,
    formatPhoPointsFull,
    formatPhoPointsAsUSD,
    // Calculations
    hasEnoughPoints,
    calculateRemainingPoints,
    calculateUsagePercentage,
    calculateMargin,
    // Tier Helpers
    hasTierAccess,
    getTierFeatures,
    canGenerate4K,
    canUseProModels,
    getMaxVideoDuration,
    shouldAddWatermark,
    // Date Helpers
    getMonthStart,
    getMonthEnd,
    getAllocationExpiry,
    getCurrentPeriod,
} from './utils';

// ⚠️ TRANSACTION FUNCTIONS (SERVER-ONLY) ⚠️
// These are NOT exported from the barrel to prevent client-side bundling of db.ts
// Import directly in API routes:
// import { deductPhoPoints, getPhoPointsBalance, ... } from '@/lib/pho-points/transactions';

