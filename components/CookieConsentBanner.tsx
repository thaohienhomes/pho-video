"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X, Settings, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const COOKIE_CONSENT_KEY = "pho-cookie-consent"

type ConsentPreferences = {
    essential: boolean // Always true
    analytics: boolean
    marketing: boolean
}

export function CookieConsentBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [preferences, setPreferences] = useState<ConsentPreferences>({
        essential: true,
        analytics: false,
        marketing: false,
    })

    useEffect(() => {
        // Check if consent has already been given
        const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
        if (!storedConsent) {
            // Delay showing banner to avoid layout shift
            const timer = setTimeout(() => setShowBanner(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAcceptAll = () => {
        const allConsent: ConsentPreferences = {
            essential: true,
            analytics: true,
            marketing: true,
        }
        saveConsent(allConsent)
    }

    const handleAcceptSelected = () => {
        saveConsent(preferences)
    }

    const handleRejectAll = () => {
        const minimalConsent: ConsentPreferences = {
            essential: true,
            analytics: false,
            marketing: false,
        }
        saveConsent(minimalConsent)
    }

    const saveConsent = (consent: ConsentPreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            ...consent,
            timestamp: new Date().toISOString(),
        }))
        setShowBanner(false)

        // Notify analytics system
        if (consent.analytics) {
            console.log("[Cookie Consent] Analytics enabled")
            // TODO: Initialize PostHog/analytics here
        }
    }

    if (!showBanner) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Main Banner */}
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                                    <Cookie className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        🍪 We Value Your Privacy
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                                        You can customize your preferences or accept all cookies.{" "}
                                        <Link href="/legal/privacy" className="text-primary hover:underline">
                                            Learn more
                                        </Link>
                                    </p>
                                </div>
                                <button
                                    onClick={handleRejectAll}
                                    className="p-1 text-gray-500 hover:text-white transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Settings Panel */}
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                                            {/* Essential */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                <div>
                                                    <p className="font-medium text-white text-sm">Essential Cookies</p>
                                                    <p className="text-xs text-gray-500">Required for the site to function</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                                    Always On
                                                </div>
                                            </div>

                                            {/* Analytics */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                <div>
                                                    <p className="font-medium text-white text-sm">Analytics Cookies</p>
                                                    <p className="text-xs text-gray-500">Help us improve our services</p>
                                                </div>
                                                <button
                                                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                                    className={`w-12 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-primary' : 'bg-white/20'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>

                                            {/* Marketing */}
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                <div>
                                                    <p className="font-medium text-white text-sm">Marketing Cookies</p>
                                                    <p className="text-xs text-gray-500">Personalized ads and content</p>
                                                </div>
                                                <button
                                                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                                    className={`w-12 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-primary' : 'bg-white/20'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 mt-6">
                                <Button
                                    onClick={handleAcceptAll}
                                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept All
                                </Button>
                                <Button
                                    onClick={() => setShowSettings(!showSettings)}
                                    variant="outline"
                                    className="bg-white/5 border-white/10 hover:bg-white/10 gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    {showSettings ? "Hide Settings" : "Customize"}
                                </Button>
                                {showSettings && (
                                    <Button
                                        onClick={handleAcceptSelected}
                                        variant="outline"
                                        className="bg-white/5 border-white/10 hover:bg-white/10"
                                    >
                                        Save Preferences
                                    </Button>
                                )}
                                <Button
                                    onClick={handleRejectAll}
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white"
                                >
                                    Reject All
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

// Utility to check consent status
export function getCookieConsent(): ConsentPreferences | null {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null

    try {
        return JSON.parse(stored)
    } catch {
        return null
    }
}

// Utility to reset consent (for testing/settings page)
export function resetCookieConsent() {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
}
