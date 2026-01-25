/**
 * API Services Layer for Video Generation
 * 
 * This module provides unified interfaces for calling external video generation APIs:
 * - Fal.ai: For LTX-Video model
 * - WaveSpeedAI: For Kling and Wan models
 */

// ============================================================================
// Types
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai"

export interface VideoGenerationOptions {
    prompt: string
    imageBase64?: string       // Base64 image for Image-to-Video mode
    duration?: number          // seconds (default: 5)
    resolution?: string        // "480p" | "720p" | "1080p"
    aspectRatio?: string       // "16:9" | "9:16" | "1:1"
    seed?: number
    negativePrompt?: string
    includeAudio?: boolean     // Added: support for Phở Sound FX
    motion?: number            // Added: support for motion intensity (1-10)
    // Webhook mode options
    webhookUrl?: string        // If provided, use webhook mode instead of polling
    webhookMetadata?: {        // Custom metadata to include in webhook callback
        userId: string
        generationId: string
    }
}

export interface VideoGenerationResult {
    videoUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

// ============================================================================
// Image Generation Types
// ============================================================================

export interface ImageGenerationOptions {
    prompt: string
    aspectRatio?: string       // "16:9" | "9:16" | "1:1" | "4:3" | "3:4"
    seed?: number
    numImages?: number         // default: 1
    modelId?: string           // "flux-pro-v1.1" | "recraft-v3"
}

export interface ImageGenerationResult {
    imageUrls: string[]        // Now returns an array of URLs
    requestId: string
    status: "completed" | "failed"
    error?: string
}

export interface EnhancedPromptResult {
    enhancedPrompt: string
}

interface PollOptions {
    maxAttempts?: number       // Max polling attempts
    intervalMs?: number        // Polling interval in ms
    creative?: boolean         // For upscaling: use creative refinement
}

// ============================================================================
// Fal.ai Service (LTX-Video)
// ============================================================================

const FAL_API_BASE = "https://queue.fal.run"
const FAL_KEY = process.env.FAL_KEY

interface FalQueueResponse {
    request_id: string
    status: string
}

interface FalStatusResponse {
    status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
    logs?: Array<{ message: string; timestamp: string }>
}

interface FalResultResponse {
    video: {
        url: string
        content_type: string
        file_name: string
        file_size: number
    }
    seed: number
}

/**
 * Submit a video generation job to Fal.ai queue
 */
async function submitFalJob(options: VideoGenerationOptions): Promise<string> {
    const response = await fetch(`${FAL_API_BASE}/fal-ai/ltx-video`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
            prompt: options.prompt,
            negative_prompt: options.negativePrompt || "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
            num_inference_steps: 30,
            guidance_scale: 3,
            seed: options.seed,
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        let errorDetail = "Generation service busy. Please try again later."
        try {
            const errorJson = JSON.parse(errorBody)
            // Extract specific error from FAL response
            if (errorJson.detail) {
                errorDetail = errorJson.detail
            } else if (errorJson.error) {
                errorDetail = errorJson.error
            } else if (errorJson.message) {
                errorDetail = errorJson.message
            }
        } catch {
            // If not JSON, use raw text if short enough
            if (errorBody.length < 200) {
                errorDetail = errorBody
            }
        }
        console.error(`❌ [Fal.ai] API Error: ${errorDetail}`)
        throw new Error(errorDetail)
    }

    const data: FalQueueResponse = await response.json()
    return data.request_id
}

/**
 * Submit a video generation job to Fal.ai with webhook callback
 * Instead of polling, Fal.ai will call our webhook when the job completes
 */
async function submitFalJobWithWebhook(
    options: VideoGenerationOptions
): Promise<{ requestId: string; status: "submitted" }> {
    if (!options.webhookUrl) {
        throw new Error("webhookUrl is required for webhook mode")
    }

    const response = await fetch(`${FAL_API_BASE}/fal-ai/ltx-video`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
            prompt: options.prompt,
            negative_prompt: options.negativePrompt || "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
            num_inference_steps: 30,
            guidance_scale: 3,
            seed: options.seed,
            // Webhook configuration
            webhook_url: options.webhookUrl,
            webhook_metadata: options.webhookMetadata,
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        let errorDetail = "Generation service busy. Please try again later."
        try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.detail) errorDetail = errorJson.detail
            else if (errorJson.error) errorDetail = errorJson.error
            else if (errorJson.message) errorDetail = errorJson.message
        } catch {
            if (errorBody.length < 200) errorDetail = errorBody
        }
        console.error(`❌ [Fal.ai Webhook] API Error: ${errorDetail}`)
        throw new Error(errorDetail)
    }

    const data: FalQueueResponse = await response.json()
    console.log(`📤 [Fal.ai Webhook] Job submitted with webhook: ${data.request_id}`)
    return { requestId: data.request_id, status: "submitted" }
}

