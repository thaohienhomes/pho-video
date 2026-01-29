"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"
import { Download, Play, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewNodeData {
    label: string
    videoUrl?: string | null
    thumbnailUrl?: string | null
}

function PreviewNodeComponent({ data, isConnectable }: NodeProps<PreviewNodeData>) {
    const hasVideo = !!data.videoUrl

    return (
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4 min-w-[320px] shadow-xl">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="video"
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-emerald-300"
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <span className="text-lg">👁️</span>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Preview</h3>
                    <p className="text-xs text-white/50">View generated output</p>
                </div>
            </div>

            {/* Preview Area */}
            <div className="aspect-video bg-black/50 rounded-lg border border-white/10 overflow-hidden relative">
                {hasVideo ? (
                    <video
                        src={data.videoUrl!}
                        controls
                        className="w-full h-full object-cover"
                        poster={data.thumbnailUrl || undefined}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                        <Play className="w-10 h-10 mb-2" />
                        <span className="text-xs">Waiting for input...</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {hasVideo && (
                <div className="flex gap-2 mt-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs text-white/60 hover:text-white"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs text-white/60 hover:text-white"
                    >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                    </Button>
                </div>
            )}
        </div>
    )
}

export const PreviewNode = memo(PreviewNodeComponent)
