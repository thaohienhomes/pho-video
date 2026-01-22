"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
    User,
    CreditCard,
    Settings,
    BarChart3,
    HelpCircle,
    ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"


export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isVietnamese = pathname.includes("/vi/")
    const t = useTranslations("account.usage")

    // Extract locale from pathname
    const locale = pathname.split("/")[1] || "en"

    const accountNavItems = [
        {
            href: "/account",
            label: isVietnamese ? "Tổng Quan" : "Overview",
            icon: User,
            exact: true
        },
        {
            href: "/account/subscription",
            label: isVietnamese ? "Gói Đăng Ký" : "Subscription",
            icon: CreditCard
        },
        {
            href: "/account/usage",
            label: t("title"),
            icon: BarChart3
        },
        {
            href: "/account/settings",
            label: isVietnamese ? "Cài Đặt" : "Settings",
            icon: Settings
        }
    ]

    return (
        <div className="flex-1 flex min-h-0">
            {/* Account Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
                {/* Back to Studio */}
                <Link
                    href={`/${locale}/studio`}
                    className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/10"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm">
                        {isVietnamese ? "Quay lại Studio" : "Back to Studio"}
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-3 py-2">
                        {isVietnamese ? "Tài Khoản" : "Account"}
                    </p>

                    {accountNavItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === `/${locale}${item.href}`
                            : pathname.startsWith(`/${locale}${item.href}`)

                        return (
                            <Link
                                key={item.href}
                                href={`/${locale}${item.href}`}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-[#F0421C]/10 text-[#F0421C] border border-[#F0421C]/20 shadow-[0_0_15px_rgba(240,66,28,0.2)]"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-4 h-4",
                                    isActive && "text-[#F0421C]"
                                )} />
                                <span className="text-sm font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Help Link */}
                <div className="p-3 border-t border-white/10">
                    <Link
                        href={`/${locale}/faq`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {isVietnamese ? "Trợ Giúp & FAQ" : "Help & FAQ"}
                        </span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {children}
            </main>
        </div>
    )
}
