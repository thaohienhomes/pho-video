"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import {
    Crown,
    Zap,
    Sparkles,
    Check,
    ExternalLink,
    Loader2,
    Calendar,
    CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPhoPoints } from "@/lib/pho-points"

// Plan configurations
const PLANS = [
    {
        id: "free",
        name: "Free",
        nameVi: "Miễn Phí",
        price: "$0",
        priceVi: "0đ",
        points: "50,000",
        color: "border-gray-500/20",
        icon: Zap,
        features: [
            { en: "50,000 Phở Points/month", vi: "50.000 Phở Points/tháng" },
            { en: "5s max video", vi: "Video tối đa 5 giây" },
            { en: "Standard models", vi: "Các model chuẩn" },
            { en: "3 daily generations", vi: "3 lượt/ngày" }
        ]
    },
    {
        id: "starter",
        name: "Starter",
        nameVi: "Khởi Đầu",
        price: "$9",
        priceVi: "199.000đ",
        points: "1,000,000",
        color: "border-blue-500/30",
        icon: Zap,
        features: [
            { en: "1,000,000 Phở Points/month", vi: "1.000.000 Phở Points/tháng" },
            { en: "10s max video", vi: "Video tối đa 10 giây" },
            { en: "No watermark", vi: "Không watermark" },
            { en: "50 daily generations", vi: "50 lượt/ngày" }
        ]
    },
    {
        id: "creator",
        name: "Creator",
        nameVi: "Sáng Tạo",
        price: "$24",
        priceVi: "499.000đ",
        points: "3,000,000",
        color: "border-purple-500/30",
        popular: true,
        icon: Sparkles,
        features: [
            { en: "3,000,000 Phở Points/month", vi: "3.000.000 Phở Points/tháng" },
            { en: "20s max video", vi: "Video tối đa 20 giây" },
            { en: "Pro models (Kling, LTX Pro)", vi: "Các model Pro" },
            { en: "4K upscaling", vi: "Upscale 4K" },
            { en: "200 daily generations", vi: "200 lượt/ngày" }
        ]
    },
    {
        id: "pro",
        name: "Pro",
        nameVi: "Chuyên Nghiệp",
        price: "$49",
        priceVi: "999.000đ",
        points: "7,000,000",
        color: "border-amber-500/30",
        icon: Crown,
        features: [
            { en: "7,000,000 Phở Points/month", vi: "7.000.000 Phở Points/tháng" },
            { en: "Unlimited video duration", vi: "Không giới hạn thời lượng" },
            { en: "All models + early access", vi: "Tất cả model + truy cập sớm" },
            { en: "API access", vi: "Truy cập API" },
            { en: "Priority support", vi: "Hỗ trợ ưu tiên" }
        ]
    }
]

interface AccountStats {
    balance: number
    tier: string
    status: string
}

