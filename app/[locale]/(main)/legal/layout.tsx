"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowLeft, Film } from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const tc = useTranslations("common")

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                        <Film className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">{tc("app_name")}</span>
                    </Link>

                    <LanguageSwitcher />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-4">
                        <Link href="/legal/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/legal/refund" className="hover:text-white transition-colors">
                            Refund Policy
                        </Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">
                            Pricing
                        </Link>
                    </div>
                    <p className="text-sm text-gray-600">
                        © 2026 {tc("app_name")}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