/**
 * Check the status of a Fal.ai job
 */
async function checkFalStatus(requestId: string): Promise<FalStatusResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/ltx-video/requests/${requestId}/status`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error("Failed to check status")
    }

    return response.json()
}

/**
 * Get the result of a completed Fal.ai job
 */
async function getFalResult(requestId: string): Promise<FalResultResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/ltx-video/requests/${requestId}`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error("Failed to retrieve result")
    }

    return response.json()
}

/**
 * Generate video using Fal.ai LTX-Video model
 * Handles the full queue → poll → result flow
 */
export async function generateFalVideo(
    options: VideoGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<VideoGenerationResult> {
    const { maxAttempts = 150, intervalMs = 2000 } = pollOptions

    // Check if API key is configured
    if (!FAL_KEY) {
        console.warn("⚠️ FAL_KEY not configured, using mock response")
        return mockVideoGeneration(options, "fal-mock")
    }

    try {
        console.log("📤 [VideoService] Submitting request...")

        // Submit the job
        const requestId = await submitFalJob(options)
        console.log(`📋 [VideoService] Job submitted, id: ${requestId}`)

        // Poll for completion
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(intervalMs)

            const status = await checkFalStatus(requestId)
            console.log(`🔄 [VideoService] Status: ${status.status} (attempt ${attempt + 1}/${maxAttempts})`)

            if (status.status === "COMPLETED") {
                const result = await getFalResult(requestId)
                console.log(`✅ [VideoService] Generated successfully`)
                return {
                    videoUrl: result.video.url,
                    requestId,
                    status: "completed",
                }
            }

            if (status.status === "FAILED") {
                throw new Error("Processing failed")
            }
        }

        throw new Error("Processing timed out")
    } catch (error) {
        console.error("❌ [VideoService] Error:", error)
        return {
            videoUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error && error.message.includes("busy") ? error.message : "Generation failed. Please try again.",
        }
    }
}

// ============================================================================
// WaveSpeedAI Service (Kling & Wan)
// ============================================================================

const WAVESPEED_API_BASE = "https://api.wavespeed.ai/api/v3"
const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY

// Model mapping: our model IDs to WaveSpeed model paths
// Text-to-Video paths
const WAVESPEED_T2V_MODELS: Record<string, string> = {
    "kling-2.6-pro": "kwaivgi/kling-v2.6-pro/text-to-video",
    "wan-2.6": "alibaba/wan-2.6/text-to-video",
}

// Image-to-Video paths
const WAVESPEED_I2V_MODELS: Record<string, string> = {
    "kling-2.6-pro": "kwaivgi/kling-v2.6-pro/image-to-video",
    "wan-2.6": "alibaba/wan-2.6/image-to-video",
}

// Models that support I2V
const I2V_SUPPORTED_MODELS = ["kling-2.6-pro", "wan-2.6"]

