"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Play, Clock, CheckCircle, XCircle, Coins, ImageIcon, Type } from "lucide-react"

interface Generation {
    id: string
    prompt: string
    imageUrl: string | null
    videoUrl: string | null
    model: string
    status: string
    cost: number
    createdAt: string
}

interface HistoryListProps {
    onSelectVideo: (videoUrl: string, prompt: string) => void
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    "kling-2.6-pro": "Kling 2.6",
    "wan-2.6": "Wan 2.6",
    "ltx-video": "LTX",
}

export function HistoryList({ onSelectVideo }: HistoryListProps) {
    const t = useTranslations("studio.history")
    const [generations, setGenerations] = useState<Generation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/generations")
            if (!response.ok) {
                throw new Error("Failed to fetch history")
            }
            const data = await response.json()
            setGenerations(data.generations || [])
        } catch (err) {
            setError("Failed to load history")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-3 h-3 text-green-500" />
            case "failed":
                return <XCircle className="w-3 h-3 text-red-500" />
            default:
                return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70">{t("title")}</h3>
                <div className="grid gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-sm text-red-400 p-4 bg-red-500/10 rounded-lg">
                {error}
            </div>
        )
    }

    if (generations.length === 0) {
        return (
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70">{t("title")}</h3>
                <div className="text-center py-8 text-white/40 text-sm">
                    {t("empty")}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t("title")}
                <span className="text-xs text-white/40">({generations.length})</span>
            </h3>

            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
                {generations.map((gen) => (
                    <button
                        key={gen.id}
                        onClick={() => gen.videoUrl && onSelectVideo(gen.videoUrl, gen.prompt)}
                        disabled={!gen.videoUrl || gen.status !== "completed"}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-all",
                            "border border-white/5 bg-white/5",
                            gen.status === "completed" && gen.videoUrl
                                ? "hover:bg-white/10 hover:border-primary/30 cursor-pointer"
                                : "opacity-60 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {/* Thumbnail / Icon */}
                            <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                                {gen.status === "completed" ? (
                                    <Play className="w-5 h-5 text-primary" />
                                ) : (
                                    getStatusIcon(gen.status)
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Prompt (truncated) */}
                                <p className="text-sm text-white/80 truncate mb-1">
                                    {gen.prompt}
                                </p>

                                {/* Meta info */}
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    {/* Model */}
                                    <span className="flex items-center gap-1">
                                        {gen.imageUrl ? (
                                            <ImageIcon className="w-3 h-3" />
                                        ) : (
                                            <Type className="w-3 h-3" />
                                        )}
                                        {MODEL_DISPLAY_NAMES[gen.model] || gen.model}
                                    </span>

                                    {/* Cost */}
                                    <span className="flex items-center gap-1">
                                        <Coins className="w-3 h-3" />
                                        {gen.cost}
                                    </span>

                                    {/* Date */}
                                    <span>{formatDate(gen.createdAt)}</span>

                                    {/* Status */}
                                    {getStatusIcon(gen.status)}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
