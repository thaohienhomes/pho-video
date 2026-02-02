"use client"

import { useEffect, createContext, useContext, useCallback, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import posthog from "posthog-js"

// Define analytics events with their payloads
export type AnalyticsEvent =
    | { event: "sign_up"; properties: { method: string } }
    | { event: "sign_in"; properties: { method: string } }
    | { event: "generation_started"; properties: { model_id: string; mode: string; cost: number } }
    | { event: "generation_completed"; properties: { model_id: string; mode: string; duration_ms: number; success: boolean } }
    | { event: "subscription_purchased"; properties: { tier: string; amount: number; billing_cycle: "monthly" | "annual" } }
    | { event: "credit_pack_purchased"; properties: { pack_id: string; amount: number; credits: number } }
    | { event: "referral_shared"; properties: { method: string } }
    | { event: "referral_claimed"; properties: { bonus_amount: number } }
    | { event: "feature_used"; properties: { feature: string; context?: string } }
    | { event: "page_view"; properties: { page: string; referrer?: string } }
    | { event: "cta_clicked"; properties: { cta_name: string; location: string } }
    | { event: "error_occurred"; properties: { error_type: string; message: string; context?: string } }

// Initialize PostHog once
let posthogInitialized = false

function initPostHog() {
    if (posthogInitialized) return
    if (typeof window === "undefined") return

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"

    if (posthogKey && posthogKey !== "phc_your_key_here") {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            capture_pageview: false, // We handle manually
            capture_pageleave: true,
            autocapture: false, // Explicit events only
            persistence: "localStorage",
            disable_session_recording: false,
        })
        posthogInitialized = true
        console.log("[PostHog] Initialized successfully")
    } else if (process.env.NODE_ENV === "development") {
        console.log("[PostHog] Running in dev mode (no key)")
    }
}

// PostHog client wrapper
interface PostHogClient {
    capture: (event: string, properties?: Record<string, unknown>) => void
    identify: (userId: string, traits?: Record<string, unknown>) => void
    reset: () => void
}

const createAnalyticsClient = (): PostHogClient => {
    const isDev = process.env.NODE_ENV === "development"
    const hasPostHog = typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY

    return {
        capture: (event, properties) => {
            if (hasPostHog && posthogInitialized) {
                posthog.capture(event, properties)
            }
            if (isDev) {
                console.log(`[Analytics] Event: ${event}`, properties)
            }
        },
        identify: (userId, traits) => {
            if (hasPostHog && posthogInitialized) {
                posthog.identify(userId, traits)
            }
            if (isDev) {
                console.log(`[Analytics] Identify: ${userId}`, traits)
            }
        },
        reset: () => {
            if (hasPostHog && posthogInitialized) {
                posthog.reset()
            }
            if (isDev) {
                console.log(`[Analytics] Reset session`)
            }
        },
    }
}


// Analytics context
interface AnalyticsContextValue {
    track: <T extends AnalyticsEvent>(event: T["event"], properties: T["properties"]) => void
    identify: (userId: string, traits?: Record<string, unknown>) => void
    trackPageView: (page: string) => void
    trackCTA: (ctaName: string, location: string) => void
    trackError: (errorType: string, message: string, context?: string) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const { user, isSignedIn } = useUser()

    // Initialize PostHog on mount
    useEffect(() => {
        initPostHog()
    }, [])

    const client = useMemo(() => createAnalyticsClient(), [])

    // Identify user when signed in
    useEffect(() => {
        if (isSignedIn && user) {
            client.identify(user.id, {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName,
                created_at: user.createdAt,
            })
        }
    }, [isSignedIn, user, client])

    const track = useCallback(
        <T extends AnalyticsEvent>(event: T["event"], properties: T["properties"]) => {
            client.capture(event, properties as Record<string, unknown>)
        },
        [client]
    )

    const identify = useCallback(
        (userId: string, traits?: Record<string, unknown>) => {
            client.identify(userId, traits)
        },
        [client]
    )

    const trackPageView = useCallback(
        (page: string) => {
            client.capture("page_view", {
                page,
                referrer: typeof window !== "undefined" ? document.referrer : undefined,
            })
        },
        [client]
    )

    const trackCTA = useCallback(
        (ctaName: string, location: string) => {
            client.capture("cta_clicked", { cta_name: ctaName, location })
        },
        [client]
    )

    const trackError = useCallback(
        (errorType: string, message: string, context?: string) => {
            client.capture("error_occurred", { error_type: errorType, message, context })
        },
        [client]
    )

    const value = useMemo(
        () => ({ track, identify, trackPageView, trackCTA, trackError }),
        [track, identify, trackPageView, trackCTA, trackError]
    )

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

// Hook to use analytics
export function useAnalytics() {
    const context = useContext(AnalyticsContext)
    if (!context) {
        // Return a no-op version if used outside provider
        return {
            track: () => { },
            identify: () => { },
            trackPageView: () => { },
            trackCTA: () => { },
            trackError: () => { },
        }
    }
    return context
}

// Utility functions for specific events (can be used outside React components)
export const trackGeneration = (params: {
    userId: string
    modelId: string
    mode: "t2v" | "i2v" | "t2i" | "audio" | "lipsync" | "tryon" | "upscale" | "storyboard"
    cost: number
    success: boolean
    durationMs?: number
}) => {
    if (typeof window !== "undefined" && posthogInitialized) {
        posthog.capture("generation_completed", {
            model_id: params.modelId,
            mode: params.mode,
            cost: params.cost,
            success: params.success,
            duration_ms: params.durationMs,
        })
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] Generation:`, params)
    }
}

export const trackSubscription = (params: {
    tier: string
    amount: number
    billingCycle: "monthly" | "annual"
}) => {
    if (typeof window !== "undefined" && posthogInitialized) {
        posthog.capture("subscription_purchased", {
            tier: params.tier,
            amount: params.amount,
            billing_cycle: params.billingCycle,
        })
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] Subscription:`, params)
    }
}

export const trackCreditPurchase = (params: {
    packId: string
    amount: number
    credits: number
}) => {
    if (typeof window !== "undefined" && posthogInitialized) {
        posthog.capture("credit_pack_purchased", {
            pack_id: params.packId,
            amount: params.amount,
            credits: params.credits,
        })
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] Credit Purchase:`, params)
    }
}

export const trackRefund = (params: {
    userId: string
    amount: number
    reason: string
    modelId?: string
}) => {
    if (typeof window !== "undefined" && posthogInitialized) {
        posthog.capture("points_refunded", {
            amount: params.amount,
            reason: params.reason,
            model_id: params.modelId,
        })
    }
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] Refund:`, params)
    }
}
