"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Combine } from "lucide-react"

interface MergeNodeData {
    label: string
}

function MergeNodeComponent({ data, isConnectable }: NodeProps<MergeNodeData>) {
    return (
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4 min-w-[200px] shadow-xl">
            {/* Multiple Input Handles */}
            <Handle
                type="target"
                position={Position.Left}
                id="video1"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-300 !top-[30%]"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="video2"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-300 !top-[50%]"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="audio"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-pink-500 !border-2 !border-pink-300 !top-[70%]"
            />

            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center">
                    <Combine className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Merge</h3>
                    <p className="text-xs text-white/50">Combine videos + audio</p>
                </div>
            </div>

            {/* Input Labels */}
            <div className="mt-3 space-y-1 text-xs text-white/40 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Video 1</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Video 2</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Audio (optional)</span>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-300"
            />
        </div>
    )
}

export const MergeNode = memo(MergeNodeComponent)
