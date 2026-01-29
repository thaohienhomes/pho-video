import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Node, Edge } from "reactflow"

export interface SavedWorkflow {
    id: string
    name: string
    description?: string
    nodes: Node[]
    edges: Edge[]
    createdAt: string
    updatedAt: string
}

interface WorkflowStore {
    // Saved workflows
    savedWorkflows: SavedWorkflow[]

    // Current workflow
    currentWorkflowId: string | null

    // Actions
    saveWorkflow: (name: string, nodes: Node[], edges: Edge[], description?: string) => string
    updateWorkflow: (id: string, nodes: Node[], edges: Edge[]) => void
    deleteWorkflow: (id: string) => void
    loadWorkflow: (id: string) => SavedWorkflow | undefined
    setCurrentWorkflowId: (id: string | null) => void
    renameWorkflow: (id: string, name: string) => void
}

export const useWorkflowStore = create<WorkflowStore>()(
    persist(
        (set, get) => ({
            savedWorkflows: [],
            currentWorkflowId: null,

            saveWorkflow: (name, nodes, edges, description) => {
                const id = `wf_${Date.now()}`
                const now = new Date().toISOString()

                const newWorkflow: SavedWorkflow = {
                    id,
                    name,
                    description,
                    nodes,
                    edges,
                    createdAt: now,
                    updatedAt: now,
                }

                set((state) => ({
                    savedWorkflows: [...state.savedWorkflows, newWorkflow],
                    currentWorkflowId: id,
                }))

                return id
            },

            updateWorkflow: (id, nodes, edges) => {
                set((state) => ({
                    savedWorkflows: state.savedWorkflows.map((wf) =>
                        wf.id === id
                            ? { ...wf, nodes, edges, updatedAt: new Date().toISOString() }
                            : wf
                    ),
                }))
            },

            deleteWorkflow: (id) => {
                set((state) => ({
                    savedWorkflows: state.savedWorkflows.filter((wf) => wf.id !== id),
                    currentWorkflowId: state.currentWorkflowId === id ? null : state.currentWorkflowId,
                }))
            },

            loadWorkflow: (id) => {
                return get().savedWorkflows.find((wf) => wf.id === id)
            },

            setCurrentWorkflowId: (id) => {
                set({ currentWorkflowId: id })
            },

            renameWorkflow: (id, name) => {
                set((state) => ({
                    savedWorkflows: state.savedWorkflows.map((wf) =>
                        wf.id === id ? { ...wf, name, updatedAt: new Date().toISOString() } : wf
                    ),
                }))
            },
        }),
        {
            name: "pho-workflow-storage",
        }
    )
)