function stripBase64Prefix(dataUrl: string): string {
    if (dataUrl.startsWith('data:')) {
        const commaIndex = dataUrl.indexOf(',');
        if (commaIndex !== -1) {
            return dataUrl.substring(commaIndex + 1);
        }
    }
    return dataUrl;
}

interface WaveSpeedSubmitResponse {
    code: number
    message: string
    data: {
        id: string
        status: string
    }
}

interface WaveSpeedStatusResponse {
    code: number
    message: string
    data: {
        id: string
        status: "pending" | "processing" | "completed" | "failed"
        outputs?: string[]  // Array of video URLs (confirmed via FORENSIC audit)
        error?: string
    }
}

/**
 * Submit a video generation task to WaveSpeedAI
 */
async function submitWaveSpeedTask(
    model: string,
    options: VideoGenerationOptions
): Promise<string> {
    // Determine if this is I2V mode and select appropriate model path
    const isI2VMode = !!options.imageBase64
    const modelPaths = isI2VMode ? WAVESPEED_I2V_MODELS : WAVESPEED_T2V_MODELS
    const modelPath = modelPaths[model] || WAVESPEED_T2V_MODELS["wan-2.6"]

    console.log(`📤 [VideoService] Using engine ${isI2VMode ? 'I2V' : 'T2V'}`)

    // Calculate dimensions based on resolution and aspect ratio (default 16:9)
    const aspectRatio = options.aspectRatio || "16:9"
    let width = 1280
    let height = 720

    if (options.resolution === "1080p") {
        // High Quality base
        if (aspectRatio === "16:9") { width = 1920; height = 1080 }
        else if (aspectRatio === "9:16") { width = 1080; height = 1920 }
        else if (aspectRatio === "1:1") { width = 1080; height = 1080 }
        else if (aspectRatio === "21:9") { width = 2560; height = 1080 } // Ultra-wide
    } else if (options.resolution === "480p") {
        // Fast base
        if (aspectRatio === "16:9") { width = 854; height = 480 }
        else if (aspectRatio === "9:16") { width = 480; height = 854 }
        else if (aspectRatio === "1:1") { width = 512; height = 512 }
        else if (aspectRatio === "21:9") { width = 1024; height = 440 }
    } else {
        // 720p base (Default)
        if (aspectRatio === "16:9") { width = 1280; height = 720 }
        else if (aspectRatio === "9:16") { width = 720; height = 1280 }
        else if (aspectRatio === "1:1") { width = 768; height = 768 }
        else if (aspectRatio === "21:9") { width = 1680; height = 720 }
    }

    // Build request body
    const requestBody: Record<string, unknown> = {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || "low quality, blurry, distorted",
        size: `${width}x${height}`,
        duration: options.duration || 5,
        seed: options.seed,
        enable_prompt_enhancer: true,
        // Map 1-10 motion slider to engine specific intensity
        // WaveSpeed v3 models (Kling 2.6 / Wan 2.6) often use 1-10 scale directly 
        // or map to motion_bucket_id (1-255). We use a conservative mapping.
        motion: options.motion || 5,
    }

    // Add image for I2V mode
    if (isI2VMode && options.imageBase64) {
        // WaveSpeed expects raw base64 without the data:image/... prefix
        requestBody.image = stripBase64Prefix(options.imageBase64)
    }

    const response = await fetch(`${WAVESPEED_API_BASE}/${modelPath}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${WAVESPEED_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        throw new Error("Generation service at capacity")
    }

    const data: WaveSpeedSubmitResponse = await response.json()

    if (data.code !== 200 && data.code !== 0) {
        // Log original message internally but return generic error to client
        console.error(`[Internal] Engine Error: ${data.message}`)
        throw new Error("Generation error. Please try again with different settings.")
    }

    return data.data.id
}

/**
 * Check the status of a WaveSpeedAI task
 */
async function checkWaveSpeedStatus(taskId: string): Promise<WaveSpeedStatusResponse["data"]> {
    const response = await fetch(`${WAVESPEED_API_BASE}/predictions/${taskId}/result`, {
        headers: {
            "Authorization": `Bearer ${WAVESPEED_API_KEY}`,
        },
    })

    if (!response.ok) {
        throw new Error("Failed to sync progress")
    }

    const data: WaveSpeedStatusResponse = await response.json()
    return data.data
}

/**
 * Generate video using WaveSpeedAI (Kling or Wan models)
 * Handles the full submit → poll → result flow
 */
export async function generateWaveSpeedVideo(
    model: string,
    options: VideoGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<VideoGenerationResult> {
    const { maxAttempts = 150, intervalMs = 2000 } = pollOptions

    // Check if API key is configured
    if (!WAVESPEED_API_KEY || WAVESPEED_API_KEY === "ws_your_api_key_here") {
        console.warn("⚠️ WAVESPEED_API_KEY not configured or using placeholder, using mock response")
        return mockVideoGeneration(options, `wavespeed-mock-${model}`)
    }

    try {
        console.log(`📤 [VideoService] Submitting generation request...`)

        // Submit the task
        const taskId = await submitWaveSpeedTask(model, options)

        // Poll for completion
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(intervalMs)

            const status = await checkWaveSpeedStatus(taskId)

            if (status.status === "completed") {
                // WaveSpeed v3 returns outputs as string[] array
                const videoUrl = status.outputs?.[0]
                if (!videoUrl) {
                    throw new Error("Missing result data")
                }
                console.log(`✅ [VideoService] Generated successfully`)
                return {
                    videoUrl,
                    requestId: taskId,
                    status: "completed",
                }
            }

            if (status.status === "failed") {
                console.error(`[Internal] Task Failed: ${status.error}`)
                throw new Error("Processing failed")
            }
        }

        throw new Error("Task timed out")
    } catch (error) {
        console.error("❌ [VideoService] Error:", error)
        return {
            videoUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Service error",
        }
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock video generation for development/testing when API keys not configured
 */
async function mockVideoGeneration(
    options: VideoGenerationOptions,
    provider: string
): Promise<VideoGenerationResult> {
    console.log(`🎬 [Internal] Simulating generation for service`)
    console.log(`   Prompt: ${options.prompt.substring(0, 100)}...`)

    // Simulate processing time (2-4 seconds for mock)
    await sleep(2000 + Math.random() * 2000)

    // Return sample video URLs for testing
    const sampleVideos = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    ]

    return {
        videoUrl: sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
        requestId: `mock-${Date.now()}`,
        status: "completed",
    }
}

// ============================================================================
// Unified Generation Function
// ============================================================================

export type SupportedModel = "ltx-video" | "kling-2.6-pro" | "wan-2.6"

/**
 * Generate video using the appropriate provider based on model selection
 */
export async function generateVideo(
    model: SupportedModel,
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
    switch (model) {
        case "ltx-video":
            return generateFalVideo(options)

        case "kling-2.6-pro":
        case "wan-2.6":
            return generateWaveSpeedVideo(model, options)

        default:
            throw new Error(`Unsupported model: ${model}`)
    }
}

// ============================================================================
// Image Generation Service (Fal.ai FLUX Pro)
// ============================================================================

interface FalImageResultResponse {
    images: Array<{
        url: string
        width: number
        height: number
        content_type: string
    }>
    seed: number
}

/**
 * Convert aspect ratio string to image_size object for FLUX
 */
function getImageSizeFromAspectRatio(aspectRatio: string): { width: number; height: number } {
    switch (aspectRatio) {
        case "16:9":
            return { width: 1408, height: 768 }
        case "9:16":
            return { width: 768, height: 1408 }
        case "1:1":
            return { width: 1024, height: 1024 }
        case "4:3":
            return { width: 1152, height: 896 }
        case "3:4":
            return { width: 896, height: 1152 }
        case "21:9":
            return { width: 1536, height: 640 }
        default:
            return { width: 1024, height: 1024 }
    }
}

/**
 * Submit an image generation job to Fal.ai FLUX Pro queue
 */
async function submitFalImageJob(options: ImageGenerationOptions): Promise<string> {
    const imageSize = getImageSizeFromAspectRatio(options.aspectRatio || "1:1")

    const response = await fetch(`${FAL_API_BASE}/fal-ai/flux-pro/v1.1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
            prompt: options.prompt,
            image_size: imageSize,
            num_images: options.numImages || 1,
            seed: options.seed,
            enable_safety_checker: true,
            safety_tolerance: "2", // Moderate
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Fal.ai FLUX submission failed: ${error}`)
    }

    const data: FalQueueResponse = await response.json()
    return data.request_id
}

/**
 * Check the status of a Fal.ai FLUX image job
 */
async function checkFalImageStatus(requestId: string): Promise<FalStatusResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/flux-pro/v1.1/requests/${requestId}/status`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to check Fal.ai FLUX status: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Get the result of a completed Fal.ai FLUX image job
 */
async function getFalImageResult(requestId: string): Promise<FalImageResultResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/flux-pro/v1.1/requests/${requestId}`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to get Fal.ai FLUX result: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Original generateImage renamed to generateImageInternal
 */
async function generateImageInternal(
    options: ImageGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<ImageGenerationResult> {
    const { maxAttempts = 60, intervalMs = 1000 } = pollOptions

    // Check if API key is configured
    if (!FAL_KEY) {
        console.warn("⚠️ FAL_KEY not configured, using mock response")
        return mockImageGeneration(options)
    }

    try {
        console.log("🖼️ [Fal.ai FLUX] Submitting image generation request...")
        console.log(`   Prompt: ${options.prompt.substring(0, 80)}...`)
        console.log(`   Aspect Ratio: ${options.aspectRatio || "1:1"}`)

        // Submit the job
        const requestId = await submitFalImageJob(options)
        console.log(`📋 [Fal.ai FLUX] Job submitted, request_id: ${requestId}`)

        // Poll for completion
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(intervalMs)

            const status = await checkFalImageStatus(requestId)
            console.log(`🔄 [Fal.ai FLUX] Status: ${status.status} (attempt ${attempt + 1}/${maxAttempts})`)

            if (status.status === "COMPLETED") {
                const result = await getFalImageResult(requestId)

                if (!result.images || result.images.length === 0) {
                    throw new Error("No images returned from FLUX Pro")
                }

                console.log(`✅ [Fal.ai FLUX] Image generation successfully`)
                return {
                    imageUrls: result.images.map(img => img.url),
                    requestId,
                    status: "completed",
                }
            }

            if (status.status === "FAILED") {
                throw new Error("Fal.ai FLUX job failed")
            }
        }

        throw new Error("Fal.ai FLUX job timed out after 1 minute")
    } catch (error) {
        console.error("❌ [Fal.ai FLUX] Error:", error)
        return {
            imageUrls: [],
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}

/**
 * Image Generation Unified Wrapper
 */
export async function generateImage(
    options: ImageGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<ImageGenerationResult> {
    const model = options.modelId || "flux-pro-v1.1"

    if (model === "recraft-v3") {
        return generateRecraftImage(options, pollOptions)
    }

    // Default to Flux
    return generateFluxImage(options, pollOptions)
}

/**
 * Generate image using Fal.ai Recraft V3 model
 */
export async function generateRecraftImage(
    options: ImageGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<ImageGenerationResult> {
    const { maxAttempts = 60, intervalMs = 1000 } = pollOptions

    if (!FAL_KEY) {
        return mockImageGeneration(options)
    }

    try {
        console.log("🎨 [Fal.ai Recraft] Submitting image generation request...")

        const response = await fetch(`${FAL_API_BASE}/fal-ai/recraft-v3`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${FAL_KEY}`,
            },
            body: JSON.stringify({
                prompt: options.prompt,
                image_size: getImageSizeFromAspectRatio(options.aspectRatio || "1:1"),
                // Recraft might have different field names but flux-pro/v1.1 structure is common in fal
                // Let's assume standard fal structure for now
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Fal.ai Recraft submission failed: ${error}`)
        }

        const data: FalQueueResponse = await response.json()
        const requestId = data.request_id

        // Poll for completion
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(intervalMs)
            const statusResponse = await fetch(`${FAL_API_BASE}/fal-ai/recraft-v3/requests/${requestId}/status`, {
                headers: { "Authorization": `Key ${FAL_KEY}` }
            })
            const status: FalStatusResponse = await statusResponse.json()

            if (status.status === "COMPLETED") {
                const res = await fetch(`${FAL_API_BASE}/fal-ai/recraft-v3/requests/${requestId}`, {
                    headers: { "Authorization": `Key ${FAL_KEY}` }
                })
                const result: FalImageResultResponse = await res.json()
                return {
                    imageUrls: result.images.map(img => img.url),
                    requestId,
                    status: "completed",
                }
            }
            if (status.status === "FAILED") throw new Error("Recraft job failed")
        }
        throw new Error("Recraft job timed out")
    } catch (error) {
        console.error("❌ [Fal.ai Recraft] Error:", error)
        return { imageUrls: [], requestId: "", status: "failed", error: error instanceof Error ? error.message : "Unknown error" }
    }
}

/**
 * Rename internal function for clarity
 */
async function generateFluxImage(
    options: ImageGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<ImageGenerationResult> {
    // Current generateImage implementation moved here
    return generateImageInternal(options, pollOptions)
}

/**
 * Mock image generation for development/testing
 */
async function mockImageGeneration(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    console.log(`🖼️ [Mock] Simulating image generation...`)
    console.log(`   Prompt: ${options.prompt.substring(0, 80)}...`)

    // Simulate processing time
    await sleep(1500 + Math.random() * 1500)

    // Return sample image URLs
    const sampleImages = [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024",
        "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=1024",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024",
    ]

    return {
        imageUrls: Array(options.numImages || 1).fill("").map((_, i) => sampleImages[(i + Math.floor(Math.random() * sampleImages.length)) % sampleImages.length]),
        requestId: `mock-img-${Date.now()}`,
        status: "completed",
    }
}

// ============================================================================
// Video Upscaling Service (Fal.ai)
// ============================================================================

interface UpscaleResult {
    upscaledUrl: string
    requestId: string
}

interface FalUpscaleResultResponse {
    video: {
        url: string
        content_type: string
        file_name: string
        file_size: number
    }
}

/**
 * Submit a video upscale job to Fal.ai queue
 * Returns either request_id for async jobs or the result directly
 */
interface FalUpscaleSubmitResult {
    isAsync: boolean
    requestId?: string
    directResult?: FalUpscaleResultResponse
}



async function submitFalUpscaleJob(videoUrl: string, upscaleOptions: { creative?: boolean } = {}): Promise<FalUpscaleSubmitResult> {
    console.log(`📤 [Upscale] Submitting to Fal.ai video-upscaler (Creative: ${!!upscaleOptions.creative})...`)
    console.log(`   URL: ${FAL_API_BASE}/fal-ai/video-upscaler`)

    const payload: any = {
        video_url: videoUrl,
        scale: upscaleOptions.creative ? 4 : 2, // 4x for cinematic, 2x for fast
    }

    if (upscaleOptions.creative) {
        payload.creativity = 0.35 // Higher creativity for cinematic
        payload.detail_level = 0.8 // More details
    }

    const response = await fetch(`${FAL_API_BASE}/fal-ai/video-upscaler`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log(`📥 [Upscale] Response status: ${response.status}`)
    console.log(`📥 [Upscale] Response body: ${responseText.substring(0, 500)}...`)

    if (!response.ok) {
        throw new Error(`Fal.ai upscale submission failed: ${responseText}`)
    }

    const data = JSON.parse(responseText)

    // Check if it's a queue response (async) or direct result (sync)
    if (data.request_id && !data.video) {
        console.log(`📋 [Upscale] Got queue response, request_id: ${data.request_id}`)
        return { isAsync: true, requestId: data.request_id }
    } else if (data.video) {
        console.log(`✅ [Upscale] Got direct result!`)
        return { isAsync: false, directResult: data }
    } else {
        console.warn(`⚠️ [Upscale] Unexpected response format:`, data)
        // Try to use request_id if available
        if (data.request_id) {
            return { isAsync: true, requestId: data.request_id }
        }
        throw new Error(`Unexpected Fal.ai response format: ${JSON.stringify(data)}`)
    }
}


/**
 * Check the status of a Fal.ai upscale job
 */
async function checkFalUpscaleStatus(requestId: string): Promise<FalStatusResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/video-upscaler/requests/${requestId}/status`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to check Fal.ai upscale status: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Get the result of a completed Fal.ai upscale job
 */
async function getFalUpscaleResult(requestId: string): Promise<FalUpscaleResultResponse> {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/video-upscaler/requests/${requestId}`,
        {
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(`Failed to get Fal.ai upscale result: ${response.statusText}`)
    }

    return response.json()
}

/**
 * Upscale a video to higher resolution using Fal.ai video-upscaler
 * Handles the full queue → poll → result flow (or direct result)
 */
export async function upscaleVideo(
    videoUrl: string,
    pollOptions: PollOptions = {}
): Promise<UpscaleResult> {
    const maxAttempts = pollOptions.maxAttempts || 120 // Up to 10 minutes
    const intervalMs = pollOptions.intervalMs || 5000 // Check every 5 seconds

    console.log(`🔍 [Upscale] Starting video upscale (Creative: ${!!pollOptions.creative})...`)
    console.log(`   Video URL: ${videoUrl.substring(0, 80)}...`)

    try {
        // Submit upscale job
        const submission = await submitFalUpscaleJob(videoUrl, { creative: pollOptions.creative })
        console.log(`📤 [Upscale] Job submitted. Async: ${submission.isAsync}`)
        if (!submission.isAsync && submission.directResult) {
            console.log(`✅ [Upscale] Got direct result! No polling needed.`)
            return {
                upscaledUrl: submission.directResult.video.url,
                requestId: "direct",
            }
        }

        // Otherwise, poll for completion
        const requestId = submission.requestId!
        console.log(`📤 [Upscale] Job submitted, request ID: ${requestId}`)

        let attempts = 0
        while (attempts < maxAttempts) {
            const status = await checkFalUpscaleStatus(requestId)
            console.log(`⏳ [Upscale] Status: ${status.status} (attempt ${attempts + 1}/${maxAttempts})`)

            if (status.status === "COMPLETED") {
                // Get result
                const result = await getFalUpscaleResult(requestId)
                console.log(`✅ [Upscale] Complete! Upscaled video ready.`)

                return {
                    upscaledUrl: result.video.url,
                    requestId,
                }
            }

            if (status.status === "FAILED") {
                const errorMsg = status.logs?.[status.logs.length - 1]?.message || "Unknown error"
                throw new Error(`Upscale job failed: ${errorMsg}`)
            }

            await sleep(intervalMs)
            attempts++
        }

        throw new Error("Upscale job timed out after maximum attempts")

    } catch (error) {
        console.error(`❌ [Upscale] Error:`, error)
        throw error
    }
}

/**
 * Enhance a simple prompt into a cinematic masterpiece using Google Gemini
 */
export async function enhancePrompt(prompt: string): Promise<EnhancedPromptResult> {
    console.log(`🪄 [Enhance] Enhancing prompt with Gemini: "${prompt}"`)

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        console.warn("⚠️ [Enhance] GOOGLE_API_KEY is missing or using placeholder.")
        throw new Error("Gemini API Key is not configured. Please add GOOGLE_API_KEY to your .env.local file.")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Using gemini-2.5-flash (gemini-2.0-flash was deprecated Feb 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const systemPrompt = `
You are a professional AI Video Prompt Engineer for "Phở Video". 
Your task is to expand a simple user prompt into a high-quality, cinematic, and detailed description suitable for top-tier AI video models like Kling, Luma, and Runway.

Guidelines:
1. Add specific details about lighting (e.g., golden hour, cinematic lighting, neon glow, volumetric fog).
2. Specify camera angles and motion (e.g., slow-motion, wide shot, 4k, drone view, handheld, dolly zoom).
3. Describe textures, colors, and atmosphere (e.g., highly detailed, photorealistic, moody, vivid colors).
4. Keep the core subject intact but make it much more vivid.
5. Provide ONLY the enhanced prompt string. No conversational text, no explanations, no "Here is your prompt".
6. The output MUST be in English for maximum AI model compatibility, even if the input is Vietnamese.

Target Style: Cinematic Masterpiece, 8k, Ultra-detailed.
`

    try {
        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `User request: "${prompt}"` }
        ])

        const response = await result.response
        const text = response.text().trim()

        // Clean up potential quotes if the AI included them
        const cleanedText = text.replace(/^"|"$/g, '').trim()

        console.log(`✅ [Enhance] Enhanced prompt: "${cleanedText.substring(0, 80)}..."`)
        return { enhancedPrompt: cleanedText }

    } catch (error) {
        console.error(`❌ [Enhance] Gemini Error:`, error)
        throw new Error("Failed to enhance prompt with Gemini AI")
    }
}

// ============================================================================
// Audio Generation Service (Fal.ai MM-Audio)
// ============================================================================

interface AudioGenerationResult {
    audioUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

interface FalAudioResponse {
    audio_url?: { url: string }     // mm-audio currently returns separate audio or merged video?
    video_url?: { url: string }     // It might return a new video URL with sound
}

/**
 * Generate audio for a video using Fal.ai MM-Audio v2
 */
export async function generateAudio(
    videoUrl: string,
    prompt?: string
): Promise<AudioGenerationResult> {
    console.log(`🎵 [Audio] Generating audio for video...`)
    console.log(`   Video URL: ${videoUrl.substring(0, 50)}...`)
    console.log(`   Prompt: ${prompt || "Auto-detect"}`)

    if (!FAL_KEY) {
        throw new Error("FAL_KEY not configured")
    }

    try {
        const response = await fetch(`${FAL_API_BASE}/fal-ai/mm-audio-v2`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${FAL_KEY}`,
            },
            body: JSON.stringify({
                video_url: videoUrl,
                prompt: prompt || "Clear high fidelity sound effects and background music matching the video content",
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Fal.ai audio generation failed: ${error}`)
        }

        const data = await response.json()
        console.log("🎵 [Audio] Response:", data)

        // MM-Audio v2 usually returns 'audio_url' or 'video_url' (merged)
        // We prefer the audio_url if available to keep original video, but if it returns merged video that's also fine.
        let resultUrl = ""

        if (data.audio_url?.url) {
            resultUrl = data.audio_url.url
        } else if (data.video_url?.url) {
            // Fallback: if it returns a merged video, we treat it as the "audio" source 
            // (or ideally we'd replace the videoUrl, but for now let's store it)
            resultUrl = data.video_url.url
        } else {
            throw new Error("No audio or video URL returned from MM-Audio")
        }

        return {
            audioUrl: resultUrl,
            requestId: data.request_id || `audio-${Date.now()}`,
            status: "completed"
        }

    } catch (error) {
        console.error("❌ [Audio] Error:", error)
        return {
            audioUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}


