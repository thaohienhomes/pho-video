"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { FileText, Shield, RefreshCw, Cookie, ChevronRight } from "lucide-react"

const legalPages = [
    {
        href: "/legal/terms",
        icon: FileText,
        titleKey: "terms_title",
        descKey: "terms_desc",
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20"
    },
    {
        href: "/legal/privacy",
        icon: Shield,
        titleKey: "privacy_title",
        descKey: "privacy_desc",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20"
    },
    {
        href: "/legal/refund",
        icon: RefreshCw,
        titleKey: "refund_title",
        descKey: "refund_desc",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20"
    },
]

export default function LegalIndexPage() {
    const t = useTranslations("legal")

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{t("index_title")}</h1>
            <p className="text-gray-400 mb-10">{t("index_subtitle")}</p>

            <div className="space-y-4">
                {legalPages.map((page) => (
                    <Link
                        key={page.href}
                        href={page.href}
                        className={`group flex items-center gap-4 p-5 rounded-2xl ${page.bgColor} border ${page.borderColor} hover:scale-[1.02] transition-all duration-200`}
                    >
                        <div className={`p-3 rounded-xl bg-white/5`}>
                            <page.icon className={`w-6 h-6 ${page.color}`} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-white">{t(page.titleKey)}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{t(page.descKey)}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-gray-500">
                    {t("last_updated")}: February 2, 2026
                </p>
            </div>
        </div>
    )
}
