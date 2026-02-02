"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import {
    Crown,
    Zap,
    Sparkles,
    TrendingUp,
    Video,
    CreditCard,
    ArrowUpRight,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatPhoPoints } from "@/lib/pho-points"

// Tier configurations
const TIER_CONFIG: Record<string, {
    name: string
    nameVi: string
    color: string
    bgColor: string
    icon: React.ComponentType<{ className?: string }>
    maxPoints: number
}> = {
    free: {
        name: "Free",
        nameVi: "Miễn Phí",
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
        icon: Zap,
        maxPoints: 50000
    },
    starter: {
        name: "Starter",
        nameVi: "Khởi Đầu",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        icon: Zap,
        maxPoints: 1000000
    },
    creator: {
        name: "Creator",
        nameVi: "Sáng Tạo",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        icon: Sparkles,
        maxPoints: 3000000
    },
    pro: {
        name: "Pro",
        nameVi: "Chuyên Nghiệp",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        icon: Crown,
        maxPoints: 7000000
    }
}

interface AccountStats {
    balance: number
    tier: string
    status: string
    lifetimeEarned: number
    lifetimeSpent: number
}

export default function AccountOverviewPage() {
    const { user, isLoaded } = useUser()
    const pathname = usePathname()
    const isVietnamese = pathname.includes("/vi/")
    const locale = pathname.split("/")[1] || "en"

    const [stats, setStats] = useState<AccountStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [generationsCount, setGenerationsCount] = useState(0)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [balanceRes, generationsRes] = await Promise.all([
                    fetch("/api/pho-points/balance"),
                    fetch("/api/generations")
                ])

                if (balanceRes.ok) {
                    const data = await balanceRes.json()
                    setStats(data)
                }

                if (generationsRes.ok) {
                    const data = await generationsRes.json()
                    setGenerationsCount(data.generations?.length || 0)
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

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
        )
    }

    const tier = stats?.tier || "free"
    const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free
    const TierIcon = tierConfig.icon
    const pointsPercentage = stats ? Math.min((stats.balance / tierConfig.maxPoints) * 100, 100) : 0

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {isVietnamese ? "Tổng Quan Tài Khoản" : "Account Overview"}
                </h1>
                <p className="text-white/60 mt-1">
                    {isVietnamese
                        ? "Quản lý tài khoản và xem thống kê sử dụng của bạn"
                        : "Manage your account and view your usage statistics"
                    }
                </p>
            </div>

            {/* User Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0421C] to-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                        {user?.imageUrl ? (
                            <Image
                                src={user.imageUrl}
                                alt="User Avatar"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            user?.firstName?.[0] || "U"
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white">
                            {user?.fullName || user?.firstName || "User"}
                        </h2>
                        <p className="text-white/60">{user?.primaryEmailAddress?.emailAddress}</p>

                        {/* Tier Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2 ${tierConfig.bgColor}`}>
                            <TierIcon className={`w-4 h-4 ${tierConfig.color}`} />
                            <span className={`text-sm font-medium ${tierConfig.color}`}>
                                {isVietnamese ? tierConfig.nameVi : tierConfig.name}
                            </span>
                        </div>
                    </div>

                    {/* Manage Subscription Button */}
                    <Link href={`/${locale}/account/subscription`}>
                        <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
                            <CreditCard className="w-4 h-4" />
                            {isVietnamese ? "Quản Lý Gói" : "Manage Plan"}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Phở Points Balance */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white/60 text-sm">
                                {isVietnamese ? "Phở Points Hiện Tại" : "Current Phở Points"}
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                                {formatPhoPoints(stats?.balance || 0)} <span className="text-[#F0421C]">🍜</span>
                            </p>
                        </div>
                        <Link href={`/${locale}/pricing`}>
                            <Button size="sm" className="bg-[#F0421C] hover:bg-[#D93A18] gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {isVietnamese ? "Nâng Cấp" : "Upgrade"}
                            </Button>
                        </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>{isVietnamese ? "Đã sử dụng" : "Used"}</span>
                            <span>{Math.round(pointsPercentage)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#F0421C] to-orange-500 transition-all duration-500"
                                style={{ width: `${pointsPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                            {formatPhoPoints(tierConfig.maxPoints - (stats?.balance || 0))} {isVietnamese ? "đã dùng tháng này" : "used this month"}
                        </p>
                    </div>
                </div>

                {/* Generations Count */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Video className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-white/60 text-sm">
                            {isVietnamese ? "Video Đã Tạo" : "Videos Created"}
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-white">{generationsCount}</p>
                    <Link
                        href={`/${locale}/account/usage`}
                        className="text-sm text-[#F0421C] hover:underline mt-2 inline-flex items-center gap-1"
                    >
                        {isVietnamese ? "Xem lịch sử" : "View history"}
                        <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/${locale}/account/subscription`}>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {isVietnamese ? "Quản Lý Đăng Ký" : "Manage Subscription"}
                                    </p>
                                    <p className="text-white/40 text-sm">
                                        {isVietnamese ? "Nâng cấp, hạ cấp, hoặc hủy" : "Upgrade, downgrade, or cancel"}
                                    </p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Link>

                <Link href={`/${locale}/account/settings`}>
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {isVietnamese ? "Cài Đặt Tài Khoản" : "Account Settings"}
                                    </p>
                                    <p className="text-white/40 text-sm">
                                        {isVietnamese ? "Ngôn ngữ, thông báo, preferences" : "Language, notifications, preferences"}
                                    </p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
