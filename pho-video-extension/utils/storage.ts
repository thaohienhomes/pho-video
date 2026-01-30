import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export interface UserSettings {
    modelImageUrl: string | null
    userToken: string | null
}

/**
 * Get stored user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
    const modelImageUrl = await storage.get<string>("modelImageUrl")
    const userToken = await storage.get<string>("userToken")
    return {
        modelImageUrl: modelImageUrl || null,
        userToken: userToken || null
    }
}

/**
 * Save model image URL (user's body photo)
 */
export async function saveModelImageUrl(url: string): Promise<void> {
    await storage.set("modelImageUrl", url)
}

/**
 * Save user token for API authentication
 */
export async function saveUserToken(token: string): Promise<void> {
    await storage.set("userToken", token)
}

/**
 * Clear all stored settings
 */
export async function clearSettings(): Promise<void> {
    await storage.remove("modelImageUrl")
    await storage.remove("userToken")
}

/**
 * Hook-style storage access using Plasmo's useStorage
 */
export { storage }
