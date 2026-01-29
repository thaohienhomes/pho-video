"use client"

import { memo, useState } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Loader2, Mic, Upload, ImageIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface LipSyncNodeData {
    label: string
    imageUrl?: string
    audioUrl?: string
    expressionScale?: number
    preprocess?: string
    isProcessing?: boolean
}

function LipSyncNodeComponent({ data, isConnectable }: NodeProps<LipSyncNodeData>) {
    const [expressionScale, setExpressionScale] = useState(data.expressionScale || 1.0)
    const [preprocess, setPreprocess] = useState(data.preprocess || "crop")
    const isProcessing = data.isProcessing || false

    return (
        <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/30 rounded-xl p-4 min-w-[280px] shadow-xl">
            {/* Input Handles */}
            <Handle
                type="target"
                position={Position.Left}
                id="image"
                style={{ top: "30%" }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="audio"
                style={{ top: "70%" }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-pink-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/30 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                    ) : (
                        <Mic className="w-4 h-4 text-pink-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Lip Sync</h3>
                    <p className="text-xs text-white/50">Talking Head Video</p>
                </div>
            </div>

            {/* Input Indicators */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-white/60">Portrait Image</span>
                    {data.imageUrl && <span className="text-xs text-emerald-400 ml-auto">✓</span>}
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                    <Mic className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-xs text-white/60">Audio Input</span>
                    {data.audioUrl && <span className="text-xs text-emerald-400 ml-auto">✓</span>}
                </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
                {/* Expression Scale */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/60">Expression</label>
                        <span className="text-xs text-pink-400">{expressionScale.toFixed(1)}</span>
                    </div>
                    <Slider
                        value={[expressionScale]}
                        onValueChange={([val]) => setExpressionScale(val)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-pink-500"
                    />
                </div>

                {/* Preprocess Mode */}
                <div>
                    <label className="text-xs text-white/60 mb-1 block">Preprocess</label>
                    <Select value={preprocess} onValueChange={setPreprocess}>
                        <SelectTrigger className="bg-black/30 border-white/10 text-white text-xs h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="crop">Crop</SelectItem>
                            <SelectItem value="extcrop">Extended Crop</SelectItem>
                            <SelectItem value="resize">Resize</SelectItem>
                            <SelectItem value="full">Full Frame</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Cost */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/50">Cost (per 10s)</span>
                    <span className="text-sm font-medium text-pink-400">50K pts</span>
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

export const LipSyncNode = memo(LipSyncNodeComponent)
