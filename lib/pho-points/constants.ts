/**
 * Phở Points Cost Configuration
 * 
 * Exchange Rate: 1 Phở Point = $0.00001 USD
 * 100,000 Phở Points = $1.00 USD
 * 
 * All costs include ~60% gross margin (COGS × 2.5)
 */

// ==========================================
// Action Costs (in Phở Points)
// ==========================================

export const COST_PHO_POINTS = {
    // Text-to-Image
    IMAGE_FLUX_PRO: 10000,           // $0.04 COGS → 10K points (60% margin)
    IMAGE_FLUX_BATCH_4: 35000,       // $0.16 COGS → 35K points (54% margin, 12.5% batch discount)
    IMAGE_RECRAFT_V3: 12500,         // $0.05 COGS → 12.5K points (60% margin)

    // Text-to-Video (LTX Fast)
    VIDEO_5S_1080P_FAST: 50000,      // $0.20 COGS → 50K points (60% margin)
    VIDEO_10S_1080P_FAST: 100000,    // $0.40 COGS → 100K points (60% margin)

    // Text-to-Video (LTX Pro)
    VIDEO_5S_1080P_PRO: 75000,       // $0.30 COGS → 75K points (60% margin)
    VIDEO_10S_1080P_PRO: 150000,     // $0.60 COGS → 150K points (60% margin)
    VIDEO_5S_4K_PRO: 300000,         // $1.20 COGS → 300K points (60% margin)

    // Image-to-Video (Kling 2.6 via Kie.ai)
    I2V_5S_1080P: 55000,             // $0.225 COGS → 55K points (59% margin)
    I2V_10S_1080P: 110000,           // $0.45 COGS → 110K points (59% margin)

    // Grok Imagine Video (with Audio)
    GROK_VIDEO_6S: 150000,           // $0.30 COGS → 150K points (60% margin)
    GROK_I2V_6S: 155000,             // $0.302 COGS → 155K points (60% margin)

    // Enhancements
    UPSCALE_4K: 25000,               // $0.10 COGS → 25K points (60% margin)
    EXTEND_VIDEO_5S: 50000,          // $0.20 COGS → 50K points (future)
    AUDIO_GEN_10S: 20000,            // $0.08 COGS → 20K points (future)
} as const;

// ==========================================
// Subscription Tier Allocations
// ==========================================

export const SUBSCRIPTION_PHO_POINTS = {
    FREE: 50000,           // $0.50 equivalent
    STARTER: 1000000,      // $10.00 equivalent
    CREATOR: 3000000,      // $30.00 equivalent
    PRO: 7000000,          // $70.00 equivalent
    LIFETIME: 2000000,     // $20.00 equivalent/month
} as const;

// ==========================================
// Subscription Prices (USD)
// ==========================================

export const SUBSCRIPTION_PRICES = {
    STARTER_MONTHLY: 9,
    STARTER_ANNUAL: 86.40,  // $7.20/month
    CREATOR_MONTHLY: 24,
    CREATOR_ANNUAL: 230.40, // $19.20/month
    PRO_MONTHLY: 49,
    PRO_ANNUAL: 470.40,     // $39.20/month
} as const;

// ==========================================
// Bonus Amounts (for promotions)
// ==========================================

export const BONUS_PHO_POINTS = {
    SIGNUP: 50000,         // Sign-up bonus (worth $0.50)
    REFERRAL: 200000,      // For both referrer and referee
    FIRST_PURCHASE: 500000, // One-time for first buyer
    STREAK_7_DAYS: 100000, // Weekly login streak
    BIRTHDAY: 250000,      // Birthday bonus
    UPGRADE_PROMO: 1000000, // Limited-time upgrade incentive
} as const;

// ==========================================
// Transaction Types (for logging)
// ==========================================

export const TRANSACTION_TYPES = {
    // Earnings
    SUBSCRIPTION_GRANT: 'subscription_grant',
    BONUS_SIGNUP: 'bonus_signup',
    BONUS_REFERRAL: 'bonus_referral',
    BONUS_STREAK: 'bonus_streak',
    BONUS_BIRTHDAY: 'bonus_birthday',
    BONUS_FIRST_PURCHASE: 'bonus_first_purchase',

    // Spending
    SPEND_IMAGE: 'spend_image',
    SPEND_VIDEO: 'spend_video',
    SPEND_I2V: 'spend_i2v',
    SPEND_UPSCALE: 'spend_upscale',
    SPEND_AUDIO: 'spend_audio',

    // Adjustments
    REFUND: 'refund',
    ADMIN_ADJUSTMENT: 'admin_adjustment',
} as const;

// ==========================================
// Tier Definitions
// ==========================================

export type SubscriptionTier = 'free' | 'starter' | 'creator' | 'pro' | 'lifetime';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'inactive' | 'refunded';

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
    free: 0,
    starter: 1,
    creator: 2,
    pro: 3,
    lifetime: 4,
};

// Features available by tier
export const TIER_FEATURES = {
    free: {
        maxVideoDuration: 5,  // seconds
        hasWatermark: true,
        has4K: false,
        hasProModels: false,
        maxDailyGenerations: 3,
    },
    starter: {
        maxVideoDuration: 10,
        hasWatermark: false,
        has4K: false,
        hasProModels: false,
        maxDailyGenerations: 50,
    },
    creator: {
        maxVideoDuration: 20,
        hasWatermark: false,
        has4K: true,
        hasProModels: true,
        maxDailyGenerations: 200,
    },
    pro: {
        maxVideoDuration: 20,
        hasWatermark: false,
        has4K: true,
        hasProModels: true,
        maxDailyGenerations: -1, // unlimited
    },
    lifetime: {
        maxVideoDuration: 20,
        hasWatermark: false,
        has4K: true,
        hasProModels: true,
        maxDailyGenerations: -1, // unlimited
    },
} as const;
