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
import { Loader2, ImageIcon, Upload } from "lucide-react"

interface ImageToVideoNodeData {
    label: string
    model?: string
    motionStrength?: number
    imageUrl?: string
    isProcessing?: boolean
}

const I2V_MODELS = [
    { id: "wan-i2v", name: "Wan I2V", cost: 60 },
    { id: "kling-i2v", name: "Kling I2V", cost: 80 },
    { id: "runway-gen3", name: "Runway Gen-3", cost: 100 },
]

function ImageToVideoNodeComponent({ data, isConnectable }: NodeProps<ImageToVideoNodeData>) {
    const [model, setModel] = useState(data.model || "wan-i2v")
    const [motionStrength, setMotionStrength] = useState(data.motionStrength || 50)
    const [imageUrl, setImageUrl] = useState(data.imageUrl || "")
    const isProcessing = data.isProcessing || false

    const selectedModel = I2V_MODELS.find((m) => m.id === model)

    return (
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 min-w-[280px] shadow-xl">
            {/* Input Handle for Image */}
            <Handle
                type="target"
                position={Position.Left}
                id="image"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300 !top-[30%]"
            />

            {/* Input Handle for Prompt */}
            <Handle
                type="target"
                position={Position.Left}
                id="prompt"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-violet-500 !border-2 !border-violet-300 !top-[70%]"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                        <span className="text-lg">🎞️</span>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Image to Video</h3>
                    <p className="text-xs text-white/50">Animate your image</p>
                </div>
            </div>

            {/* Image Preview/Upload */}
            <div className="mb-3">
                <label className="text-xs text-white/60 mb-1 block">Source Image</label>
                {imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                        <img src={imageUrl} alt="Source" className="w-full h-full object-cover" />
                        <button
                            onClick={() => setImageUrl("")}
                            className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white/70 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs">Drop image or connect</span>
                    </div>
                )}
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
                            {I2V_MODELS.map((m) => (
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

                {/* Motion Strength */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/60">Motion Strength</label>
                        <span className="text-xs text-cyan-400">{motionStrength}%</span>
                    </div>
                    <Slider
                        value={[motionStrength]}
                        onValueChange={([val]) => setMotionStrength(val)}
                        min={10}
                        max={100}
                        step={5}
                        className="[&_[role=slider]]:bg-cyan-500"
                    />
                </div>

                {/* Cost Estimate */}
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/50">Estimated Cost</span>
                    <span className="text-sm font-medium text-cyan-400">
                        {selectedModel?.cost || 60}K pts
                    </span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
            />
        </div>
    )
}

export const ImageToVideoNode = memo(ImageToVideoNodeComponent)
