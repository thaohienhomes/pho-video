import { create } from 'zustand'

export interface Generation {
    id: string
    prompt: string
    imageUrl: string | null
    imageUrls?: string[] | null // Support for batch T2I
    videoUrl: string | null
    audioUrl?: string | null
    upscaledUrl: string | null
    model: string
    status: 'generating' | 'completed' | 'failed'
    cost: number
    createdAt: string
    type?: 'image' | 'video'  // Type of generation
    seed?: number | null
}

interface StudioState {
    // State
    generations: Generation[]
    activeItem: Generation | null
    isLoading: boolean
    credits: number

    // Actions
    setGenerations: (items: Generation[]) => void
    addGeneration: (item: Generation) => void
    updateGeneration: (id: string, data: Partial<Generation>) => void
    removeGeneration: (id: string) => void
    setActiveItem: (item: Generation | null) => void
    setIsLoading: (loading: boolean) => void
    setCredits: (credits: number) => void

    // Utility Actions
    addGhostGeneration: (id: string, prompt: string, model: string, type?: 'image' | 'video', thumbnailUrl?: string | null) => void
    completeGeneration: (id: string, urlOrUrls: string | string[], cost: number, type?: 'image' | 'video') => void
    failGeneration: (id: string) => void

    // API Actions
    fetchGenerations: () => Promise<void>
}

export const useStudioStore = create<StudioState>((set, get) => ({
    // Initial State
    generations: [],
    activeItem: null,
    isLoading: false,
    credits: 0,

    // Basic Setters
    setGenerations: (items) => set({ generations: items }),

    addGeneration: (item) => set((state) => ({
        generations: [item, ...state.generations]
    })),

    updateGeneration: (id, data) => set((state) => ({
        generations: state.generations.map((g) =>
            g.id === id ? { ...g, ...data } : g
        ),
        // Also update activeItem if it's the same
        activeItem: state.activeItem?.id === id
            ? { ...state.activeItem, ...data }
            : state.activeItem
    })),

    removeGeneration: (id) => set((state) => ({
        generations: state.generations.filter((g) => g.id !== id),
        activeItem: state.activeItem?.id === id ? null : state.activeItem
    })),

    setActiveItem: (item) => set({ activeItem: item }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setCredits: (credits) => set({ credits }),

    // Utility: Add a ghost (loading) generation
    addGhostGeneration: (id, prompt, model, type = 'video', thumbnailUrl = null) => {
        const ghost: Generation = {
            id,
            prompt,
            imageUrl: thumbnailUrl, // Use thumb if provided
            imageUrls: null,
            videoUrl: null,
            upscaledUrl: null,
            model,
            status: 'generating',
            cost: 0,
            createdAt: new Date().toISOString(),
            type
        }
        set((state) => ({
            generations: [ghost, ...state.generations],
            activeItem: ghost // Auto-select the generating item
        }))
    },

    // Utility: Complete a ghost generation
    completeGeneration: (id, urlOrUrls, cost, type) => {
        set((state) => {
            const updated = state.generations.map((g) => {
                if (g.id === id) {
                    const resolvedType = type || g.type || (g.model.includes('flux') || g.model.includes('recraft') ? 'image' : 'video')

                    const isBatch = Array.isArray(urlOrUrls)
                    const videoUrl = resolvedType === 'video' && !isBatch ? urlOrUrls : null
                    const imageUrl = resolvedType === 'image' && !isBatch ? urlOrUrls : (isBatch ? urlOrUrls[0] : null)
                    const imageUrls = resolvedType === 'image' && isBatch ? urlOrUrls : null

                    return {
                        ...g,
                        videoUrl,
                        imageUrl,
                        imageUrls,
                        cost,
                        status: 'completed' as const,
                        type: resolvedType
                    }
                }
                return g
            })
            const completedItem = updated.find((g) => g.id === id)
            return {
                generations: updated,
                activeItem: completedItem || state.activeItem // Auto-select completed
            }
        })
    },

    // Utility: Fail a generation
    failGeneration: (id) => {
        set((state) => ({
            generations: state.generations.map((g) =>
                g.id === id ? { ...g, status: 'failed' as const } : g
            )
        }))
    },

    // API: Fetch user's generations
    fetchGenerations: async () => {
        set({ isLoading: true })
        try {
            const response = await fetch('/api/generations')
            if (!response.ok) throw new Error('Failed to fetch generations')

            const data = await response.json()

            // Map API response to Generation format
            const generations: Generation[] = (data.generations || []).map((g: any) => {
                const type = (g.videoUrl || g.type === 'video') ? 'video' : 'image'
                // Map 'pending' from DB to 'generating' for UI
                const status = g.status === 'pending' || g.status === 'generating' ? 'generating' : (g.status === 'failed' ? 'failed' : 'completed')

                return {
                    id: g.id,
                    prompt: g.prompt || '',
                    imageUrl: g.imageUrl || null,
                    imageUrls: g.imageUrls || null,
                    videoUrl: g.videoUrl || null,
                    audioUrl: g.audioUrl || null,
                    upscaledUrl: g.upscaledUrl || null,
                    model: g.model || 'unknown',
                    status,
                    cost: g.cost || 0,
                    createdAt: g.createdAt || new Date().toISOString(),
                    type,
                    seed: g.seed
                }
            })

            set({
                generations,
                credits: data.credits || 0,
                isLoading: false,
                // Auto-select first item if none selected
                activeItem: get().activeItem || generations[0] || null
            })
        } catch (error) {
            console.error('[StudioStore] Failed to fetch generations:', error)
            set({ isLoading: false })
        }
    }
}))
