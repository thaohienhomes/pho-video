"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Lightbulb, Film, History, User, CreditCard, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { PhoPointsBalance } from "@/components/PhoPointsBalance"

interface NavItem {
    icon: React.ReactNode
    label: string
    href: string
}

export function LeftRail() {
    const pathname = usePathname()

    const navItems: NavItem[] = [
        { icon: <Home className="w-5 h-5" />, label: "Home", href: "/" },
        { icon: <Lightbulb className="w-5 h-5" />, label: "Ideas", href: "/ideas" },
        { icon: <Film className="w-5 h-5" />, label: "Studio", href: "/studio" },
        { icon: <History className="w-5 h-5" />, label: "History", href: "/studio?tab=history" },
        { icon: <CreditCard className="w-5 h-5" />, label: "Pricing", href: "/pricing" },
        { icon: <User className="w-5 h-5" />, label: "Account", href: "/account" },
        { icon: <HelpCircle className="w-5 h-5" />, label: "FAQ", href: "/faq" },
    ]

    const isActive = (href: string) => {
        if (href === "/studio") return pathname?.includes("/studio")
        if (href === "/ideas") return pathname?.includes("/ideas")
        if (href === "/pricing") return pathname?.includes("/pricing")
        if (href === "/account") return pathname?.includes("/account")
        if (href === "/faq") return pathname?.includes("/faq")
        if (href === "/") return pathname === "/" || pathname === "/en" || pathname === "/vi"
        return pathname === href
    }

    return (
        <div className="relative w-16 flex flex-col items-center py-4 gap-2 flex-shrink-0 border-r border-white/5">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#0A0A0A] to-[#080808] pointer-events-none" />

            {/* Subtle Ambient Glow at Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Navigation Items */}
            {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={cn(
                            "relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                            active
                                ? "text-primary bg-primary/15 shadow-[0_0_20px_rgba(240,66,28,0.25)]"
                                : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        )}
                    >
                        {/* Active Indicator Ring */}
                        {active && (
                            <div className="absolute inset-0 rounded-xl border border-primary/30 animate-pulse" />
                        )}
                        {item.icon}
                    </Link>
                )
            })}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Phở Points Balance - Bottom */}
            <div className="relative z-10 mb-2">
                <Link href="/pricing" title="Your Phở Points Balance">
                    <PhoPointsBalance
                        variant="compact"
                        showIcon={true}
                        className="hover:border-vermilion/30 cursor-pointer"
                    />
                </Link>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    )
}
