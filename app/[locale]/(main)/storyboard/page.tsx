"use client"

import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { BookOpen, ArrowLeft, Film, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { PhoPointsBalance } from "@/components/PhoPointsBalance"
import { StoryboardWizard } from "@/components/StoryboardWizard"
import Link from "next/link"

export default function StoryboardPage() {
    const tc = useTranslations("common")
    const { user } = useUser()

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <header className="h-14 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/studio"
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-sm">Phở Storyboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    <div className="h-5 w-px bg-white/10" />
                    <PhoPointsBalance variant="compact" showIcon={true} />

                    <SignedIn>
                        <div className="flex items-center gap-2">
                            {user?.firstName && (
                                <span className="text-xs text-muted-foreground hidden md:inline">
                                    {user.firstName}
                                </span>
                            )}
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                            />
                        </div>
                    </SignedIn>

                    <SignedOut>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="btn-vermilion text-xs h-8">
                                {tc("signup")}
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-2xl mx-auto py-8 px-4">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        📖 Phở Storyboard
                    </h1>
                    <p className="text-white/60">
                        Transform your story into a cinematic multi-scene video
                    </p>
                </div>

                {/* Storyboard Wizard */}
                <StoryboardWizard
                    onComplete={(url) => console.log("Storyboard complete:", url)}
                />

                {/* How It Works */}
                <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-white mb-4">🎬 How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                                <span className="text-violet-400 font-bold">1</span>
                            </div>
                            <p className="text-sm text-white/70">Write your story</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                                <span className="text-violet-400 font-bold">2</span>
                            </div>
                            <p className="text-sm text-white/70">AI breaks into scenes</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                                <span className="text-violet-400 font-bold">3</span>
                            </div>
                            <p className="text-sm text-white/70">Generate videos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                                <span className="text-violet-400 font-bold">4</span>
                            </div>
                            <p className="text-sm text-white/70">Add music & merge</p>
                        </div>
                    </div>
                </div>

                {/* Examples */}
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        Story Ideas
                    </h3>
                    <div className="space-y-2 text-sm text-white/70">
                        <p>• <strong>Sci-Fi:</strong> &ldquo;In 2150, a lone astronaut discovers an ancient alien signal...&rdquo;</p>
                        <p>• <strong>Fantasy:</strong> &ldquo;A young wizard apprentice accidentally opens a portal to a dragon realm...&rdquo;</p>
                        <p>• <strong>Product:</strong> &ldquo;Introducing our new AI camera that captures perfect moments automatically...&rdquo;</p>
                        <p>• <strong>Tutorial:</strong> &ldquo;Step one: Open the app. Step two: Select your style...&rdquo;</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
