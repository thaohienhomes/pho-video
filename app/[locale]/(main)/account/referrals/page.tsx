"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import {
    Gift,
    Copy,
    Check,
    Share2,
    Users,
    Sparkles,
    ArrowRight,
    ChevronRight,
    ExternalLink,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

// Constants
const REFERRAL_BONUS = 100000 // 100K Phở Points per referral

interface ReferralStats {
    totalReferrals: number
    totalPointsEarned: number
    referralCode: string
}

interface Referral {
    id: string
    pointsEarned: number
    createdAt: string
    label: string
}

export default function ReferralsPage() {
    const { user, isLoaded } = useUser()
    const t = useTranslations("referral")
    const [copied, setCopied] = useState(false)
    const [shareMenuOpen, setShareMenuOpen] = useState(false)
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)

    // User's referral code is their Clerk User ID
    const referralCode = user?.id || ""
    const referralLink = typeof window !== "undefined"
        ? `${window.location.origin}/sign-up?ref=${referralCode}`
        : ""

    // Fetch referral stats
    useEffect(() => {
        async function fetchStats() {
            if (!isLoaded || !user) return

            try {
                const res = await fetch('/api/referrals/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data.stats)
                    setReferrals(data.referrals || [])
                }
            } catch (error) {
                console.error('Failed to fetch referral stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [isLoaded, user])

    const handleCopy = async () => {
        if (!referralLink) return

        try {
            await navigator.clipboard.writeText(referralLink)
            setCopied(true)
            toast.success(t("copied"))
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    const handleShare = async (platform: "twitter" | "facebook" | "whatsapp" | "email") => {
        const message = t("share_message")
        const encodedMessage = encodeURIComponent(message)
        const encodedLink = encodeURIComponent(referralLink)

        const urls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
            whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedLink}`,
            email: `mailto:?subject=${encodeURIComponent(t("email_subject"))}&body=${encodedMessage}%20${encodedLink}`,
        }

        window.open(urls[platform], "_blank", "width=600,height=400")
        setShareMenuOpen(false)
    }

    const formatPoints = (points: number) => {
        if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
        if (points >= 1000) return `${(points / 1000).toFixed(0)}K`
        return points.toString()
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-pulse text-white/60">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <Link href="/studio" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <span className="text-sm">Back to Studio</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 border border-primary/30 flex items-center justify-center"
                    >
                        <Gift className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
                    <p className="text-gray-400 max-w-md mx-auto">{t("subtitle")}</p>
                </div>

                {/* Reward Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-2xl border border-primary/20 p-8 mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">
                                {t("reward_title")}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {t("reward_desc")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-white/10">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className="text-xl font-bold text-white">
                                {(REFERRAL_BONUS / 1000).toFixed(0)}K
                            </span>
                            <span className="text-sm text-gray-400">Phở Points</span>
                        </div>
                    </div>
                </motion.div>

                {/* Referral Link Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8"
                >
                    <h3 className="text-sm font-medium text-gray-400 mb-3">{t("your_link")}</h3>

                    {/* Link Display */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 bg-black/50 rounded-lg px-4 py-3 border border-white/10 font-mono text-sm text-white/80 truncate">
                            {referralLink || "Loading..."}
                        </div>
                        <Button
                            onClick={handleCopy}
                            variant="outline"
                            className="shrink-0 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span className="hidden sm:inline">{t("copied")}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t("copy")}</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("twitter")}
                            className="gap-2 bg-[#1DA1F2]/10 border-[#1DA1F2]/30 text-[#1DA1F2] hover:bg-[#1DA1F2]/20"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Twitter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("facebook")}
                            className="gap-2 bg-[#4267B2]/10 border-[#4267B2]/30 text-[#4267B2] hover:bg-[#4267B2]/20"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("whatsapp")}
                            className="gap-2 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare("email")}
                            className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                        </Button>
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 rounded-2xl border border-white/10 p-6"
                >
                    <h3 className="text-lg font-semibold mb-6">{t("how_it_works")}</h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Share2 className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-medium text-white mb-1">{t("step1_title")}</h4>
                            <p className="text-sm text-gray-400">{t("step1_desc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="font-medium text-white mb-1">{t("step2_title")}</h4>
                            <p className="text-sm text-gray-400">{t("step2_desc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Gift className="w-6 h-6 text-amber-400" />
                            </div>
                            <h4 className="font-medium text-white mb-1">{t("step3_title")}</h4>
                            <p className="text-sm text-gray-400">{t("step3_desc")}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-2 gap-4"
                >
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5 text-center">
                        {loading ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-white/40" />
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {stats?.totalReferrals || 0}
                                </div>
                                <div className="text-sm text-gray-400">{t("stats_referrals")}</div>
                            </>
                        )}
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5 text-center">
                        {loading ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-white/40" />
                        ) : (
                            <>
                                <div className="text-3xl font-bold text-amber-400 mb-1">
                                    {formatPoints(stats?.totalPointsEarned || 0)}
                                </div>
                                <div className="text-sm text-gray-400">{t("stats_earned")}</div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Referral History */}
                {referrals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-white/10">
                            <h3 className="font-semibold">Referral History</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {referrals.map((referral) => (
                                <div key={referral.id} className="px-5 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{referral.label}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(referral.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                                        <Sparkles className="w-4 h-4" />
                                        +{formatPoints(referral.pointsEarned)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Terms */}
                <p className="text-xs text-center text-gray-500 mt-8">
                    {t("terms")}
                </p>
            </div>
        </div>
    )
}

