"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { SignedIn, SignedOut, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Maximize2, ArrowLeft, Upload, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { PhoPointsBalance } from "@/components/PhoPointsBalance"
import { VideoUpscaler } from "@/components/VideoUpscaler"
import Link from "next/link"

export default function UpscalerPage() {
    const tc = useTranslations("common")
    const { user } = useUser()

    const [videoUrl, setVideoUrl] = useState("")
    const [isUrlMode, setIsUrlMode] = useState(true)
    const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null)

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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-sm">Phở Video Upscaler</span>
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
                        📈 Premium Video Upscaler
                    </h1>
                    <p className="text-white/60">
                        Enhance your videos to 4K with Hollywood-grade AI upscaling
                    </p>
                </div>

                {/* Video Input Section */}
                <div className="mb-6 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Enter Video URL
                    </h3>
                    <div className="flex gap-3">
                        <Input
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                        <Button
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() => setVideoUrl("")}
                        >
                            Clear
                        </Button>
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                        Paste a direct video URL (MP4, WebM) or use a video from your gallery
                    </p>
                </div>

                {/* Video Preview */}
                {videoUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full aspect-video object-contain"
                        />
                    </div>
                )}

                {/* Upscaler Component */}
                {videoUrl ? (
                    <VideoUpscaler
                        videoUrl={videoUrl}
                        onUpscaleComplete={(url) => setUpscaledUrl(url)}
                    />
                ) : (
                    <div className="p-12 rounded-xl bg-white/5 border border-dashed border-white/20 text-center">
                        <Maximize2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/50 mb-2">No video selected</p>
                        <p className="text-sm text-white/30">
                            Enter a video URL above to start upscaling
                        </p>
                    </div>
                )}

                {/* Upscaled Result */}
                {upscaledUrl && (
                    <div className="mt-6 p-6 rounded-xl bg-green-500/10 border border-green-500/30">
                        <h3 className="font-semibold text-white mb-4">✅ Upscaled Video</h3>
                        <video
                            src={upscaledUrl}
                            controls
                            className="w-full rounded-lg aspect-video object-contain"
                        />
                        <div className="mt-4 flex gap-3">
                            <a
                                href={upscaledUrl}
                                download
                                className="flex-1 py-2 px-4 rounded-lg bg-green-500 text-white text-center font-medium hover:bg-green-600 transition-colors"
                            >
                                Download 4K Video
                            </a>
                            <Button
                                variant="outline"
                                onClick={() => setUpscaledUrl(null)}
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Quality Tiers Info */}
                <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-white mb-4">🎬 Quality Tiers Explained</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="w-20 shrink-0 text-amber-500 font-medium">Topaz</span>
                            <span className="text-white/70">Hollywood-grade quality. Best for films, commercials, and professional work. Uses advanced AI trained on professional footage.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-20 shrink-0 text-purple-500 font-medium">SeedVR</span>
                            <span className="text-white/70">ByteDance technology. Great balance of quality and speed. Excellent for social media and YouTube.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-20 shrink-0 text-green-500 font-medium">FlashVSR</span>
                            <span className="text-white/70">Real-time fast processing. Best when you need quick results without sacrificing too much quality.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-20 shrink-0 text-gray-400 font-medium">Standard</span>
                            <span className="text-white/70">Basic upscaling. Most affordable option for general use cases.</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
