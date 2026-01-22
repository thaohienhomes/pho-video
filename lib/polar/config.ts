/**
 * Polar.sh Configuration
 * 
 * Configuration and constants for Polar payment integration
 */

import { Polar } from '@polar-sh/sdk';

// Initialize Polar client
export const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

// Product IDs (from Polar Dashboard > Products > Copy Product ID)
export const POLAR_PRODUCTS = {
    STARTER_MONTHLY: process.env.POLAR_STARTER_MONTHLY_PRODUCT_ID!,
    STARTER_ANNUAL: process.env.POLAR_STARTER_ANNUAL_PRODUCT_ID!,
    CREATOR_MONTHLY: process.env.POLAR_CREATOR_MONTHLY_PRODUCT_ID!,
    CREATOR_ANNUAL: process.env.POLAR_CREATOR_ANNUAL_PRODUCT_ID!,
    PRO_MONTHLY: process.env.POLAR_PRO_MONTHLY_PRODUCT_ID!,
    PRO_ANNUAL: process.env.POLAR_PRO_ANNUAL_PRODUCT_ID!,
} as const;

// Debug: Log product IDs status to verify they are loaded
console.log("🔍 [Polar Config] Environment check:")
console.log("   POLAR_ACCESS_TOKEN status:", process.env.POLAR_ACCESS_TOKEN ? `LOADED (len: ${process.env.POLAR_ACCESS_TOKEN.length})` : "MISSING")
Object.entries(POLAR_PRODUCTS).forEach(([key, value]) => {
    console.log(`   ${key}:`, value ? `LOADED (len: ${value.length})` : "MISSING")
})

// Map tier + billing cycle to product ID
export function getProductId(tier: string, billingCycle: 'monthly' | 'annual'): string | null {
    const key = `${tier.toUpperCase()}_${billingCycle.toUpperCase()}` as keyof typeof POLAR_PRODUCTS;
    return POLAR_PRODUCTS[key] || null;
}

// Tier to Phở Points allocation mapping  
export const TIER_PHO_POINTS = {
    starter: 1000000,   // 1M points
    creator: 3000000,   // 3M points
    pro: 7000000,       // 7M points
    lifetime: 2000000,  // 2M points/month
} as const;

// Subscription tier labels
export const TIER_LABELS = {
    free: 'Free',
    starter: 'Starter',
    creator: 'Creator',
    pro: 'Pro',
    lifetime: 'Lifetime',
} as const;

