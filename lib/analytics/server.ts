/**
 * Server-side analytics utilities for API routes
 * These track key business events for monitoring and optimization
 */

import { PostHog } from 'posthog-node'

type GenerationEvent = {
    userId: string
    modelId: string
    mode: "t2v" | "i2v" | "t2i" | "audio" | "lipsync" | "tryon" | "upscale" | "storyboard" | "music" | "tts" | "stt"
    cost: number
    success: boolean
    durationMs?: number
}

type SubscriptionEvent = {
    userId: string
    tier: string
    amount: number
    billingCycle: "monthly" | "annual"
}

type CreditPurchaseEvent = {
    userId: string
    packId: string
    amount: number
    credits: number
}

type RefundEvent = {
    userId: string
    amount: number
    reason: string
    modelId?: string
}

// Initialize PostHog Node client (singleton)
let posthogClient: PostHog | null = null

function getPostHogClient(): PostHog | null {
    if (posthogClient) return posthogClient

    const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!apiKey || apiKey === "phc_your_key_here") {
        return null
    }

    posthogClient = new PostHog(apiKey, {
        host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
        flushAt: 10,
        flushInterval: 5000,
    })

    return posthogClient
}

const logAnalyticsEvent = (event: string, distinctId: string, properties: Record<string, unknown>) => {
    const timestamp = new Date().toISOString()
    const isDev = process.env.NODE_ENV === "development"

    // Structured log for production ingestion
    const logEntry = {
        timestamp,
        event,
        distinct_id: distinctId,
        ...properties,
    }

    // Send to PostHog if configured
    const client = getPostHogClient()
    if (client) {
        client.capture({
            distinctId,
            event,
            properties,
        })
    }

    if (isDev) {
        console.log(`[Analytics:Server] ${event}`, JSON.stringify(properties, null, 2))
    } else if (!client) {
        // If no PostHog client, log as structured JSON for log aggregation tools
        console.log(JSON.stringify(logEntry))
    }
}

/**
 * Track AI generation events (video, image, audio, etc.)
 */
export function trackGeneration(params: GenerationEvent) {
    logAnalyticsEvent("generation_completed", params.userId, {
        model_id: params.modelId,
        mode: params.mode,
        cost_pts: params.cost,
        success: params.success,
        duration_ms: params.durationMs,
    })
}

/**
 * Track generation start (before API call)
 */
export function trackGenerationStart(params: {
    userId: string
    modelId: string
    mode: GenerationEvent["mode"]
    cost: number
}) {
    logAnalyticsEvent("generation_started", params.userId, {
        model_id: params.modelId,
        mode: params.mode,
        estimated_cost_pts: params.cost,
    })
}

/**
 * Track subscription purchases
 */
export function trackSubscription(params: SubscriptionEvent) {
    logAnalyticsEvent("subscription_purchased", params.userId, {
        tier: params.tier,
        amount_usd: params.amount,
        billing_cycle: params.billingCycle,
    })
}

/**
 * Track credit pack purchases
 */
export function trackCreditPurchase(params: CreditPurchaseEvent) {
    logAnalyticsEvent("credit_pack_purchased", params.userId, {
        pack_id: params.packId,
        amount_usd: params.amount,
        credits_purchased: params.credits,
    })
}

/**
 * Track refunds (for failed generations)
 */
export function trackRefund(params: RefundEvent) {
    logAnalyticsEvent("points_refunded", params.userId, {
        amount_pts: params.amount,
        reason: params.reason,
        model_id: params.modelId,
    })
}

/**
 * Track daily active users (call on any authenticated request)
 */
export function trackDAU(userId: string) {
    logAnalyticsEvent("daily_active_user", userId, {})
}

/**
 * Track errors for debugging
 */
export function trackError(params: {
    userId?: string
    errorType: string
    message: string
    context?: string
    modelId?: string
}) {
    logAnalyticsEvent("error_occurred", params.userId || "anonymous", {
        error_type: params.errorType,
        message: params.message,
        context: params.context,
        model_id: params.modelId,
    })
}

/**
 * Track conversion events
 */
export function trackConversion(params: {
    userId: string
    type: "signup" | "first_generation" | "subscription" | "credit_purchase"
    value?: number
}) {
    logAnalyticsEvent("conversion", params.userId, {
        conversion_type: params.type,
        value_usd: params.value,
    })
}
