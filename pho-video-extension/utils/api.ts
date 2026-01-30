// Use localhost for development, or user's deployed URL
const DEFAULT_API_BASE = "http://localhost:3000"

export interface TryOnRequest {
    modelImage: string
    garmentImage: string
    category: "tops" | "bottoms" | "one-pieces" | "auto"
}

export interface TryOnResponse {
    success: boolean
    imageUrls?: string[]
    error?: string
}

/**
 * Get API base URL from storage or use default
 */
async function getApiBase(): Promise<string> {
    if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["apiBaseUrl"])
        return result.apiBaseUrl || DEFAULT_API_BASE
    }
    return DEFAULT_API_BASE
}

/**
 * Call the Phở Video Try-on API
 */
export async function callTryOnApi(
    request: TryOnRequest,
    userToken?: string | null
): Promise<TryOnResponse> {
    try {
        const apiBase = await getApiBase()
        console.log("[Phở Video] Calling API:", apiBase)

        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        }

        if (userToken) {
            headers["Authorization"] = `Bearer ${userToken}`
        }

        const response = await fetch(`${apiBase}/api/ai/try-on`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                modelImageUrl: request.modelImage,
                garmentImageUrl: request.garmentImage,
                garmentType: request.category
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || `API Error: ${response.status}`
            }
        }

        const data = await response.json()
        return {
            success: true,
            imageUrls: data.imageUrls || [data.imageUrl]
        }
    } catch (error) {
        console.error("[Phở Video] API Error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error - kiểm tra API URL"
        }
    }
}

/**
 * Convert image URL to base64
 */
export async function imageUrlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error("[Phở Video] Image fetch error:", error)
        throw error
    }
}
