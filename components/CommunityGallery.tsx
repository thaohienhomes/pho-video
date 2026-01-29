"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    Play,
    Sparkles,
    TrendingUp,
    Clock,
    Star,
    Search,
    Filter,
    Grid3X3,
    LayoutGrid,
    User,
    Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CommunityVideo {
    id: string
    title: string
    prompt: string
    videoUrl: string
    thumbnailUrl: string
    authorId: string
    authorName: string
    authorAvatar?: string
    likes: number
    views: number
    createdAt: string
    isLiked?: boolean
    isSaved?: boolean
}

interface CommunityGalleryProps {
    initialVideos?: CommunityVideo[]
    onRemix?: (video: CommunityVideo) => void
    onVideoClick?: (video: CommunityVideo) => void
    className?: string
}

const TABS = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "new", label: "New", icon: Clock },
    { id: "picks", label: "Staff Picks", icon: Star },
]

export function CommunityGallery({
    initialVideos = [],
    onRemix,
    onVideoClick,
    className,
}: CommunityGalleryProps) {
    const [videos, setVideos] = useState<CommunityVideo[]>(initialVideos)
    const [activeTab, setActiveTab] = useState("trending")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [layout, setLayout] = useState<"masonry" | "grid">("masonry")
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Fetch videos
    const fetchVideos = useCallback(async (tab: string, append = false) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/community/featured?tab=${tab}&q=${searchQuery}`)
            const data = await res.json()

            if (append) {
                setVideos(prev => [...prev, ...(data.videos || [])])
            } else {
                setVideos(data.videos || [])
            }
            setHasMore(data.hasMore || false)
        } catch (error) {
            console.error("Failed to fetch community videos:", error)
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery])

    // Initial load
    useEffect(() => {
        fetchVideos(activeTab)
    }, [activeTab, fetchVideos])

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchVideos(activeTab, true)
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => observerRef.current?.disconnect()
    }, [hasMore, isLoading, activeTab, fetchVideos])

    // Like handler
    const handleLike = async (videoId: string) => {
        setVideos(prev =>
            prev.map(v =>
                v.id === videoId
                    ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
                    : v
            )
        )

        try {
            await fetch("/api/community/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId }),
            })
        } catch (error) {
            console.error("Failed to like video:", error)
        }
    }

    // Save handler
    const handleSave = (videoId: string) => {
        setVideos(prev =>
            prev.map(v =>
                v.id === videoId ? { ...v, isSaved: !v.isSaved } : v
            )
        )
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Layout */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setLayout("masonry")}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                layout === "masonry" ? "bg-white/10 text-white" : "text-white/40"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setLayout("grid")}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                layout === "grid" ? "bg-white/10 text-white" : "text-white/40"
                            )}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            {videos.length === 0 && !isLoading ? (
                <div className="py-20 text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <h3 className="text-lg font-medium text-white">No videos yet</h3>
                    <p className="text-white/50 mt-1">Be the first to share your creation!</p>
                </div>
            ) : (
                <div
                    className={cn(
                        "gap-4",
                        layout === "masonry"
                            ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
                            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    )}
                >
                    <AnimatePresence>
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={layout === "masonry" ? "mb-4 break-inside-avoid" : ""}
                            >
                                <VideoCard
                                    video={video}
                                    onLike={() => handleLike(video.id)}
                                    onSave={() => handleSave(video.id)}
                                    onRemix={() => onRemix?.(video)}
                                    onClick={() => onVideoClick?.(video)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Loading / Load More */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {hasMore && !isLoading && (
                <div ref={loadMoreRef} className="h-20" />
            )}
        </div>
    )
}

// Video Card Component
function VideoCard({
    video,
    onLike,
    onSave,
    onRemix,
    onClick,
}: {
    video: CommunityVideo
    onLike: () => void
    onSave: () => void
    onRemix: () => void
    onClick: () => void
}) {
    const [isHovered, setIsHovered] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Play on hover
    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.play().catch(() => { })
        } else if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [isHovered])

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(1) + "K"
        return num.toString()
    }

    return (
        <div
            className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Thumbnail / Video */}
            <div className="relative aspect-video">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className={cn(
                        "w-full h-full object-cover transition-opacity",
                        isHovered ? "opacity-0" : "opacity-100"
                    )}
                />
                <video
                    ref={videoRef}
                    src={video.videoUrl}
                    muted
                    loop
                    playsInline
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Play Icon */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
                    isHovered ? "opacity-0" : "opacity-100"
                )}>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                </div>

                {/* Views */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-xs text-white">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.views)}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Title & Prompt */}
                <h4 className="text-sm font-medium text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {video.title || "Untitled"}
                </h4>
                <p className="text-xs text-white/50 line-clamp-2">
                    {video.prompt}
                </p>

                {/* Author */}
                <div className="flex items-center gap-2">
                    {video.authorAvatar ? (
                        <img
                            src={video.authorAvatar}
                            alt={video.authorName}
                            className="w-5 h-5 rounded-full"
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-white/50" />
                        </div>
                    )}
                    <span className="text-xs text-white/50">{video.authorName}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(); }}
                            className={cn(
                                "flex items-center gap-1 text-xs transition-colors",
                                video.isLiked ? "text-red-500" : "text-white/50 hover:text-red-400"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", video.isLiked && "fill-current")} />
                            {formatNumber(video.likes)}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onSave(); }}
                            className={cn(
                                "transition-colors",
                                video.isSaved ? "text-yellow-500" : "text-white/50 hover:text-yellow-400"
                            )}
                        >
                            <Bookmark className={cn("w-4 h-4", video.isSaved && "fill-current")} />
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onRemix(); }}
                        className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Remix
                    </Button>
                </div>
            </div>
        </div>
    )
}
