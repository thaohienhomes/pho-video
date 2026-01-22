"use client"


import Link from "next/link"
import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Play,
    Film,
    ArrowRight
} from "lucide-react"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// New Electric Cinematic Components
import { HeroSection } from "@/components/landing/HeroSection"
import { InfiniteMarquee } from "@/components/landing/InfiniteMarquee"
import { BeforeAfterSlider } from "@/components/landing/BeforeAfterSlider"
import { FAQ } from "@/components/landing/FAQ"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Header } from "@/components/landing/Header"

export default function LandingPage() {
    const t = useTranslations("landing")
    const tc = useTranslations("common")



    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden relative">
            {/* Retro Grid Background - Depth Effect */}
            <div className="retro-grid-horizon" />
            {/* Floating Navigation */}
            <Header />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION A: HERO - The Floating Portal */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <HeroSection />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION B: SHOWCASE - Infinite Video Marquee */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div id="showcase">
                <InfiniteMarquee />
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECTION D: DESIRE - Before/After Slider */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <BeforeAfterSlider />


            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* FAQ SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <FAQ />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* FINAL CTA SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <FinalCTA />

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <footer className="border-t border-white/10 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Film className="w-6 h-6 text-primary" />
                            <span className="font-bold">{tc("app_name")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 {tc("app_name")}. {t("footer.rights")}
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                {t("footer.terms")}
                            </a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                {t("footer.privacy")}
                            </a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                {t("footer.contact")}
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}
