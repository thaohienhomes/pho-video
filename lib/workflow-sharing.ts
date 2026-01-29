"use client"

import { Node, Edge } from "reactflow"
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string"

export interface ShareableWorkflow {
    v: number // version
    n: Node[] // nodes
    e: Edge[] // edges
    name?: string
}

/**
 * Encode a workflow into a shareable URL
 */
export function encodeWorkflowToUrl(
    nodes: Node[],
    edges: Edge[],
    name?: string,
    baseUrl?: string
): string {
    // Minimize node data for URL
    const minNodes = nodes.map((node) => ({
        id: node.id,
        t: node.type, // type shortened
        p: { x: Math.round(node.position.x), y: Math.round(node.position.y) }, // position
        d: node.data, // data
    }))

    const minEdges = edges.map((edge) => ({
        id: edge.id,
        s: edge.source, // source
        t: edge.target, // target
        sh: edge.sourceHandle, // sourceHandle
        th: edge.targetHandle, // targetHandle
    }))

    const workflow: ShareableWorkflow = {
        v: 1,
        n: minNodes as unknown as Node[],
        e: minEdges as unknown as Edge[],
        name,
    }

    const compressed = compressToEncodedURIComponent(JSON.stringify(workflow))
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")

    return `${base}/workflow?w=${compressed}`
}

/**
 * Decode a workflow from URL parameters
 */
export function decodeWorkflowFromUrl(encoded: string): { nodes: Node[]; edges: Edge[]; name?: string } | null {
    try {
        const decompressed = decompressFromEncodedURIComponent(encoded)
        if (!decompressed) return null

        const data = JSON.parse(decompressed) as ShareableWorkflow

        // Expand minimized data back to full nodes
        const nodes: Node[] = (data.n as unknown as { id: string; t: string; p: { x: number; y: number }; d: Record<string, unknown> }[]).map((n) => ({
            id: n.id,
            type: n.t,
            position: { x: n.p.x, y: n.p.y },
            data: n.d || {},
        }))

        const edges: Edge[] = (data.e as unknown as { id: string; s: string; t: string; sh?: string; th?: string }[]).map((e) => ({
            id: e.id,
            source: e.s,
            target: e.t,
            sourceHandle: e.sh,
            targetHandle: e.th,
            animated: true,
        }))

        return { nodes, edges, name: data.name }
    } catch (error) {
        console.error("Failed to decode workflow:", error)
        return null
    }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea")
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        return true
    }
}
