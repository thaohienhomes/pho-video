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

// Google Gemini API types (we use manual fetch now to avoid SDK version issues)
export interface EnhancedPromptResult {
    enhancedPrompt: string;
}

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
// Fal.ai Service (LTX-Video, Kling, Minimax via SDK)
// ============================================================================

import { fal } from "@fal-ai/client"

const FAL_API_BASE = "https://queue.fal.run"
const FAL_KEY = process.env.FAL_KEY

// Configure Fal.AI client
if (FAL_KEY) {
    fal.config({ credentials: FAL_KEY })
}

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
// Fal.AI Kling 2.5 Pro Service (NEW - Replaces WaveSpeed)
// ============================================================================

/**
 * Fal.AI Model Mapping
 * Maps our internal model IDs to Fal.AI endpoint paths
 */
const FAL_VIDEO_MODELS = {
    // === FAST TIER (Budget-friendly) ===
    // LTX-2 19B - Fast generation
    "pho-instant": "fal-ai/ltx-2-19b/text-to-video",
    "pho-instant-i2v": "fal-ai/ltx-2-19b/image-to-video",

    // Seedance v1.5 - ByteDance's fast alternative (NEW!)
    "pho-fast": "fal-ai/bytedance/seedance/v1/pro",
    "pho-fast-i2v": "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",

    // === STANDARD TIER (Quality balance) ===
    // Kling 2.5 Turbo Pro - Cinematic
    "pho-cinematic": "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
    "pho-cinematic-i2v": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",

    // Kling v2.6 Pro - Latest I2V upgrade (NEW!)
    "pho-cinematic-v26-i2v": "fal-ai/kling-video/v2.6/pro/image-to-video",

    // Minimax Hailuo 02 Standard - Smooth Motion
    "pho-motion": "fal-ai/minimax/hailuo-02/standard/text-to-video",
    "pho-motion-i2v": "fal-ai/minimax/hailuo-02/standard/image-to-video",

    // Minimax Hailuo 02 Pro - Higher quality (NEW!)
    "pho-motion-pro": "fal-ai/minimax/hailuo-02/pro/text-to-video",

    // === PREMIUM TIER (Enterprise quality) ===
    // Veo 3.1 - Google's flagship (Enterprise only)
    "pho-ultra": "fal-ai/veo3.1",
    "pho-ultra-fast": "fal-ai/veo3/fast",

    // Sora 2 Pro - OpenAI's flagship (Enterprise only)
    "pho-sora": "fal-ai/sora-2/pro",

    // Legacy mappings for backward compatibility
    "ltx-video": "fal-ai/ltx-2-19b/text-to-video",
    "kling-2.6-pro": "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
    "wan-2.6": "fal-ai/minimax/hailuo-02/standard/text-to-video",
}

type FalVideoModelId = keyof typeof FAL_VIDEO_MODELS

/**
 * Calculate video dimensions from resolution and aspect ratio
 */
function getVideoDimensions(resolution: string, aspectRatio: string): { width: number; height: number } {
    const baseWidths: Record<string, number> = {
        "480p": 854,
        "720p": 1280,
        "1080p": 1920,
    }
    const baseWidth = baseWidths[resolution] || 1280

    switch (aspectRatio) {
        case "16:9":
            return { width: baseWidth, height: Math.round(baseWidth * 9 / 16) }
        case "9:16":
            return { width: Math.round(baseWidth * 9 / 16), height: baseWidth }
        case "1:1":
            return { width: Math.min(baseWidth, 1024), height: Math.min(baseWidth, 1024) }
        case "21:9":
            return { width: baseWidth, height: Math.round(baseWidth * 9 / 21) }
        default:
            return { width: 1280, height: 720 }
    }
}

/**
 * Submit a video generation job to Fal.AI using the new unified endpoints
 */
