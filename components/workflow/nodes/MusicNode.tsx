"use client"

import { memo, useState } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Loader2, Music } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

interface MusicNodeData {
    label: string
    prompt?: string
    duration?: number
    isProcessing?: boolean
}

function MusicNodeComponent({ data, isConnectable }: NodeProps<MusicNodeData>) {
    const [prompt, setPrompt] = useState(data.prompt || "")
    const [duration, setDuration] = useState(data.duration || 15)
    const isProcessing = data.isProcessing || false

    return (
        <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/30 rounded-xl p-4 min-w-[280px] shadow-xl">
            {/* Input Handle for Video (to sync duration) */}
            <Handle
                type="target"
                position={Position.Left}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-pink-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/30 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                    ) : (
                        <Music className="w-4 h-4 text-pink-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Music Generator</h3>
                    <p className="text-xs text-white/50">AI background music</p>
                </div>
            </div>

            {/* Music Prompt */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-white/60 mb-1 block">Music Style</label>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Epic orchestral, cinematic tension..."
                        className="min-h-[60px] bg-black/30 border-white/10 text-white text-sm resize-none focus:border-pink-500"
                    />
                </div>

                {/* Duration */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/60">Duration</label>
                        <span className="text-xs text-pink-400">{duration}s</span>
                    </div>
                    <Slider
                        value={[duration]}
                        onValueChange={([val]) => setDuration(val)}
                        min={5}
                        max={60}
                        step={5}
                        className="[&_[role=slider]]:bg-pink-500"
                    />
                </div>

                {/* Cost */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/50">Estimated Cost</span>
                    <span className="text-sm font-medium text-pink-400">30K pts</span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="audio"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-pink-300"
            />
        </div>
    )
}

export const MusicNode = memo(MusicNodeComponent)
