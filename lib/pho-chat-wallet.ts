/**
 * Phở Chat Wallet Client
 * 
 * Integration layer for Phở Studio to call Phở Chat's internal wallet APIs.
 * Used for tier-based access control and credit deduction.
 */

// Phở Chat API base URL (fallback to pho.chat in production)
const PHO_CHAT_URL = process.env.PHO_CHAT_URL || 'https://pho.chat';
const INTERNAL_SECRET = process.env.PHO_INTERNAL_API_SECRET;

export interface WalletStatus {
    balance: number;
    can_use_studio: boolean;
    tier: string;
    _auto_created?: boolean;
}

export interface DeductResult {
    success: boolean;
    user_id: string;
    amount_deducted: number;
    new_balance: number;
    service: string;
}

export interface WalletError {
    error: string;
    message: string;
    code?: string;
    current_tier?: string;
}

/**
 * Check if user has access to Studio based on their subscription tier
 * 
 * @param userId - Clerk user ID
 * @returns WalletStatus with can_use_studio flag
 * @throws Error if API call fails
 */
export async function checkStudioAccess(userId: string): Promise<WalletStatus> {
    if (!INTERNAL_SECRET) {
        console.warn('⚠️ [Wallet] PHO_INTERNAL_API_SECRET not configured, allowing access by default');
        return {
            balance: 0,
            can_use_studio: true,
            tier: 'unknown',
        };
    }

    try {
        const response = await fetch(
            `${PHO_CHAT_URL}/api/internal/wallet/status?user_id=${encodeURIComponent(userId)}`,
            {
                headers: {
                    'x-internal-secret': INTERNAL_SECRET,
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            const error = await response.json() as WalletError;
            console.error(`❌ [Wallet] Status check failed (${response.status}):`, error);

            // If wallet not found, allow access by default (user might be new)
            if (response.status === 404) {
                return {
                    balance: 0,
                    can_use_studio: true, // Allow new users, tier sync will happen eventually
                    tier: 'free',
                    _auto_created: true,
                };
            }

            throw new Error(error.message || 'Failed to check wallet status');
        }

        return await response.json() as WalletStatus;
    } catch (error) {
        console.error('❌ [Wallet] Failed to reach Phở Chat wallet API:', error);
        // Fail open - allow access if API is down to prevent blocking all users
        return {
            balance: 0,
            can_use_studio: true,
            tier: 'unknown',
        };
    }
}

/**
 * Deduct credits from user wallet (for future use when migrating to unified wallet)
 * 
 * @param userId - Clerk user ID
 * @param amount - Amount to deduct
 * @param service - Service identifier (e.g., 'studio_gen')
 * @returns Deduction result or throws error
 */
export async function deductWalletCredits(
    userId: string,
    amount: number,
    service: string = 'studio_gen'
): Promise<DeductResult> {
    if (!INTERNAL_SECRET) {
        throw new Error('PHO_INTERNAL_API_SECRET not configured');
    }

    const response = await fetch(
        `${PHO_CHAT_URL}/api/internal/wallet/deduct`,
        {
            method: 'POST',
            headers: {
                'x-internal-secret': INTERNAL_SECRET,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                amount,
                service,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json() as WalletError;

        // Handle tier-blocked error specifically
        if (response.status === 403 && error.code === 'TIER_BLOCKED') {
            throw new Error(`TIER_BLOCKED: ${error.message}. Current tier: ${error.current_tier}`);
        }

        throw new Error(error.message || 'Failed to deduct wallet credits');
    }

    return await response.json() as DeductResult;
}
