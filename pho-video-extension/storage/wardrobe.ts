/**
 * Wardrobe Storage Module
 * Manages user's collected fashion items across multiple pages
 */

export type WardrobeCategory = 'tops' | 'bottoms' | 'accessories' | 'footwear'

export interface WardrobeItem {
    id: string
    imageUrl: string
    thumbnailUrl: string
    name: string
    brand: string
    category: WardrobeCategory
    sourceUrl: string
    sourcePage: string
    addedAt: number
}

export interface Wardrobe {
    items: WardrobeItem[]
    modelImageUrl: string | null
    qualityMode: 'standard' | 'hd' | 'ultra'
}

const STORAGE_KEY = 'phoVideoWardrobe'

/**
 * Get the entire wardrobe from storage
 */
export async function getWardrobe(): Promise<Wardrobe> {
    return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY, 'modelImageUrl', 'qualityMode'], (result) => {
            const wardrobe: Wardrobe = {
                items: result[STORAGE_KEY]?.items || [],
                modelImageUrl: result.modelImageUrl || null,
                qualityMode: result.qualityMode || 'hd'
            }
            resolve(wardrobe)
        })
    })
}

/**
 * Get items by category
 */
export async function getItemsByCategory(category: WardrobeCategory): Promise<WardrobeItem[]> {
    const wardrobe = await getWardrobe()
    return wardrobe.items.filter(item => item.category === category)
}

/**
 * Get count per category
 */
export async function getCategoryCounts(): Promise<Record<WardrobeCategory, number>> {
    const wardrobe = await getWardrobe()
    return {
        tops: wardrobe.items.filter(i => i.category === 'tops').length,
        bottoms: wardrobe.items.filter(i => i.category === 'bottoms').length,
        accessories: wardrobe.items.filter(i => i.category === 'accessories').length,
        footwear: wardrobe.items.filter(i => i.category === 'footwear').length
    }
}

/**
 * Add item to wardrobe
 */
export async function addToWardrobe(item: Omit<WardrobeItem, 'id' | 'addedAt'>): Promise<WardrobeItem> {
    const wardrobe = await getWardrobe()

    // Check for duplicates
    const exists = wardrobe.items.some(i => i.imageUrl === item.imageUrl)
    if (exists) {
        throw new Error('Item already in wardrobe')
    }

    const newItem: WardrobeItem = {
        ...item,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: Date.now()
    }

    wardrobe.items.push(newItem)

    await saveWardrobe(wardrobe.items)
    return newItem
}

/**
 * Add multiple items at once
 */
export async function addMultipleToWardrobe(items: Omit<WardrobeItem, 'id' | 'addedAt'>[]): Promise<WardrobeItem[]> {
    const wardrobe = await getWardrobe()
    const existingUrls = new Set(wardrobe.items.map(i => i.imageUrl))

    const newItems: WardrobeItem[] = items
        .filter(item => !existingUrls.has(item.imageUrl))
        .map(item => ({
            ...item,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            addedAt: Date.now()
        }))

    wardrobe.items.push(...newItems)
    await saveWardrobe(wardrobe.items)

    return newItems
}

/**
 * Remove item from wardrobe
 */
export async function removeFromWardrobe(id: string): Promise<void> {
    const wardrobe = await getWardrobe()
    wardrobe.items = wardrobe.items.filter(item => item.id !== id)
    await saveWardrobe(wardrobe.items)
}

/**
 * Update item category
 */
export async function updateItemCategory(id: string, category: WardrobeCategory): Promise<void> {
    const wardrobe = await getWardrobe()
    const item = wardrobe.items.find(i => i.id === id)
    if (item) {
        item.category = category
        await saveWardrobe(wardrobe.items)
    }
}

/**
 * Clear entire wardrobe
 */
export async function clearWardrobe(): Promise<void> {
    await saveWardrobe([])
}

/**
 * Clear items from a specific category
 */
export async function clearCategory(category: WardrobeCategory): Promise<void> {
    const wardrobe = await getWardrobe()
    wardrobe.items = wardrobe.items.filter(item => item.category !== category)
    await saveWardrobe(wardrobe.items)
}

/**
 * Get unique sources (pages) 
 */
export async function getUniqueSources(): Promise<string[]> {
    const wardrobe = await getWardrobe()
    return [...new Set(wardrobe.items.map(i => i.sourcePage))]
}

/**
 * Get wardrobe stats
 */
export async function getWardrobeStats(): Promise<{ totalItems: number; totalPages: number }> {
    const wardrobe = await getWardrobe()
    const uniquePages = new Set(wardrobe.items.map(i => i.sourcePage))
    return {
        totalItems: wardrobe.items.length,
        totalPages: uniquePages.size
    }
}

// Internal save function
async function saveWardrobe(items: WardrobeItem[]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEY]: { items } }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve()
            }
        })
    })
}

/**
 * Auto-detect category based on keywords
 */
export function detectCategory(name: string, imageUrl: string): WardrobeCategory {
    const text = (name + ' ' + imageUrl).toLowerCase()

    // Tops
    if (/shirt|blouse|top|jacket|coat|sweater|hoodie|cardigan|vest|tee|polo/i.test(text)) {
        return 'tops'
    }

    // Bottoms
    if (/pants|jeans|shorts|skirt|trousers|legging/i.test(text)) {
        return 'bottoms'
    }

    // Footwear
    if (/shoe|sneaker|boot|sandal|loafer|heel|slipper/i.test(text)) {
        return 'footwear'
    }

    // Accessories
    if (/hat|cap|scarf|bag|belt|watch|glasses|sunglasses|jewelry|necklace|bracelet|ring|tie|glove/i.test(text)) {
        return 'accessories'
    }

    // Default to tops
    return 'tops'
}
