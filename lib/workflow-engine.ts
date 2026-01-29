import { Node, Edge } from "reactflow"

export interface WorkflowExecutionResult {
    nodeId: string
    status: "pending" | "running" | "completed" | "failed"
    output?: unknown
    error?: string
    creditCost?: number
}

export interface ExecutionContext {
    nodes: Node[]
    edges: Edge[]
    results: Map<string, WorkflowExecutionResult>
    onNodeStart: (nodeId: string) => void
    onNodeComplete: (nodeId: string, output: unknown, creditCost: number) => void
    onNodeError: (nodeId: string, error: string) => void
    onProgress?: (nodeId: string, progress: number) => void
}

// Credit costs per node type (in thousands, e.g. 50 = 50K points)
export const NODE_CREDIT_COSTS: Record<string, number | ((data: Record<string, unknown>) => number)> = {
    prompt: 0,
    preview: 0,
    textToVideo: (data) => {
        const baseCosts: Record<string, number> = {
            "wan-2.1": 50,
            "kling-1.6": 75,
            "ltx-video": 40,
            "hunyuan": 60,
        }
        const duration = (data.duration as number) || 5
        const model = (data.model as string) || "wan-2.1"
        return Math.round((baseCosts[model] || 50) * (duration / 5))
    },
    imageToVideo: (data) => {
        const baseCosts: Record<string, number> = {
            "wan-i2v": 60,
            "kling-i2v": 80,
            "runway-gen3": 100,
        }
        const model = (data.model as string) || "wan-i2v"
        return baseCosts[model] || 60
    },
    upscale: (data) => {
        const costs: Record<string, number> = {
            "2x": 20,
            "4x": 40,
            "creative": 50,
        }
        const scale = (data.scale as string) || "2x"
        return costs[scale] || 20
    },
    music: 30,
    merge: 5,
}

/**
 * Calculate credit cost for a node
 */
export function calculateNodeCreditCost(node: Node): number {
    const costDef = NODE_CREDIT_COSTS[node.type || ""]
    if (typeof costDef === "function") {
        return costDef(node.data || {})
    }
    return costDef || 0
}

/**
 * Calculate total credit cost for a workflow
 */
export function calculateWorkflowCreditCost(nodes: Node[]): number {
    return nodes.reduce((total, node) => total + calculateNodeCreditCost(node), 0)
}

/**
 * Topologically sort nodes based on edges to determine execution order
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
    const graph = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    // Initialize
    nodes.forEach((node) => {
        graph.set(node.id, [])
        inDegree.set(node.id, 0)
    })

    // Build adjacency list
    edges.forEach((edge) => {
        graph.get(edge.source)?.push(edge.target)
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    // Find all nodes with no incoming edges
    const queue: string[] = []
    inDegree.forEach((degree, nodeId) => {
        if (degree === 0) queue.push(nodeId)
    })

    const result: string[] = []
    while (queue.length > 0) {
        const nodeId = queue.shift()!
        result.push(nodeId)

        graph.get(nodeId)?.forEach((neighbor) => {
            const newDegree = (inDegree.get(neighbor) || 1) - 1
            inDegree.set(neighbor, newDegree)
            if (newDegree === 0) queue.push(neighbor)
        })
    }

    return result
}

/**
 * Get input data for a node from its connected source nodes
 */
export function getNodeInputs(
    nodeId: string,
    edges: Edge[],
    results: Map<string, WorkflowExecutionResult>
): Record<string, unknown> {
    const inputs: Record<string, unknown> = {}

    edges
        .filter((edge) => edge.target === nodeId)
        .forEach((edge) => {
            const sourceResult = results.get(edge.source)
            if (sourceResult?.status === "completed" && sourceResult.output) {
                // Map output to input based on handle names
                const handleKey = edge.targetHandle || edge.sourceHandle || "default"
                inputs[handleKey] = sourceResult.output
            }
        })

    return inputs
}

/**
 * Execute a single node based on its type
 */
