"use client"

import { memo, useState } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Video } from "lucide-react"

interface TextToVideoNodeData {
    label: string
    model?: string
    duration?: number
    isProcessing?: boolean
}

const VIDEO_MODELS = [
    { id: "wan-2.1", name: "Wan 2.1", cost: 50 },
    { id: "kling-1.6", name: "Kling 1.6", cost: 75 },
    { id: "ltx-video", name: "LTX Video", cost: 40 },
    { id: "hunyuan", name: "HunyuanVideo", cost: 60 },
]

function TextToVideoNodeComponent({ data, isConnectable }: NodeProps<TextToVideoNodeData>) {
    const [model, setModel] = useState(data.model || "wan-2.1")
    const [duration, setDuration] = useState(data.duration || 5)
    const isProcessing = data.isProcessing || false

    const selectedModel = VIDEO_MODELS.find((m) => m.id === model)

    return (
        <div className="bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/30 rounded-xl p-4 min-w-[280px] shadow-xl">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="prompt"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-primary !border-2 !border-orange-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                        <span className="text-lg">🎬</span>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Text to Video</h3>
                    <p className="text-xs text-white/50">Generate video from prompt</p>
                </div>
            </div>

            {/* Model Selector */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-white/60 mb-1 block">Model</label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="bg-black/30 border-white/10 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_MODELS.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{m.name}</span>
                                        <span className="text-xs text-white/40 ml-2">
                                            {m.cost}K pts
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Duration */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/60">Duration</label>
                        <span className="text-xs text-primary">{duration}s</span>
                    </div>
                    <Slider
                        value={[duration]}
                        onValueChange={([val]) => setDuration(val)}
                        min={3}
                        max={10}
                        step={1}
                        className="[&_[role=slider]]:bg-primary"
                    />
                </div>

                {/* Cost Estimate */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/50">Estimated Cost</span>
                    <span className="text-sm font-medium text-primary">
                        {((selectedModel?.cost || 50) * (duration / 5)).toFixed(0)}K pts
                    </span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-primary !border-2 !border-orange-300"
            />
        </div>
    )
}

export const TextToVideoNode = memo(TextToVideoNodeComponent)
