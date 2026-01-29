"use client"

import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Music, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { PhoPointsBalance } from "@/components/PhoPointsBalance"
import { SoundStudio } from "@/components/SoundStudio"
import Link from "next/link"

export default function SoundStudioPage() {
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-sm">Phở Sound Studio</span>
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
                        🎵 Phở Sound Studio
                    </h1>
                    <p className="text-white/60">
                        Generate AI music, voiceovers, and sound effects for your videos
                    </p>
                </div>

                {/* Sound Studio Component */}
                <SoundStudio
                    onMusicGenerated={(url) => console.log("Music generated:", url)}
                    onTTSGenerated={(url) => console.log("TTS generated:", url)}
                />

                {/* Tips Section */}
                <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-white mb-4">💡 Pro Tips</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>• <strong>Music:</strong> Describe mood, genre, and instruments for best results</li>
                        <li>• <strong>TTS:</strong> Use punctuation for natural pauses and emphasis</li>
                        <li>• <strong>Cost:</strong> Music costs ~30K Phở per 30 seconds of audio</li>
                        <li>• <strong>Tip:</strong> Generate shorter clips first to test styles</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}