export async function executeNode(
    node: Node,
    inputs: Record<string, unknown>
): Promise<unknown> {
    switch (node.type) {
        case "prompt":
            // Prompt nodes output their text value
            return { prompt: node.data.value || "" }

        case "textToVideo": {
            // Get prompt from inputs
            const promptInput = inputs.prompt as { prompt?: string } | undefined
            const prompt = promptInput?.prompt || node.data.value || ""
            const model = node.data.model || "wan-2.1"
            const duration = node.data.duration || 5

            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    modelId: model,
                    duration,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to generate video")
            }

            const data = await response.json()
            return {
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl,
                prompt
            }
        }

        case "imageToVideo": {
            const promptInput = inputs.prompt as { prompt?: string } | undefined
            const imageInput = inputs.image as { imageUrl?: string } | undefined

            const prompt = promptInput?.prompt || ""
            const imageUrl = imageInput?.imageUrl || node.data.imageUrl || ""
            const model = node.data.model || "wan-i2v"
            const motionStrength = node.data.motionStrength || 50

            const response = await fetch("/api/ai/image-to-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    imageUrl,
                    modelId: model,
                    motionStrength,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to animate image")
            }

            const data = await response.json()
            return {
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl
            }
        }

        case "upscale": {
            const videoInput = inputs.video as { videoUrl?: string } | undefined
            const videoUrl = videoInput?.videoUrl || ""
            const scale = node.data.scale || "2x"

            const response = await fetch("/api/ai/upscale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl,
                    scale,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to upscale video")
            }

            const data = await response.json()
            return {
                videoUrl: data.videoUrl,
                resolution: scale === "4x" ? "4K" : "2K"
            }
        }

        case "music": {
            const videoInput = inputs.video as { videoUrl?: string } | undefined
            const prompt = node.data.prompt || "cinematic orchestral"
            const duration = node.data.duration || 15

            const response = await fetch("/api/ai/music", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    duration,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to generate music")
            }

            const data = await response.json()
            return {
                audioUrl: data.audioUrl,
                // Pass through video if connected
                videoUrl: videoInput?.videoUrl
            }
        }

        case "merge": {
            const video1Input = inputs.video1 as { videoUrl?: string } | undefined
            const video2Input = inputs.video2 as { videoUrl?: string } | undefined
            const audioInput = inputs.audio as { audioUrl?: string } | undefined

            // For now, just pass through - actual merge would need FFmpeg API
            const videoUrl = video1Input?.videoUrl || video2Input?.videoUrl || ""
            const audioUrl = audioInput?.audioUrl

            return {
                videoUrl,
                audioUrl,
                merged: true
            }
        }

        case "preview":
            // Preview nodes aggregate all inputs
            const video = inputs.video as { videoUrl?: string } | undefined
            const audio = inputs.audio as { audioUrl?: string } | undefined

            return {
                videoUrl: video?.videoUrl,
                audioUrl: audio?.audioUrl,
                thumbnailUrl: (video as { thumbnailUrl?: string })?.thumbnailUrl
            }

        default:
            return inputs
    }
}

/**
 * Execute the entire workflow
 */
export async function executeWorkflow(
    context: ExecutionContext
): Promise<Map<string, WorkflowExecutionResult>> {
    const { nodes, edges, onNodeStart, onNodeComplete, onNodeError } = context
    const results = new Map<string, WorkflowExecutionResult>()

    // Get execution order
    const executionOrder = topologicalSort(nodes, edges)

    // Execute nodes in order
    for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) continue

        // Calculate credit cost for this node
        const creditCost = calculateNodeCreditCost(node)

        // Mark as running
        results.set(nodeId, { nodeId, status: "running", creditCost })
        onNodeStart(nodeId)

        try {
            // Get inputs from connected nodes
            const inputs = getNodeInputs(nodeId, edges, results)

            // Execute the node
            const output = await executeNode(node, inputs)

            // Mark as completed
            results.set(nodeId, { nodeId, status: "completed", output, creditCost })
            onNodeComplete(nodeId, output, creditCost)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            results.set(nodeId, { nodeId, status: "failed", error: errorMessage, creditCost: 0 })
            onNodeError(nodeId, errorMessage)
            // Continue with other nodes that don't depend on this one
        }
    }

    return results
}

/**
 * Validate workflow before execution
 */
export function validateWorkflow(nodes: Node[], edges: Edge[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for empty workflow
    if (nodes.length === 0) {
        errors.push("Workflow is empty")
        return { valid: false, errors }
    }

    // Check for disconnected nodes
    const connectedNodes = new Set<string>()
    edges.forEach((edge) => {
        connectedNodes.add(edge.source)
        connectedNodes.add(edge.target)
    })

    nodes.forEach((node) => {
        // Input nodes (prompt) don't need incoming connections
        if (node.type !== "prompt" && !connectedNodes.has(node.id)) {
            errors.push(`Node "${node.data.label || node.type}" is not connected`)
        }
    })

    // Check for required inputs
    nodes.forEach((node) => {
        if (node.type === "textToVideo") {
            // T2V needs a prompt input or value
            const hasPromptEdge = edges.some((e) => e.target === node.id)
            if (!hasPromptEdge && !node.data.value) {
                errors.push("Text to Video node needs a prompt input")
            }
        }
    })

    return { valid: errors.length === 0, errors }
}

