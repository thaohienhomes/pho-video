import { Node, Edge } from "reactflow"

export interface WorkflowTemplate {
    id: string
    name: string
    description: string
    icon: string
    category: "basic" | "advanced" | "production"
    nodes: Node[]
    edges: Edge[]
}

export const workflowTemplates: WorkflowTemplate[] = [
    {
        id: "simple-t2v",
        name: "Simple Text to Video",
        description: "Basic prompt to video generation",
        icon: "🎬",
        category: "basic",
        nodes: [
            {
                id: "1",
                type: "prompt",
                position: { x: 100, y: 200 },
                data: { label: "Prompt", value: "" },
            },
            {
                id: "2",
                type: "textToVideo",
                position: { x: 420, y: 200 },
                data: { label: "Text to Video", model: "wan-2.1" },
            },
            {
                id: "3",
                type: "preview",
                position: { x: 740, y: 200 },
                data: { label: "Preview", videoUrl: null },
            },
        ],
        edges: [
            { id: "e1-2", source: "1", target: "2", animated: true },
            { id: "e2-3", source: "2", target: "3", animated: true },
        ],
    },
    {
        id: "t2v-upscale",
        name: "T2V + 4K Upscale",
        description: "Generate video then upscale to 4K",
        icon: "🔍",
        category: "basic",
        nodes: [
            {
                id: "1",
                type: "prompt",
                position: { x: 100, y: 200 },
                data: { label: "Prompt", value: "" },
            },
            {
                id: "2",
                type: "textToVideo",
                position: { x: 420, y: 200 },
                data: { label: "Text to Video", model: "wan-2.1" },
            },
            {
                id: "3",
                type: "upscale",
                position: { x: 740, y: 200 },
                data: { label: "Upscale", scale: "4x" },
            },
            {
                id: "4",
                type: "preview",
                position: { x: 1020, y: 200 },
                data: { label: "Preview", videoUrl: null },
            },
        ],
        edges: [
            { id: "e1-2", source: "1", target: "2", animated: true },
            { id: "e2-3", source: "2", target: "3", animated: true },
            { id: "e3-4", source: "3", target: "4", animated: true },
        ],
    },
    {
        id: "i2v-basic",
        name: "Image Animation",
        description: "Animate a still image to video",
        icon: "🎞️",
        category: "basic",
        nodes: [
            {
                id: "1",
                type: "prompt",
                position: { x: 100, y: 280 },
                data: { label: "Motion Prompt", value: "" },
            },
            {
                id: "2",
                type: "imageToVideo",
                position: { x: 420, y: 200 },
                data: { label: "Image to Video", model: "wan-i2v" },
            },
            {
                id: "3",
                type: "preview",
                position: { x: 740, y: 200 },
                data: { label: "Preview", videoUrl: null },
            },
        ],
        edges: [
            { id: "e1-2", source: "1", target: "2", sourceHandle: "prompt", targetHandle: "prompt", animated: true },
            { id: "e2-3", source: "2", target: "3", animated: true },
        ],
    },
    {
        id: "video-music",
        name: "Video with Music",
        description: "Generate video and add AI background music",
        icon: "🎵",
        category: "advanced",
        nodes: [
            {
                id: "1",
                type: "prompt",
                position: { x: 100, y: 150 },
                data: { label: "Video Prompt", value: "" },
            },
            {
                id: "2",
                type: "textToVideo",
                position: { x: 420, y: 100 },
                data: { label: "Text to Video", model: "wan-2.1", duration: 5 },
            },
            {
                id: "3",
                type: "music",
                position: { x: 420, y: 320 },
                data: { label: "Music", prompt: "", duration: 5 },
            },
            {
                id: "4",
                type: "merge",
                position: { x: 740, y: 200 },
                data: { label: "Merge" },
            },
            {
                id: "5",
                type: "preview",
                position: { x: 1000, y: 200 },
                data: { label: "Preview", videoUrl: null },
            },
        ],
        edges: [
            { id: "e1-2", source: "1", target: "2", animated: true },
            { id: "e2-4", source: "2", target: "4", sourceHandle: "video", targetHandle: "video1", animated: true },
            { id: "e3-4", source: "3", target: "4", sourceHandle: "audio", targetHandle: "audio", animated: true },
            { id: "e4-5", source: "4", target: "5", animated: true },
        ],
    },
    {
        id: "production-pipeline",
        name: "Production Pipeline",
        description: "Full production: T2V → Upscale → Music → Merge",
        icon: "🎥",
        category: "production",
        nodes: [
            {
                id: "1",
                type: "prompt",
                position: { x: 100, y: 150 },
                data: { label: "Scene Prompt", value: "" },
            },
            {
                id: "2",
                type: "textToVideo",
                position: { x: 420, y: 100 },
                data: { label: "Text to Video", model: "kling-1.6", duration: 5 },
            },
            {
                id: "3",
                type: "upscale",
                position: { x: 740, y: 100 },
                data: { label: "Upscale", scale: "4x" },
            },
            {
                id: "4",
                type: "music",
                position: { x: 420, y: 350 },
                data: { label: "Music", prompt: "Epic cinematic orchestral", duration: 5 },
            },
            {
                id: "5",
                type: "merge",
                position: { x: 1020, y: 200 },
                data: { label: "Merge" },
            },
            {
                id: "6",
                type: "preview",
                position: { x: 1280, y: 200 },
                data: { label: "Final Preview", videoUrl: null },
            },
        ],
        edges: [
            { id: "e1-2", source: "1", target: "2", animated: true },
            { id: "e2-3", source: "2", target: "3", animated: true },
            { id: "e3-5", source: "3", target: "5", sourceHandle: "video", targetHandle: "video1", animated: true },
            { id: "e4-5", source: "4", target: "5", sourceHandle: "audio", targetHandle: "audio", animated: true },
            { id: "e5-6", source: "5", target: "6", animated: true },
        ],
    },
]

export function getTemplateById(id: string): WorkflowTemplate | undefined {
    return workflowTemplates.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: WorkflowTemplate["category"]): WorkflowTemplate[] {
    return workflowTemplates.filter((t) => t.category === category)
}
