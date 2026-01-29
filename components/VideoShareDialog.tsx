"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    Globe,
    Lock,
    Link2,
    Copy,
    Check,
    Share2,
    Twitter,
    Facebook,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface VideoShareDialogProps {
    videoId: string
    videoTitle: string
    thumbnailUrl: string
    isPublic: boolean
    onVisibilityChange?: (isPublic: boolean) => void
    onClose: () => void
}

export function VideoShareDialog({
    videoId,
    videoTitle,
    thumbnailUrl,
    isPublic,
    onVisibilityChange,
    onClose,
}: VideoShareDialogProps) {
    const [visibility, setVisibility] = useState(isPublic)
    const [copied, setCopied] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/video/${videoId}`
        : ""

    const handleVisibilityChange = async (newVisibility: boolean) => {
        setIsSaving(true)
        setVisibility(newVisibility)

        try {
            await fetch("/api/community/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, isPublic: newVisibility }),
            })
            onVisibilityChange?.(newVisibility)
        } catch (error) {
            console.error("Failed to update visibility:", error)
            setVisibility(!newVisibility) // Revert
        } finally {
            setIsSaving(false)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSocialShare = (platform: "twitter" | "facebook") => {
        const text = encodeURIComponent(`Check out this AI video I created: ${videoTitle}`)
        const url = encodeURIComponent(shareUrl)

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        }

        window.open(urls[platform], "_blank", "width=600,height=400")
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <Share2 className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-white">Share Video</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-5">
                        {/* Video Preview */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <img
                                src={thumbnailUrl}
                                alt={videoTitle}
                                className="w-20 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {videoTitle || "Untitled Video"}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {visibility ? (
                                        <Globe className="w-3 h-3 text-green-400" />
                                    ) : (
                                        <Lock className="w-3 h-3 text-white/50" />
                                    )}
                                    <span className={cn(
                                        "text-xs",
                                        visibility ? "text-green-400" : "text-white/50"
                                    )}>
                                        {visibility ? "Public" : "Private"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                {visibility ? (
                                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-green-400" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-white/50" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {visibility ? "Public" : "Private"}
                                    </p>
                                    <p className="text-xs text-white/50">
                                        {visibility
                                            ? "Anyone can view and remix"
                                            : "Only you can see this"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={visibility}
                                onCheckedChange={handleVisibilityChange}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Share Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/50">Share Link</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                                    <Link2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 bg-transparent text-sm text-white/70 outline-none truncate"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className={cn(
                                        "border-white/20",
                                        copied ? "text-green-400 border-green-400/50" : "text-white/70"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Social Share */}
                        {visibility && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50">Share on Social</label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSocialShare("twitter")}
                                        className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
                                    >
                                        <Twitter className="w-4 h-4 mr-2" />
                                        Twitter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSocialShare("facebook")}
                                        className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
                                    >
                                        <Facebook className="w-4 h-4 mr-2" />
                                        Facebook
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