async function submitFalVideoJob(
    modelId: FalVideoModelId,
    options: VideoGenerationOptions
): Promise<string> {
    const endpoint = FAL_VIDEO_MODELS[modelId] || FAL_VIDEO_MODELS["pho-instant"]
    const isI2V = !!options.imageBase64
    const dimensions = getVideoDimensions(options.resolution || "720p", options.aspectRatio || "16:9")

    console.log(`📤 [Fal.AI] Submitting to ${endpoint}`)
    console.log(`   Dimensions: ${dimensions.width}x${dimensions.height}`)
    console.log(`   Duration: ${options.duration || 5}s`)

    // Build request body based on model capabilities
    const requestBody: Record<string, unknown> = {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || "low quality, worst quality, deformed, distorted, blurry, watermark",
        duration: options.duration || 5,
        aspect_ratio: options.aspectRatio || "16:9",
    }

    // Kling-specific parameters
    if (modelId.includes("kling") || modelId.includes("pho-cinematic")) {
        requestBody.cfg_scale = 0.5
        requestBody.camera_control = { type: "none" }
    }

    // Minimax-specific parameters
    if (modelId.includes("minimax") || modelId.includes("pho-motion")) {
        requestBody.resolution = `${dimensions.width}x${dimensions.height}`
    }

    // LTX-2 specific parameters
    if (modelId.includes("ltx") || modelId.includes("pho-instant")) {
        requestBody.num_inference_steps = 50  // Increased from 30 for quality
        requestBody.guidance_scale = 4
    }

    // Add image for I2V mode
    if (isI2V && options.imageBase64) {
        // Strip data URL prefix if present
        let imageData = options.imageBase64
        if (imageData.startsWith('data:')) {
            const commaIndex = imageData.indexOf(',')
            if (commaIndex !== -1) {
                imageData = imageData.substring(commaIndex + 1)
            }
        }
        requestBody.image_url = `data:image/png;base64,${imageData}`
    }

    // Add seed if specified
    if (options.seed) {
        requestBody.seed = options.seed
    }

    const response = await fetch(`${FAL_API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        let errorDetail = "Generation service at capacity. Please try again."
        try {
            const errorJson = JSON.parse(errorBody)
            errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorDetail
        } catch {
            if (errorBody.length < 200) errorDetail = errorBody
        }
        console.error(`❌ [Fal.AI] API Error (${endpoint}): ${errorDetail}`)
        throw new Error(errorDetail)
    }

    const data: FalQueueResponse = await response.json()
    console.log(`📋 [Fal.AI] Job submitted: ${data.request_id}`)
    return data.request_id
}

/**
 * Check status of a Fal.AI job (works for any model)
 */
async function checkFalJobStatus(modelId: FalVideoModelId, requestId: string): Promise<FalStatusResponse> {
    // Fal.AI queue status uses /requests/{id}/status (no model path needed)
    const statusUrl = `${FAL_API_BASE}/requests/${requestId}/status`

    console.log(`🔍 [Fal.AI] Checking status: ${statusUrl}`)

    const response = await fetch(statusUrl, {
        headers: { "Authorization": `Key ${FAL_KEY}` },
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error(`❌ [Fal.AI] Status check failed (${response.status}): ${errorBody}`)
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

/**
 * Get result of a completed Fal.AI job
 */
async function getFalJobResult(modelId: FalVideoModelId, requestId: string): Promise<FalResultResponse> {
    // Fal.AI queue result uses /requests/{id} (no model path needed)
    const resultUrl = `${FAL_API_BASE}/requests/${requestId}`

    console.log(`📦 [Fal.AI] Getting result: ${resultUrl}`)

    const response = await fetch(resultUrl, {
        headers: { "Authorization": `Key ${FAL_KEY}` },
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error(`❌ [Fal.AI] Result fetch failed (${response.status}): ${errorBody}`)
        throw new Error(`Result fetch failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

/**
 * Generate video using any Fal.AI model
 * Uses fal.subscribe() SDK for proper queue handling
 */
export async function generateFalVideoUnified(
    modelId: string,
    options: VideoGenerationOptions,
    pollOptions: PollOptions = {}
): Promise<VideoGenerationResult> {
    // Determine if this is I2V mode and adjust model ID
    const isI2V = !!options.imageBase64
    let effectiveModelId = modelId as FalVideoModelId

    // Auto-switch to I2V variant if image provided
    if (isI2V && !modelId.includes("i2v")) {
        if (modelId === "pho-instant" || modelId === "ltx-video") {
            effectiveModelId = "pho-instant-i2v"
        } else if (modelId === "pho-cinematic" || modelId === "kling-2.6-pro") {
            effectiveModelId = "pho-cinematic-i2v"
        } else if (modelId === "pho-motion" || modelId === "wan-2.6") {
            effectiveModelId = "pho-motion-i2v"
        }
    }

    if (!FAL_KEY) {
        console.warn("⚠️ FAL_KEY not configured, using mock response")
        return mockVideoGeneration(options, "fal-mock")
    }

    try {
        const endpoint = FAL_VIDEO_MODELS[effectiveModelId] || FAL_VIDEO_MODELS["pho-instant"]
        const dimensions = getVideoDimensions(options.resolution || "720p", options.aspectRatio || "16:9")

        console.log(`🎬 [Fal.AI SDK] Starting ${effectiveModelId} generation...`)
        console.log(`   Endpoint: ${endpoint}`)
        console.log(`   Mode: ${isI2V ? 'Image-to-Video' : 'Text-to-Video'}`)
        console.log(`   Prompt: ${options.prompt.substring(0, 80)}...`)

        // Build input based on model type
        const input: Record<string, unknown> = {
            prompt: options.prompt,
            negative_prompt: options.negativePrompt || "low quality, worst quality, deformed, distorted, blurry, watermark",
            duration: options.duration || 5,
            aspect_ratio: options.aspectRatio || "16:9",
        }

        // Model-specific parameters
        if (effectiveModelId.includes("kling") || effectiveModelId.includes("pho-cinematic")) {
            input.cfg_scale = 0.5
        }
        if (effectiveModelId.includes("minimax") || effectiveModelId.includes("pho-motion")) {
            input.resolution = `${dimensions.width}x${dimensions.height}`
        }
        if (effectiveModelId.includes("ltx") || effectiveModelId.includes("pho-instant")) {
            input.num_inference_steps = 50
            input.guidance_scale = 4
        }

        // Add image for I2V mode
        if (isI2V && options.imageBase64) {
            let imageData = options.imageBase64
            if (imageData.startsWith('data:')) {
                const commaIndex = imageData.indexOf(',')
                if (commaIndex !== -1) {
                    imageData = imageData.substring(commaIndex + 1)
                }
            }
            input.image_url = `data:image/png;base64,${imageData}`
        }

        if (options.seed) {
            input.seed = options.seed
        }

        // Use fal.subscribe() for proper queue handling
        const result = await fal.subscribe(endpoint, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                console.log(`🔄 [Fal.AI SDK] ${effectiveModelId} status: ${update.status}`)
            },
        })

        console.log(`✅ [Fal.AI SDK] ${effectiveModelId} completed successfully`)

        // Extract video URL from result
        const videoUrl = (result.data as { video?: { url: string } })?.video?.url
        if (!videoUrl) {
            throw new Error("No video URL in response")
        }

        return {
            videoUrl,
            requestId: result.requestId,
            status: "completed",
        }
    } catch (error) {
        console.error(`❌ [Fal.AI SDK] ${effectiveModelId} error:`, error)
        return {
            videoUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Generation failed",
        }
    }
}

