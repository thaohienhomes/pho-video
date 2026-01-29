"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Download, Play, Pause, Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface BatchResult {
    id: string
    videoUrl?: string
    imageUrl?: string
    status: "pending" | "generating" | "completed" | "failed"
    seed?: number
}

interface BatchResultsGridProps {
    results: BatchResult[]
    type: "video" | "image"
    onSelect?: (result: BatchResult) => void
    selectedId?: string
    className?: string
}

export function BatchResultsGrid({
    results,
    type,
    onSelect,
    selectedId,
    className,
}: BatchResultsGridProps) {
    const [playingId, setPlayingId] = useState<string | null>(null)

    const gridCols = results.length === 1 ? "grid-cols-1" :
        results.length === 2 ? "grid-cols-2" :
            "grid-cols-2"

    if (results.length === 0) return null

    return (
        <div className={cn("space-y-3", className)}>
            <h3 className="text-sm font-medium text-white/80">
                {results.length} {results.length === 1 ? "Result" : "Results"}
            </h3>

            <div className={cn("grid gap-3", gridCols)}>
                <AnimatePresence mode="popLayout">
                    {results.map((result, index) => (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelect?.(result)}
                            className={cn(
                                "relative aspect-video rounded-xl overflow-hidden cursor-pointer",
                                "border-2 transition-all",
                                selectedId === result.id
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-white/10 hover:border-white/20",
                                result.status === "failed" && "opacity-50"
                            )}
                        >
                            {/* Content */}
                            {result.status === "completed" && (
                                type === "video" && result.videoUrl ? (
                                    <video
                                        src={result.videoUrl}
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        autoPlay={playingId === result.id}
                                        onMouseEnter={() => setPlayingId(result.id)}
                                        onMouseLeave={() => setPlayingId(null)}
                                    />
                                ) : result.imageUrl ? (
                                    <img
                                        src={result.imageUrl}
                                        alt={`Result ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : null
                            )}

                            {/* Loading Overlay */}
                            {(result.status === "pending" || result.status === "generating") && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                    <span className="text-xs text-white/60">
                                        {result.status === "pending" ? "Queued..." : "Generating..."}
                                    </span>
                                </div>
                            )}

                            {/* Failed Overlay */}
                            {result.status === "failed" && (
                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                    <span className="text-xs text-red-400">Failed</span>
                                </div>
                            )}

                            {/* Selected Badge */}
                            {selectedId === result.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}

                            {/* Seed Badge */}
                            {result.seed && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white/60">
                                    #{result.seed}
                                </div>
                            )}

                            {/* Hover Actions */}
                            {result.status === "completed" && (
                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="w-7 h-7 bg-black/60"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(result.videoUrl || result.imageUrl, "_blank")
                                        }}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="w-7 h-7 bg-black/60"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigator.clipboard.writeText(result.videoUrl || result.imageUrl || "")
                                            toast.success("Link copied!")
                                        }}
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
