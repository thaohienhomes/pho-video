"use client"

import { memo, useState } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

interface PromptNodeData {
    label: string
    value?: string
    onChange?: (value: string) => void
}

function PromptNodeComponent({ data, isConnectable }: NodeProps<PromptNodeData>) {
    const [prompt, setPrompt] = useState(data.value || "")

    return (
        <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 rounded-xl p-4 min-w-[280px] shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <span className="text-lg">✏️</span>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Prompt Input</h3>
                    <p className="text-xs text-white/50">Enter your creative prompt</p>
                </div>
            </div>

            {/* Content */}
            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a futuristic city at sunset..."
                className="min-h-[100px] bg-black/30 border-white/10 text-white text-sm resize-none focus:border-violet-500"
            />

            {/* Magic Enhance Button */}
            <button className="mt-2 w-full p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 text-xs flex items-center justify-center gap-2 transition-all">
                <Sparkles className="w-3 h-3" />
                Enhance with AI
            </button>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="prompt"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-violet-500 !border-2 !border-violet-300"
            />
        </div>
    )
}

export const PromptNode = memo(PromptNodeComponent)
