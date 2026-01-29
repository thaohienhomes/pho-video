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
import { Loader2, Maximize2 } from "lucide-react"

interface UpscaleNodeData {
    label: string
    scale?: string
    isProcessing?: boolean
}

const UPSCALE_OPTIONS = [
    { id: "2x", name: "2x Upscale", resolution: "1080p → 2K", cost: 20 },
    { id: "4x", name: "4x Upscale", resolution: "1080p → 4K", cost: 40 },
    { id: "creative", name: "Creative Enhance", resolution: "AI Enhanced", cost: 50 },
]

function UpscaleNodeComponent({ data, isConnectable }: NodeProps<UpscaleNodeData>) {
    const [scale, setScale] = useState(data.scale || "2x")
    const isProcessing = data.isProcessing || false

    const selectedOption = UPSCALE_OPTIONS.find((o) => o.id === scale)

    return (
        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4 min-w-[260px] shadow-xl">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                        <Maximize2 className="w-4 h-4 text-amber-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Upscale</h3>
                    <p className="text-xs text-white/50">Enhance resolution</p>
                </div>
            </div>

            {/* Scale Selector */}
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-white/60 mb-1 block">Enhancement</label>
                    <Select value={scale} onValueChange={setScale}>
                        <SelectTrigger className="bg-black/30 border-white/10 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {UPSCALE_OPTIONS.map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                    <div className="flex flex-col">
                                        <span>{o.name}</span>
                                        <span className="text-xs text-white/40">{o.resolution}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Resolution Preview */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                        {scale === "4x" ? "4K" : scale === "2x" ? "2K" : "HD+"}
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                        {selectedOption?.resolution}
                    </div>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Cost</span>
                    <span className="text-amber-400 font-medium">
                        {selectedOption?.cost}K pts
                    </span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-amber-500 !border-2 !border-amber-300"
            />
        </div>
    )
}

export const UpscaleNode = memo(UpscaleNodeComponent)