// ============================================================================
// WaveSpeedAI Service (DEPRECATED - Kept for backward compatibility)
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

// Fal.AI Model IDs - All tiers
export type SupportedModel =
    // Fast Tier (Budget-friendly)
    | "pho-instant"      // LTX-2 19B - Fast
    | "pho-fast"         // Seedance v1.5 - Cheapest
    // Standard Tier (Quality balance)
    | "pho-cinematic"    // Kling 2.5 Pro - Cinematic
    | "pho-motion"       // Minimax Hailuo Standard
    | "pho-motion-pro"   // Minimax Hailuo Pro
    // Premium Tier (Enterprise)
    | "pho-ultra"        // Veo 3.1 - Google flagship
    | "pho-sora"         // Sora 2 Pro - OpenAI flagship
    // Legacy aliases (backward compatibility)
    | "ltx-video"
    | "kling-2.6-pro"
    | "wan-2.6"

/**
 * Generate video using Fal.AI (all models now route through Fal.AI)
 * Legacy WaveSpeed models are automatically mapped to Fal.AI equivalents
 */
export async function generateVideo(
    model: SupportedModel,
    options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
    // All models now use Fal.AI unified function
    // Legacy model IDs are automatically mapped in FAL_VIDEO_MODELS
    console.log(`🎬 [VideoService] Generating with model: ${model}`)
    return generateFalVideoUnified(model, options)
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

    // Use manual fetch to bypass potential SDK issues with newer models or regional endpoints
    const modelName = "gemini-2.5-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

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
        console.log(`📡 [Enhance] Calling Gemini API (${modelName})...`)
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: systemPrompt }] },
                    { parts: [{ text: `User request: "${prompt}"` }] }
                ]
            })
        })

        const data = await res.json()

        if (!res.ok) {
            console.error(`❌ [Enhance] API Error ${res.status}:`, JSON.stringify(data, null, 2))
            throw new Error(`Gemini API error: ${data?.error?.message || 'Unknown error'}`)
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!text) {
            console.error("❌ [Enhance] Empty response from Gemini API")
            throw new Error("Empty response from Gemini API")
        }

        // Clean up potential quotes if the AI included them
        const cleanedText = text.replace(/^"|"$/g, '').trim()

        console.log(`✅ [Enhance] Enhanced prompt: "${cleanedText.substring(0, 80)}..."`)
        return { enhancedPrompt: cleanedText }

    } catch (error: any) {
        console.error(`❌ [Enhance] Gemini Error:`, error?.message || error)
        throw new Error(`Failed to enhance prompt with Gemini AI: ${error?.message || 'Unknown error'}`)
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


// ============================================================================
// Phase 2: AI Music Generation (NEW!)
// ============================================================================

export interface MusicGenerationOptions {
    prompt: string                    // Description of the music
    duration?: number                 // Duration in seconds (default: 30)
    model?: "minimax" | "elevenlabs" | "lyria2" | "ace-step"
    referenceAudioUrl?: string        // Optional reference audio for style
}

export interface MusicGenerationResult {
    audioUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

// Music model endpoints
const FAL_MUSIC_MODELS = {
    "minimax": "fal-ai/minimax-music/v2",
    "elevenlabs": "fal-ai/elevenlabs/music",
    "lyria2": "fal-ai/lyria2",
    "ace-step": "fal-ai/ace-step",
}

/**
 * Generate AI Music using Fal.AI
 * Supports MiniMax Music v2, ElevenLabs, Lyria2, and ACE-Step
 */
export async function generateMusic(
    options: MusicGenerationOptions
): Promise<MusicGenerationResult> {
    const modelId = options.model || "minimax"
    const endpoint = FAL_MUSIC_MODELS[modelId] || FAL_MUSIC_MODELS["minimax"]

    if (!FAL_KEY) {
        console.warn("⚠️ FAL_KEY not configured for music generation")
        return { audioUrl: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`🎵 [Music] Generating with ${modelId}...`)
        console.log(`   Prompt: ${options.prompt.substring(0, 80)}...`)
        console.log(`   Duration: ${options.duration || 30}s`)

        const input: Record<string, unknown> = {
            prompt: options.prompt,
            duration: options.duration || 30,
        }

        // Add reference audio if provided (for style transfer)
        if (options.referenceAudioUrl) {
            input.reference_audio_url = options.referenceAudioUrl
        }

        // Use fal.subscribe for queue handling
        const result = await fal.subscribe(endpoint, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                console.log(`🔄 [Music] ${modelId} status: ${update.status}`)
            },
        })

        console.log(`✅ [Music] Generation complete!`)

        // Extract audio URL from result
        const audioUrl = (result.data as { audio_url?: { url: string }, audio?: { url: string } })?.audio_url?.url
            || (result.data as { audio?: { url: string } })?.audio?.url

        if (!audioUrl) {
            throw new Error("No audio URL in response")
        }

        return {
            audioUrl,
            requestId: result.requestId,
            status: "completed",
        }
    } catch (error) {
        console.error(`❌ [Music] Error:`, error)
        return {
            audioUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Music generation failed",
        }
    }
}

