import { Node, Edge } from "reactflow"

export interface WorkflowExecutionResult {
    nodeId: string
    status: "pending" | "running" | "completed" | "failed"
    output?: unknown
    error?: string
}

export interface ExecutionContext {
    nodes: Node[]
    edges: Edge[]
    results: Map<string, WorkflowExecutionResult>
    onNodeStart: (nodeId: string) => void
    onNodeComplete: (nodeId: string, output: unknown) => void
    onNodeError: (nodeId: string, error: string) => void
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
            if (sourceResult?.status === "completed") {
                inputs[edge.sourceHandle || "default"] = sourceResult.output
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

        case "textToVideo":
            // Call the T2V API
            const prompt = (inputs.prompt as { prompt?: string })?.prompt || ""
            const model = node.data.model || "wan-2.1"
            const duration = node.data.duration || 5

            // TODO: Replace with actual API call
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
                throw new Error("Failed to generate video")
            }

            const data = await response.json()
            return { videoUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl }

        case "preview":
            // Preview nodes just pass through their input
            return inputs.video || inputs

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

        // Mark as running
        results.set(nodeId, { nodeId, status: "running" })
        onNodeStart(nodeId)

        try {
            // Get inputs from connected nodes
            const inputs = getNodeInputs(nodeId, edges, results)

            // Execute the node
            const output = await executeNode(node, inputs)

            // Mark as completed
            results.set(nodeId, { nodeId, status: "completed", output })
            onNodeComplete(nodeId, output)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            results.set(nodeId, { nodeId, status: "failed", error: errorMessage })
            onNodeError(nodeId, errorMessage)
            // Continue with other nodes that don't depend on this one
        }
    }

    return results
}
