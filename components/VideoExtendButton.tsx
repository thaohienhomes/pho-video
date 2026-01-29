"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Loader2, Play, Coins } from "lucide-react"
import { toast } from "sonner"

interface VideoExtendButtonProps {
    videoUrl: string
    onExtend?: (extendedUrl: string) => void
    className?: string
    size?: "sm" | "default" | "lg"
}

export function VideoExtendButton({
    videoUrl,
    onExtend,
    className,
    size = "sm",
}: VideoExtendButtonProps) {
    const [open, setOpen] = useState(false)
    const [extensionSeconds, setExtensionSeconds] = useState(5)
    const [prompt, setPrompt] = useState("Continue this video seamlessly with natural motion")
    const [lastFrameUrl, setLastFrameUrl] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [isExtending, setIsExtending] = useState(false)

    const estimatedCost = Math.ceil(extensionSeconds / 5) * 40 // 40K per 5s

    // Extract last frame from video
    const extractLastFrame = useCallback(async () => {
        setIsExtracting(true)
        try {
            const video = document.createElement("video")
            video.crossOrigin = "anonymous"
            video.src = videoUrl

            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve
                video.onerror = reject
            })

            // Seek to last frame
            video.currentTime = video.duration - 0.1

            await new Promise((resolve) => {
                video.onseeked = resolve
            })

            // Draw to canvas
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")
            ctx?.drawImage(video, 0, 0)

            // Get data URL
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
            setLastFrameUrl(dataUrl)
            toast.success("Last frame extracted!")
        } catch (error) {
            toast.error("Failed to extract frame", {
                description: "Try a different video format",
            })
        } finally {
            setIsExtracting(false)
        }
    }, [videoUrl])

    // Extend video
    const handleExtend = async () => {
        if (!lastFrameUrl) {
            toast.error("Please extract last frame first")
            return
        }

        setIsExtending(true)
        try {
            const response = await fetch("/api/ai/extend-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl,
                    lastFrameUrl,
                    extensionSeconds,
                    prompt,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Extension failed")
            }

            toast.success(`Video extended by ${extensionSeconds}s!`, {
                description: `Cost: ${data.cost / 1000}K Phở Points`,
            })
            onExtend?.(data.extendedUrl)
            setOpen(false)
        } catch (error) {
            toast.error("Extension failed", {
                description: error instanceof Error ? error.message : "Unknown error",
            })
        } finally {
            setIsExtending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size={size} className={className}>
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Extend
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Extend Video</DialogTitle>
                    <DialogDescription>
                        Continue your video by adding more seconds using AI.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Preview */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
                        <video
                            src={videoUrl}
                            className="w-full h-full object-contain"
                            controls
                        />
                    </div>

                    {/* Extract Button */}
                    {!lastFrameUrl ? (
                        <Button
                            onClick={extractLastFrame}
                            disabled={isExtracting}
                            className="w-full"
                        >
                            {isExtracting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Extracting...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Extract Last Frame
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <img
                                src={lastFrameUrl}
                                alt="Last frame"
                                className="w-16 h-10 object-cover rounded"
                            />
                            <span className="text-sm text-emerald-400">✓ Frame ready</span>
                        </div>
                    )}

                    {/* Extension Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className="text-sm text-white/60">Extension Duration</Label>
                            <span className="text-sm text-primary">{extensionSeconds}s</span>
                        </div>
                        <Slider
                            value={[extensionSeconds]}
                            onValueChange={([val]) => setExtensionSeconds(val)}
                            min={5}
                            max={10}
                            step={5}
                            className="[&_[role=slider]]:bg-primary"
                        />
                    </div>

                    {/* Prompt */}
                    <div className="space-y-2">
                        <Label className="text-sm text-white/60">Continuation Prompt</Label>
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe how the video should continue..."
                            className="h-20 resize-none bg-black/30 border-white/10"
                        />
                    </div>

                    {/* Cost */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-primary" />
                            <span className="text-sm text-white/60">Estimated Cost</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{estimatedCost}K pts</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExtend}
                        disabled={!lastFrameUrl || isExtending}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isExtending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Extending...
                            </>
                        ) : (
                            <>
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Extend Video
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
