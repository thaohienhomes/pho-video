"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { CheckCircle, Sparkles, ArrowRight, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "next-intl"

// Plan details based on tier
const PLAN_DETAILS: Record<string, {
    name: string
    nameVi: string
    points: string
    color: string
    icon: React.ComponentType<{ className?: string }>
    features: string[]
    featuresVi: string[]
}> = {
    starter: {
        name: "Starter",
        nameVi: "Khởi Đầu",
        points: "1,000,000",
        color: "from-blue-500 to-cyan-400",
        icon: Zap,
        features: [
            "1,000,000 Phở Points/month",
            "10s max video duration",
            "No watermark",
            "50 daily generations",
            "Email support"
        ],
        featuresVi: [
            "1.000.000 Phở Points/tháng",
            "Thời lượng tối đa 10 giây",
            "Không có Watermark",
            "50 lượt tạo mỗi ngày",
            "Hỗ trợ qua Email"
        ]
    },
    creator: {
        name: "Creator",
        nameVi: "Sáng Tạo",
        points: "3,000,000",
        color: "from-purple-500 to-pink-500",
        icon: Sparkles,
        features: [
            "3,000,000 Phở Points/month",
            "20s max video duration",
            "Pro models (Kling, LTX Pro)",
            "4K upscaling included",
            "200 daily generations",
            "Priority support"
        ],
        featuresVi: [
            "3.000.000 Phở Points/tháng",
            "Thời lượng tối đa 20 giây",
            "Các model Pro (Kling, LTX Pro)",
            "Đã bao gồm Upscale 4K",
            "200 lượt tạo mỗi ngày",
            "Hỗ trợ ưu tiên"
        ]
    },
    pro: {
        name: "Pro",
        nameVi: "Chuyên Nghiệp",
        points: "7,000,000",
        color: "from-amber-500 to-orange-500",
        icon: Crown,
        features: [
            "7,000,000 Phở Points/month",
            "Unlimited video duration",
            "All models + early access",
            "API access",
            "Unlimited generations",
            "Dedicated support",
            "Custom branding"
        ],
        featuresVi: [
            "7.000.000 Phở Points/tháng",
            "Không giới hạn thời lượng",
            "Tất cả model + quyền truy cập sớm",
            "Hỗ trợ API",
            "Không giới hạn lượt tạo",
            "Hỗ trợ riêng biệt",
            "Tùy chỉnh thương hiệu"
        ]
    }
}

export default function DashboardPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [showContent, setShowContent] = useState(false)

    const paymentStatus = searchParams.get("payment")
    const tier = searchParams.get("tier") || "starter"
    const isSuccess = paymentStatus === "success"

    const plan = PLAN_DETAILS[tier] || PLAN_DETAILS.starter
    const PlanIcon = plan.icon

    // Detect locale from URL
    const isVietnamese = typeof window !== "undefined" && window.location.pathname.includes("/vi/")

    // Confetti effect on success
    useEffect(() => {
        if (isSuccess) {
            // Delay content for dramatic effect
            setTimeout(() => setShowContent(true), 300)

            // Fire confetti
            const duration = 3000
            const end = Date.now() + duration

            const colors = ["#F0421C", "#FFD700", "#00FF88", "#00BFFF", "#FF69B4"]

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }

            frame()

            // Big burst at start
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors
            })
        }
    }, [isSuccess])

    // Redirect if no payment param
    useEffect(() => {
        if (!paymentStatus) {
            router.push("/studio")
        }
    }, [paymentStatus, router])

    if (!isSuccess) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60">Redirecting...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r ${plan.color} opacity-20 blur-[120px] rounded-full`} />
            </div>

            {/* Content */}
            <div className={`relative z-10 max-w-lg w-full transition-all duration-700 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {/* Success Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                    {/* Success Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center animate-pulse`}>
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isVietnamese ? "🎉 Chúc Mừng!" : "🎉 Congratulations!"}
                    </h1>

                    <p className="text-white/60 mb-6">
                        {isVietnamese
                            ? "Thanh toán thành công! Bạn đã nâng cấp lên gói"
                            : "Payment successful! You've upgraded to"
                        }
                    </p>

                    {/* Plan Badge */}
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${plan.color} mb-6`}>
                        <PlanIcon className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-lg">
                            {isVietnamese ? plan.nameVi : plan.name}
                        </span>
                    </div>

                    {/* Points Highlight */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                        <p className="text-white/60 text-sm mb-1">
                            {isVietnamese ? "Phở Points của bạn" : "Your Phở Points"}
                        </p>
                        <p className="text-2xl font-bold text-white">
                            {plan.points} <span className="text-[#F0421C]">🍜</span>
                        </p>
                        <p className="text-white/40 text-sm">
                            {isVietnamese ? "mỗi tháng" : "per month"}
                        </p>
                    </div>

                    {/* Features */}
                    <div className="text-left mb-6">
                        <p className="text-white/60 text-sm mb-3">
                            {isVietnamese ? "Bao gồm:" : "Includes:"}
                        </p>
                        <ul className="space-y-2">
                            {(isVietnamese ? plan.featuresVi : plan.features).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <Link href="/studio">
                        <Button
                            size="lg"
                            className="w-full bg-[#F0421C] hover:bg-[#D93A18] text-white font-semibold gap-2 group"
                        >
                            {isVietnamese ? "Bắt Đầu Sáng Tạo" : "Start Creating"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    {/* Support */}
                    <p className="text-white/40 text-xs mt-4">
                        {isVietnamese
                            ? "Cần hỗ trợ? Liên hệ support@pho.video"
                            : "Need help? Contact support@pho.video"
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
