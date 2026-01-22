"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Film, Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { cn } from "@/lib/utils"

export function Header() {
    const t = useTranslations("landing.nav")
    const th = useTranslations("landing.hero")
    const tc = useTranslations("common")
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { name: t("showcase"), href: "#showcase" },
        { name: t("gallery"), href: "/ideas" },
        { name: t("faq"), href: "#faq" },
    ]

    return (
        <motion.header
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl",
                "transition-all duration-300"
            )}
        >
            <nav className={cn(
                "relative w-full px-6 py-3 rounded-full border border-white/10 shadow-2xl transition-all duration-300",
                "bg-black/50 backdrop-blur-xl",
                isScrolled ? "py-2.5 scale-[0.98] border-white/20" : "py-4"
            )}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group relative">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-orange-500/10 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all duration-300">
                                <Film className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <span className="text-xl font-black font-heading tracking-tighter text-white group-hover:text-primary transition-colors duration-300">
                            {tc("app_name")}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 bg-black/40 rounded-full p-1 border border-white/5 backdrop-blur-md">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 text-sm font-semibold text-gray-400 hover:text-white rounded-full transition-all hover:bg-white/5 hover:scale-105 active:scale-95"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-4">
                            <LanguageSwitcher />
                        </div>

                        <div className="flex items-center gap-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="ghost" size="sm" className="hidden lg:flex text-gray-400 hover:text-white rounded-full px-4 text-xs font-bold uppercase tracking-widest">
                                        {tc("login")}
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button size="sm" className="btn-vermilion glow-vermilion-sm rounded-full px-6 h-10 text-xs font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95">
                                        {th("cta_primary")}
                                        <ArrowRight className="ml-2 w-3.5 h-3.5" />
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/studio">
                                    <Button size="sm" className="btn-vermilion glow-vermilion-sm rounded-full px-6 h-10 text-xs font-black uppercase tracking-tighter flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                                        {th("cta_studio")}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="flex flex-col gap-3 p-6 rounded-[2.5rem] bg-black/90 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                {navLinks.map((link, idx) => (
                                    <motion.a
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-6 py-4 text-lg font-bold text-gray-400 hover:text-primary hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group"
                                    >
                                        {link.name}
                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                    </motion.a>
                                ))}
                                <div className="h-px bg-white/5 my-2" />
                                <div className="flex justify-between items-center px-6 py-2">
                                    <span className="text-xs text-gray-500 uppercase font-black tracking-widest">Language</span>
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    )
}
