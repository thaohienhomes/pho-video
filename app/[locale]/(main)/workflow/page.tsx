"use client"

import { useCallback, useState } from "react"
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Plus, Play, Save, Trash2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// Import custom nodes
import { PromptNode } from "@/components/workflow/nodes/PromptNode"
import { TextToVideoNode } from "@/components/workflow/nodes/TextToVideoNode"
import { PreviewNode } from "@/components/workflow/nodes/PreviewNode"

// Register custom node types
const nodeTypes = {
    prompt: PromptNode,
    textToVideo: TextToVideoNode,
    preview: PreviewNode,
}

// Node templates for sidebar
const nodeTemplates = [
    { type: "prompt", label: "Prompt Input", icon: "✏️", color: "violet" },
    { type: "textToVideo", label: "Text to Video", icon: "🎬", color: "primary" },
    { type: "preview", label: "Preview", icon: "👁️", color: "emerald" },
]

// Initial nodes for demo
const initialNodes: Node[] = [
    {
        id: "1",
        type: "prompt",
        position: { x: 100, y: 200 },
        data: { label: "Prompt", value: "" },
    },
    {
        id: "2",
        type: "textToVideo",
        position: { x: 400, y: 200 },
        data: { label: "Text to Video", model: "wan-2.1" },
    },
    {
        id: "3",
        type: "preview",
        position: { x: 700, y: 200 },
        data: { label: "Preview", videoUrl: null },
    },
]

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
]

export default function WorkflowPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [isExecuting, setIsExecuting] = useState(false)

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: true }, eds)
            ),
        [setEdges]
    )

    const addNode = (type: string) => {
        const newNode: Node = {
            id: `${Date.now()}`,
            type,
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: { label: type },
        }
        setNodes((nds) => [...nds, newNode])
    }

    const clearWorkflow = () => {
        setNodes([])
        setEdges([])
    }

    const executeWorkflow = async () => {
        setIsExecuting(true)
        // TODO: Implement workflow execution engine
        setTimeout(() => setIsExecuting(false), 2000)
    }

    return (
        <div className="h-screen w-full bg-[#0A0A0A]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0A0A0A]"
                proOptions={{ hideAttribution: true }}
            >
                {/* Control Panel */}
                <Panel position="top-left" className="flex gap-2">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="font-bold text-white">Workflow Editor</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={clearWorkflow}
                            className="text-white/60 hover:text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                        >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            onClick={executeWorkflow}
                            disabled={isExecuting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Play className="w-4 h-4 mr-1" />
                            {isExecuting ? "Running..." : "Execute"}
                        </Button>
                    </div>
                </Panel>

                {/* Node Palette */}
                <Panel position="top-right" className="w-64">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-white mb-3">Add Nodes</h3>
                        <div className="space-y-2">
                            {nodeTemplates.map((template) => (
                                <button
                                    key={template.type}
                                    onClick={() => addNode(template.type)}
                                    className={cn(
                                        "w-full p-3 rounded-lg border border-white/10 bg-white/5",
                                        "hover:bg-white/10 hover:border-white/20 transition-all",
                                        "flex items-center gap-3 text-left"
                                    )}
                                >
                                    <span className="text-xl">{template.icon}</span>
                                    <span className="text-sm text-white">{template.label}</span>
                                    <Plus className="w-4 h-4 text-white/40 ml-auto" />
                                </button>
                            ))}
                        </div>
                    </div>
                </Panel>

                <Controls className="bg-black/60 border border-white/10 rounded-xl" />
                <MiniMap
                    className="bg-black/60 border border-white/10 rounded-xl"
                    nodeColor="#F0421C"
                    maskColor="rgba(0, 0, 0, 0.8)"
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="rgba(255,255,255,0.05)"
                />
            </ReactFlow>
        </div>
    )
}