export default function SubscriptionPage() {
    const { user, isLoaded } = useUser()
    const pathname = usePathname()
    const isVietnamese = pathname.includes("/vi/")
    const locale = pathname.split("/")[1] || "en"

    const [stats, setStats] = useState<AccountStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [portalLoading, setPortalLoading] = useState(false)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/pho-points/balance")
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }

        if (isLoaded && user) {
            fetchStats()
        }
    }, [isLoaded, user])

    const handleManageSubscription = async () => {
        setPortalLoading(true)
        try {
            // For now, redirect to Polar dashboard
            // In production, generate customer portal URL
            window.open("https://sandbox.polar.sh", "_blank")
        } catch (error) {
            console.error("Failed to open portal:", error)
        } finally {
            setPortalLoading(false)
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
        )
    }

    const currentTier = stats?.tier || "free"
    const currentPlan = PLANS.find(p => p.id === currentTier) || PLANS[0]
    const CurrentIcon = currentPlan.icon

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {isVietnamese ? "Quản Lý Gói Đăng Ký" : "Subscription Management"}
                </h1>
                <p className="text-white/60 mt-1">
                    {isVietnamese
                        ? "Xem và quản lý gói đăng ký hiện tại của bạn"
                        : "View and manage your current subscription plan"
                    }
                </p>
            </div>

            {/* Current Plan Card */}
            <div className={`bg-black/40 backdrop-blur-xl border ${currentPlan.color} rounded-2xl p-6`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F0421C] to-orange-500 flex items-center justify-center">
                            <CurrentIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">
                                {isVietnamese ? "Gói hiện tại" : "Current Plan"}
                            </p>
                            <h2 className="text-2xl font-bold text-white">
                                {isVietnamese ? currentPlan.nameVi : currentPlan.name}
                            </h2>
                            <p className="text-white/60 text-sm">
                                {formatPhoPoints(parseInt(currentPlan.points.replace(/,/g, "")))} {isVietnamese ? "Phở Points/tháng" : "Phở Points/month"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {currentTier !== "free" && (
                            <Button
                                variant="outline"
                                className="border-white/10 text-white hover:bg-white/5 gap-2"
                                onClick={handleManageSubscription}
                                disabled={portalLoading}
                            >
                                {portalLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                                {isVietnamese ? "Quản Lý Thanh Toán" : "Manage Billing"}
                            </Button>
                        )}

                        {currentTier === "free" && (
                            <Link href={`/${locale}/pricing`}>
                                <Button className="bg-[#F0421C] hover:bg-[#D93A18] gap-2">
                                    <Crown className="w-4 h-4" />
                                    {isVietnamese ? "Nâng Cấp Ngay" : "Upgrade Now"}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Subscription Info */}
                {currentTier !== "free" && (
                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                {isVietnamese ? "Trạng thái" : "Status"}
                            </p>
                            <p className="text-green-400 font-medium mt-1">
                                {isVietnamese ? "Đang hoạt động" : "Active"}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                {isVietnamese ? "Chu kỳ" : "Billing Cycle"}
                            </p>
                            <p className="text-white font-medium mt-1">
                                {isVietnamese ? "Hàng tháng" : "Monthly"}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                {isVietnamese ? "Gia hạn tiếp theo" : "Next Renewal"}
                            </p>
                            <p className="text-white font-medium mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">
                                {isVietnamese ? "Giá" : "Price"}
                            </p>
                            <p className="text-white font-medium mt-1">
                                {isVietnamese ? currentPlan.priceVi : currentPlan.price}/
                                {isVietnamese ? "tháng" : "mo"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Plans */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                    {isVietnamese ? "So Sánh Các Gói" : "Compare Plans"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PLANS.map((plan) => {
                        const PlanIcon = plan.icon
                        const isCurrent = plan.id === currentTier

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-black/40 backdrop-blur-xl border rounded-xl p-5 ${isCurrent ? "border-[#F0421C]" : "border-white/10"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#F0421C] text-white text-xs font-medium rounded-full">
                                        {isVietnamese ? "Phổ biến" : "Popular"}
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                                        {isVietnamese ? "Hiện tại" : "Current"}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    <PlanIcon className="w-5 h-5 text-[#F0421C]" />
                                    <span className="font-semibold text-white">
                                        {isVietnamese ? plan.nameVi : plan.name}
                                    </span>
                                </div>

                                <p className="text-2xl font-bold text-white mb-1">
                                    {isVietnamese ? plan.priceVi : plan.price}
                                    <span className="text-sm font-normal text-white/40">
                                        /{isVietnamese ? "tháng" : "mo"}
                                    </span>
                                </p>

                                <p className="text-sm text-[#F0421C] mb-4">
                                    {plan.points} 🍜
                                </p>

                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            {isVietnamese ? feature.vi : feature.en}
                                        </li>
                                    ))}
                                </ul>

                                {!isCurrent && plan.id !== "free" && (
                                    <Link href={`/${locale}/pricing`} className="block mt-4">
                                        <Button
                                            size="sm"
                                            variant={plan.id > currentTier ? "default" : "outline"}
                                            className={`w-full ${plan.id > currentTier
                                                    ? "bg-[#F0421C] hover:bg-[#D93A18]"
                                                    : "border-white/10 text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {plan.id > currentTier
                                                ? (isVietnamese ? "Nâng cấp" : "Upgrade")
                                                : (isVietnamese ? "Hạ cấp" : "Downgrade")
                                            }
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-medium">
                            {isVietnamese ? "Cần hỗ trợ?" : "Need help?"}
                        </h3>
                        <p className="text-white/60 text-sm">
                            {isVietnamese
                                ? "Liên hệ support@pho.video hoặc xem FAQ"
                                : "Contact support@pho.video or check our FAQ"
                            }
                        </p>
                    </div>
                    <Link href={`/${locale}/faq`}>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            {isVietnamese ? "Xem FAQ" : "View FAQ"}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