// ============================================================================
// Phase 2: Text-to-Speech (TTS) Service
// ============================================================================

export interface TTSOptions {
    text: string
    voice?: string                    // Voice ID or name
    model?: "elevenlabs" | "minimax" | "chatterbox"
    language?: string                 // For multilingual models
}

export interface TTSResult {
    audioUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

const FAL_TTS_MODELS = {
    "elevenlabs": "fal-ai/elevenlabs/eleven-v3",
    "minimax": "fal-ai/minimax/speech-2.6-hd",
    "chatterbox": "fal-ai/chatterbox/multilingual",
}

/**
 * Generate Text-to-Speech using Fal.AI
 */
export async function generateTTS(
    options: TTSOptions
): Promise<TTSResult> {
    const modelId = options.model || "elevenlabs"
    const endpoint = FAL_TTS_MODELS[modelId] || FAL_TTS_MODELS["elevenlabs"]

    if (!FAL_KEY) {
        return { audioUrl: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`🗣️ [TTS] Generating with ${modelId}...`)
        console.log(`   Text: ${options.text.substring(0, 100)}...`)

        const input: Record<string, unknown> = {
            text: options.text,
        }

        if (options.voice) {
            input.voice_id = options.voice
        }
        if (options.language) {
            input.language = options.language
        }

        const result = await fal.subscribe(endpoint, {
            input,
            logs: true,
        })

        const audioUrl = (result.data as { audio_url?: { url: string }, audio?: { url: string } })?.audio_url?.url
            || (result.data as { audio?: { url: string } })?.audio?.url

        if (!audioUrl) {
            throw new Error("No audio URL in TTS response")
        }

        console.log(`✅ [TTS] Complete!`)
        return { audioUrl, requestId: result.requestId, status: "completed" }
    } catch (error) {
        console.error(`❌ [TTS] Error:`, error)
        return { audioUrl: "", requestId: "", status: "failed", error: error instanceof Error ? error.message : "TTS failed" }
    }
}

// ============================================================================
// Phase 2: Speech-to-Text (STT) / Transcription Service
// ============================================================================

export interface STTOptions {
    audioUrl: string
    model?: "whisper" | "scribe"
    language?: string
}

export interface STTResult {
    text: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

const FAL_STT_MODELS = {
    "whisper": "fal-ai/whisper",
    "scribe": "fal-ai/elevenlabs/scribe",
}

/**
 * Transcribe audio to text using Fal.AI Whisper or ElevenLabs Scribe
 */
export async function transcribeAudio(
    options: STTOptions
): Promise<STTResult> {
    const modelId = options.model || "whisper"
    const endpoint = FAL_STT_MODELS[modelId] || FAL_STT_MODELS["whisper"]

    if (!FAL_KEY) {
        return { text: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`📝 [STT] Transcribing with ${modelId}...`)

        const input: Record<string, unknown> = {
            audio_url: options.audioUrl,
        }
        if (options.language) {
            input.language = options.language
        }

        const result = await fal.subscribe(endpoint, { input, logs: true })

        const text = (result.data as { text?: string, transcription?: string })?.text
            || (result.data as { transcription?: string })?.transcription

        if (!text) {
            throw new Error("No transcription in response")
        }

        console.log(`✅ [STT] Transcription complete: ${text.substring(0, 100)}...`)
        return { text, requestId: result.requestId, status: "completed" }
    } catch (error) {
        console.error(`❌ [STT] Error:`, error)
        return { text: "", requestId: "", status: "failed", error: error instanceof Error ? error.message : "STT failed" }
    }
}

// ============================================================================
// Phase 2: Premium Video Upscaler (Topaz)
// ============================================================================

export interface PremiumUpscaleOptions {
    videoUrl: string
    model?: "topaz" | "seedvr" | "flashvsr" | "standard"
    scale?: 2 | 4
}

export interface PremiumUpscaleResult {
    videoUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

const FAL_UPSCALE_MODELS = {
    "topaz": "fal-ai/topaz/upscale/video",       // Premium quality
    "seedvr": "fal-ai/seedvr/upscale/video",     // ByteDance tech
    "flashvsr": "fal-ai/flashvsr",               // Fast real-time
    "standard": "fal-ai/video-upscaler",         // Basic
}

/**
 * Premium Video Upscaling with Topaz Labs quality
 */
export async function upscaleVideoPremium(
    options: PremiumUpscaleOptions
): Promise<PremiumUpscaleResult> {
    const modelId = options.model || "topaz"
    const endpoint = FAL_UPSCALE_MODELS[modelId] || FAL_UPSCALE_MODELS["standard"]

    if (!FAL_KEY) {
        return { videoUrl: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`📈 [Upscale Premium] Starting ${modelId} upscale...`)
        console.log(`   Source: ${options.videoUrl.substring(0, 80)}...`)
        console.log(`   Scale: ${options.scale || 2}x`)

        const input: Record<string, unknown> = {
            video_url: options.videoUrl,
            scale: options.scale || 2,
        }

        const result = await fal.subscribe(endpoint, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                console.log(`🔄 [Upscale] ${modelId} status: ${update.status}`)
            },
        })

