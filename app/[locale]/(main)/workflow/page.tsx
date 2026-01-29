"use client"

import { useCallback, useState, useMemo, useEffect } from "react"
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
import {
    Plus, Play, Save, Trash2, Sparkles, FolderOpen,
    Layout, ChevronDown, Check, Coins, AlertCircle, Loader2, Share2, Copy, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Import custom nodes
import { PromptNode } from "@/components/workflow/nodes/PromptNode"
import { TextToVideoNode } from "@/components/workflow/nodes/TextToVideoNode"
import { PreviewNode } from "@/components/workflow/nodes/PreviewNode"
import { ImageToVideoNode } from "@/components/workflow/nodes/ImageToVideoNode"
import { UpscaleNode } from "@/components/workflow/nodes/UpscaleNode"
import { MusicNode } from "@/components/workflow/nodes/MusicNode"
import { MergeNode } from "@/components/workflow/nodes/MergeNode"
import { LipSyncNode } from "@/components/workflow/nodes/LipSyncNode"

// Import templates and store
import { workflowTemplates, WorkflowTemplate } from "@/lib/workflow-templates"
import { useWorkflowStore } from "@/lib/workflow-store"
import {
    executeWorkflow as runWorkflow,
    calculateWorkflowCreditCost,
    validateWorkflow
} from "@/lib/workflow-engine"
import {
    encodeWorkflowToUrl,
    decodeWorkflowFromUrl,
    copyToClipboard
} from "@/lib/workflow-sharing"
import { useSearchParams } from "next/navigation"

// Register custom node types
const nodeTypes = {
    prompt: PromptNode,
    textToVideo: TextToVideoNode,
    preview: PreviewNode,
    imageToVideo: ImageToVideoNode,
    upscale: UpscaleNode,
    music: MusicNode,
    merge: MergeNode,
    lipsync: LipSyncNode,
}

// Node templates for sidebar - grouped by category
const nodeTemplates = [
    { type: "prompt", label: "Prompt Input", icon: "✏️", category: "Input" },
    { type: "textToVideo", label: "Text to Video", icon: "🎬", category: "Generate" },
    { type: "imageToVideo", label: "Image to Video", icon: "🎞️", category: "Generate" },
    { type: "upscale", label: "Upscale 4K", icon: "🔍", category: "Enhance" },
    { type: "music", label: "Music", icon: "🎵", category: "Audio" },
    { type: "lipsync", label: "Lip Sync", icon: "🗣️", category: "Audio" },
    { type: "merge", label: "Merge", icon: "🔗", category: "Combine" },
    { type: "preview", label: "Preview", icon: "👁️", category: "Output" },
]

// Get default template
const defaultTemplate = workflowTemplates[0]

export default function WorkflowPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultTemplate.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultTemplate.edges)
    const [isExecuting, setIsExecuting] = useState(false)
    const [executingNodeId, setExecutingNodeId] = useState<string | null>(null)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [shareUrl, setShareUrl] = useState("")
    const [paletteOpen, setPaletteOpen] = useState(true)
    const [workflowName, setWorkflowName] = useState("")
    const [totalCreditSpent, setTotalCreditSpent] = useState(0)

    const { savedWorkflows, saveWorkflow, currentWorkflowId, setCurrentWorkflowId } = useWorkflowStore()
    const searchParams = useSearchParams()

    // Load workflow from URL parameter
    useEffect(() => {
        const workflowParam = searchParams.get("w")
        if (workflowParam) {
            const decoded = decodeWorkflowFromUrl(workflowParam)
            if (decoded) {
                setNodes(decoded.nodes)
                setEdges(decoded.edges)
                toast.success("Workflow Loaded!", {
                    description: decoded.name || "Shared workflow loaded successfully",
                })
            }
        }
    }, [searchParams, setNodes, setEdges])

    // Calculate estimated credit cost
    const estimatedCost = useMemo(() => calculateWorkflowCreditCost(nodes), [nodes])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + S = Save
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault()
                setSaveDialogOpen(true)
            }
            // Cmd/Ctrl + Enter = Execute
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault()
                if (!isExecuting) {
                    handleExecuteWorkflow()
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isExecuting])

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
        setCurrentWorkflowId(null)
    }

    const loadTemplate = (template: WorkflowTemplate) => {
        setNodes(template.nodes)
        setEdges(template.edges)
        setCurrentWorkflowId(null)
    }

    const loadSavedWorkflow = (id: string) => {
        const workflow = savedWorkflows.find((wf) => wf.id === id)
        if (workflow) {
            setNodes(workflow.nodes)
            setEdges(workflow.edges)
            setCurrentWorkflowId(id)
        }
    }

    const handleSave = () => {
        if (workflowName.trim()) {
            saveWorkflow(workflowName, nodes, edges)
            setSaveDialogOpen(false)
            setWorkflowName("")
        }
    }

    const handleShare = async () => {
        const url = encodeWorkflowToUrl(nodes, edges, workflowName || "My Workflow")
        setShareUrl(url)
        setShareDialogOpen(true)
    }

    const handleCopyShareUrl = async () => {
        const success = await copyToClipboard(shareUrl)
        if (success) {
            toast.success("Link Copied!", {
                description: "Share this link with anyone",
            })
        }
    }

    const handleExecuteWorkflow = async () => {
        // Validate workflow first
        const validation = validateWorkflow(nodes, edges)
        if (!validation.valid) {
            toast.error("Workflow Validation Failed", {
                description: validation.errors.join(", "),
            })
            return
        }

        setIsExecuting(true)
        setTotalCreditSpent(0)

        try {
            const results = await runWorkflow({
                nodes,
                edges,
                results: new Map(),
                onNodeStart: (nodeId) => {
                    setExecutingNodeId(nodeId)
                    // Update node to show processing state
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === nodeId
                                ? { ...n, data: { ...n.data, isProcessing: true } }
                                : n
                        )
                    )
                },
                onNodeComplete: (nodeId, output, creditCost) => {
                    setTotalCreditSpent((prev) => prev + creditCost)
                    // Update node with output and clear processing state
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === nodeId
                                ? {
                                    ...n,
                                    data: {
                                        ...n.data,
                                        isProcessing: false,
                                        ...(output as Record<string, unknown>)
                                    }
                                }
                                : n
                        )
                    )
                    toast.success(`Node completed`, {
                        description: `Used ${creditCost}K credits`,
                    })
                },
                onNodeError: (nodeId, error) => {
                    // Clear processing state on error
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === nodeId
                                ? { ...n, data: { ...n.data, isProcessing: false } }
                                : n
                        )
                    )
                    toast.error(`Node failed`, {
                        description: error,
                    })
                },
            })

            // Count successful nodes
            const successful = Array.from(results.values()).filter(
                (r) => r.status === "completed"
            ).length

            toast.success("Workflow Complete!", {
                description: `${successful}/${nodes.length} nodes executed successfully`,
            })
        } catch (error) {
            toast.error("Workflow execution failed", {
                description: error instanceof Error ? error.message : "Unknown error",
            })
        } finally {
            setIsExecuting(false)
            setExecutingNodeId(null)
        }
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

                        {/* Credit Cost Display */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">
                                {estimatedCost}K pts
                            </span>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Templates Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                                    <Layout className="w-4 h-4 mr-1" />
                                    Templates
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Workflow Templates</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {workflowTemplates.map((template) => (
                                    <DropdownMenuItem
                                        key={template.id}
                                        onClick={() => loadTemplate(template)}
                                        className="flex items-center gap-2"
                                    >
                                        <span>{template.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{template.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {template.description}
                                            </span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Saved Workflows Dropdown */}
                        {savedWorkflows.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                                        <FolderOpen className="w-4 h-4 mr-1" />
                                        My Workflows
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Saved Workflows</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {savedWorkflows.map((wf) => (
                                        <DropdownMenuItem
                                            key={wf.id}
                                            onClick={() => loadSavedWorkflow(wf.id)}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="truncate">{wf.name}</span>
                                            {currentWorkflowId === wf.id && (
                                                <Check className="w-4 h-4 text-primary" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

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

                        {/* Save Dialog */}
                        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Save Workflow</DialogTitle>
                                    <DialogDescription>
                                        Give your workflow a name to save it for later use.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Workflow Name</Label>
                                        <Input
                                            id="name"
                                            value={workflowName}
                                            onChange={(e) => setWorkflowName(e.target.value)}
                                            placeholder="My Awesome Workflow"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSave} className="bg-primary">
                                        Save Workflow
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Share Dialog */}
                        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleShare}
                                    className="text-white/60 hover:text-white"
                                >
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Share Workflow</DialogTitle>
                                    <DialogDescription>
                                        Share this workflow with others using the link below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={shareUrl}
                                            readOnly
                                            className="font-mono text-xs"
                                        />
                                        <Button
                                            onClick={handleCopyShareUrl}
                                            variant="outline"
                                            size="icon"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <a
                                        href={shareUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open in new tab
                                    </a>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            size="sm"
                            onClick={handleExecuteWorkflow}
                            disabled={isExecuting}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Play className="w-4 h-4 mr-1" />
                            {isExecuting ? "Running..." : "Execute"}
                        </Button>
                    </div>
                </Panel>

                {/* Node Palette - Collapsible on mobile */}
                <Panel position="top-right" className="w-56 md:w-64">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setPaletteOpen(!paletteOpen)}
                            className="w-full p-3 md:p-4 flex items-center justify-between md:cursor-default"
                        >
                            <h3 className="text-sm font-medium text-white">Add Nodes</h3>
                            <ChevronDown className={cn(
                                "w-4 h-4 text-white/60 transition-transform md:hidden",
                                paletteOpen && "rotate-180"
                            )} />
                        </button>
                        <div className={cn(
                            "space-y-2 px-3 md:px-4 pb-3 md:pb-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto transition-all",
                            !paletteOpen && "hidden md:block"
                        )}>
                            {nodeTemplates.map((template) => (
                                <button
                                    key={template.type}
                                    onClick={() => addNode(template.type)}
                                    className={cn(
                                        "w-full p-2.5 md:p-3 rounded-lg border border-white/10 bg-white/5",
                                        "hover:bg-white/10 hover:border-white/20 transition-all",
                                        "flex items-center gap-2 md:gap-3 text-left"
                                    )}
                                >
                                    <span className="text-lg md:text-xl">{template.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs md:text-sm text-white block truncate">{template.label}</span>
                                        <span className="text-xs text-white/40 hidden md:block">{template.category}</span>
                                    </div>
                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
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

                {/* Status Bar */}
                <Panel position="bottom-center" className="w-full max-w-2xl">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isExecuting ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                                )} />
                                <span className="text-xs text-white/60">
                                    {isExecuting ? `Running...` : "Ready"}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <span className="text-xs text-white/40">
                                {nodes.length} nodes • {edges.length} connections
                            </span>
                        </div>

                        {isExecuting && executingNodeId && (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                                <span className="text-xs text-primary">
                                    Processing node...
                                </span>
                            </div>
                        )}

                        {!isExecuting && totalCreditSpent > 0 && (
                            <div className="flex items-center gap-2">
                                <Coins className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">
                                    Used {totalCreditSpent}K pts
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-white/30">
                            <span className="hidden md:inline">⌘S Save</span>
                            <span className="hidden md:inline">⌘Enter Run</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

