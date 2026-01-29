"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, Users, TrendingUp, ArrowLeft } from "lucide-react"
import { CommunityGallery } from "@/components/CommunityGallery"
import { Button } from "@/components/ui/button"

export default function CommunityPage() {
    const t = useTranslations("Community")
    const router = useRouter()

    const handleRemix = (video: { prompt: string; authorId: string }) => {
        const encodedPrompt = encodeURIComponent(video.prompt)
        router.push(`/studio2?prompt=${encodedPrompt}&remixFrom=${video.authorId}`)
    }

    const handleVideoClick = (video: { id: string }) => {
        // Could open detail modal or navigate to video page
        console.log("Video clicked:", video.id)
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users className="w-6 h-6 text-primary" />
                                    Community
                                </h1>
                                <p className="text-sm text-white/50">
                                    Discover and remix amazing AI videos
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push("/studio2")}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Your Own
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-orange-500/5 to-primary/10 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">12.5K</p>
                            <p className="text-xs text-white/50">Videos Shared</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">8.2K</p>
                            <p className="text-xs text-white/50">Active Creators</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">95K</p>
                            <p className="text-xs text-white/50">Remixes Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <CommunityGallery
                    onRemix={handleRemix}
                    onVideoClick={handleVideoClick}
                />
            </div>

            {/* Footer CTA */}
            <div className="bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent py-16">
                <div className="max-w-xl mx-auto text-center px-4">
                    <TrendingUp className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Want to be featured?
                    </h2>
                    <p className="text-white/50 mb-6">
                        Create amazing videos and share them with the community.
                        The best ones get featured here!
                    </p>
                    <Button
                        onClick={() => router.push("/studio2")}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Creating
                    </Button>
                </div>
            </div>
        </div>
    )
}