        const videoUrl = (result.data as { video?: { url: string } })?.video?.url

        if (!videoUrl) {
            throw new Error("No video URL in upscale response")
        }

        console.log(`✅ [Upscale Premium] Complete!`)
        return { videoUrl, requestId: result.requestId, status: "completed" }
    } catch (error) {
        console.error(`❌ [Upscale Premium] Error:`, error)
        return { videoUrl: "", requestId: "", status: "failed", error: error instanceof Error ? error.message : "Upscale failed" }
    }
}

// ============================================================================
// Phase 2: Storyboard Utilities (FFmpeg)
// ============================================================================

export interface MergeVideosOptions {
    videoUrls: string[]               // Array of video URLs to merge
}

export interface MergeAudioVideoOptions {
    videoUrl: string
    audioUrl: string
}

export interface MergeResult {
    resultUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

/**
 * Merge multiple videos into one using Fal.AI FFmpeg
 */
export async function mergeVideos(
    options: MergeVideosOptions
): Promise<MergeResult> {
    if (!FAL_KEY) {
        return { resultUrl: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`🎬 [Merge] Combining ${options.videoUrls.length} videos...`)

        const result = await fal.subscribe("fal-ai/ffmpeg-api/merge-videos", {
            input: { video_urls: options.videoUrls },
            logs: true,
        })

        const resultUrl = (result.data as { video?: { url: string } })?.video?.url

        if (!resultUrl) {
            throw new Error("No merged video URL in response")
        }

        console.log(`✅ [Merge] Videos combined successfully!`)
        return { resultUrl, requestId: result.requestId, status: "completed" }
    } catch (error) {
        console.error(`❌ [Merge] Error:`, error)
        return { resultUrl: "", requestId: "", status: "failed", error: error instanceof Error ? error.message : "Merge failed" }
    }
}

/**
 * Merge audio track onto video using Fal.AI FFmpeg
 */
export async function mergeAudioWithVideo(
    options: MergeAudioVideoOptions
): Promise<MergeResult> {
    if (!FAL_KEY) {
        return { resultUrl: "", requestId: "", status: "failed", error: "API key not configured" }
    }

    try {
        console.log(`🔊 [Audio Merge] Adding audio to video...`)

        const result = await fal.subscribe("fal-ai/ffmpeg-api/merge-audio-video", {
            input: {
                video_url: options.videoUrl,
                audio_url: options.audioUrl,
            },
            logs: true,
        })

        const resultUrl = (result.data as { video?: { url: string } })?.video?.url

        if (!resultUrl) {
            throw new Error("No merged video URL in response")
        }

        console.log(`✅ [Audio Merge] Audio added successfully!`)
        return { resultUrl, requestId: result.requestId, status: "completed" }
    } catch (error) {
        console.error(`❌ [Audio Merge] Error:`, error)
        return { resultUrl: "", requestId: "", status: "failed", error: error instanceof Error ? error.message : "Audio merge failed" }
    }
}

// ============================================================================
// Talking Head / Lip Sync Generation (SadTalker via Fal.ai)
// ============================================================================

export interface TalkingHeadOptions {
    sourceImageUrl: string     // Portrait image URL or base64
    drivenAudioUrl: string     // Audio URL or base64
    expressionScale?: number   // 0-3, default 1.0
    preprocess?: "crop" | "extcrop" | "resize" | "full" | "extfull"
    stillMode?: boolean        // Reduce head motion, keep facial animation
    enhanceFace?: boolean      // Use GFPGAN enhancement
}

export interface TalkingHeadResult {
    videoUrl: string
    requestId: string
    status: "completed" | "failed"
    error?: string
}

/**
 * Generate talking head video using Fal.ai SadTalker
 * Transforms static portrait + audio into lip-synced video
 */
export async function generateTalkingHead(
    options: TalkingHeadOptions
): Promise<TalkingHeadResult> {
    try {
        if (!FAL_KEY) {
            throw new Error("FAL_KEY not configured")
        }

        console.log(`🎤 [Talking Head] Generating with SadTalker...`)
        console.log(`   Image: ${options.sourceImageUrl.substring(0, 50)}...`)
        console.log(`   Expression Scale: ${options.expressionScale || 1.0}`)
        console.log(`   Still Mode: ${options.stillMode || false}`)

        const result = await fal.subscribe("fal-ai/sadtalker", {
            input: {
                source_image_url: options.sourceImageUrl,
                driven_audio_url: options.drivenAudioUrl,
                expression_scale: options.expressionScale || 1.0,
                preprocess: options.preprocess || "crop",
                still_mode: options.stillMode || false,
                face_enhancer: options.enhanceFace ? "gfpgan" : undefined,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(`   ⏳ Processing SadTalker...`)
                }
            },
        })

        const videoUrl = (result.data as { video?: { url: string } })?.video?.url

        if (!videoUrl) {
            throw new Error("No video URL in SadTalker response")
        }

        console.log(`✅ [Talking Head] Video generated successfully!`)
        return {
            videoUrl,
            requestId: result.requestId,
            status: "completed",
        }
    } catch (error) {
        console.error(`❌ [Talking Head] Error:`, error)
        return {
            videoUrl: "",
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Talking head generation failed",
        }
    }
}

// ============================================================================
// Virtual Try-on (FASHN VTON)
// ============================================================================

export interface VirtualTryOnOptions {
    modelImageUrl: string       // Full body photo of person
    garmentImageUrl: string     // Photo of clothing item
    garmentType?: "auto" | "tops" | "bottoms" | "one-pieces"  // Garment category
    mode?: "performance" | "balanced" | "quality"  // Quality vs speed tradeoff
    numSamples?: number         // Number of results (1-4)
    seed?: number               // Reproducibility seed
}

export interface VirtualTryOnResult {
    imageUrls: string[]         // Array of generated images
    requestId: string
    status: "completed" | "failed"
    error?: string
}

/**
 * Generate Virtual Try-on using FASHN VTON v1.6
 * Model: fashn-ai/tryon/v1.6
 * Cost: ~$0.075 per generation
 */
export async function generateVirtualTryOn(
    options: VirtualTryOnOptions
): Promise<VirtualTryOnResult> {
    try {
        if (!FAL_KEY) {
            throw new Error("FAL_KEY not configured")
        }

        console.log(`👕 [Virtual Try-on] Starting FASHN VTON...`)
        console.log(`   Model Image: ${options.modelImageUrl.substring(0, 50)}...`)
        console.log(`   Garment Image: ${options.garmentImageUrl.substring(0, 50)}...`)
        console.log(`   Garment Type: ${options.garmentType || "auto"}`)


        // Helper to handle base64 upload if needed
        const ensureUrl = async (input: string): Promise<string> => {
            if (input.startsWith("data:image")) {
                console.log(`   📤 Uploading base64 image to Fal storage...`)
                try {
                    // Convert base64 to blob
                    const response = await fetch(input)
                    const blob = await response.blob()
                    // Upload to Fal storage
                    const url = await fal.storage.upload(blob)
                    return url
                } catch (e) {
                    console.error("Failed to upload base64 to Fal storage", e)
                    // Fallback: try sending base64 directly (some endpoints accept it)
                    return input
                }
            }
            return input
        }

        const modelImageUrl = await ensureUrl(options.modelImageUrl)
        const garmentImageUrl = await ensureUrl(options.garmentImageUrl)

        const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
            input: {
                model_image: modelImageUrl,
                garment_image: garmentImageUrl,
                category: options.garmentType || "auto",
                mode: options.mode || "balanced",
                garment_photo_type: "auto",
                num_samples: Math.min(Math.max(options.numSamples || 1, 1), 4), // Clamp 1-4
                ...(options.seed !== undefined && { seed: options.seed }),
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(`   ⏳ Processing VTON...`)
                }
            },
        })

        // API v1.5 returns images array
        const images = (result.data as { images?: Array<{ url: string }> })?.images
        const imageUrls = images?.map(img => img.url) || []

        if (imageUrls.length === 0) {
            console.error(`❌ [Virtual Try-on] Response data:`, JSON.stringify(result.data))
            throw new Error("No image URL in FASHN VTON response")
        }

        console.log(`✅ [Virtual Try-on] Generated ${imageUrls.length} image(s) successfully!`)
        return {
            imageUrls,
            requestId: result.requestId,
            status: "completed",
        }
    } catch (error) {
        console.error(`❌ [Virtual Try-on] Error:`, error)
        // Log detailed validation error info
        if (error && typeof error === 'object' && 'body' in error) {
            const body = (error as { body?: { detail?: unknown[] } }).body
            if (body?.detail) {
                console.error(`❌ [Virtual Try-on] Validation details:`, JSON.stringify(body.detail, null, 2))
            }
        }
        return {
            imageUrls: [],
            requestId: "",
            status: "failed",
            error: error instanceof Error ? error.message : "Virtual try-on failed",
        }
    }
}
