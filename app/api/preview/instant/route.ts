import { NextResponse } from "next/server"
import { headers } from "next/headers"

// ============================================================================
// Rate Limiting (In-Memory - For production use Redis)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    // Clean up old entries periodically
    if (rateLimitMap.size > 1000) {
        Array.from(rateLimitMap.entries()).forEach(([key, value]) => {
            if (value.resetTime < now) {
                rateLimitMap.delete(key)
            }
        })
    }

    if (!record || record.resetTime < now) {
        // New window
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS }
    }

    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: record.resetTime - now
        }
    }

    record.count++
    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - record.count,
        resetIn: record.resetTime - now
    }
}

// ============================================================================
// Fal.ai Fast LCM Configuration
// ============================================================================

const FAL_API_BASE = "https://queue.fal.run"
const FAL_KEY = process.env.FAL_KEY

interface FalLCMResponse {
    images: Array<{
        url: string
        width: number
        height: number
        content_type: string
    }>
    seed: number
    num_inference_steps: number
}

/**
 * Generate instant preview using Fal.ai Fast LCM Diffusion
 * This endpoint uses the synchronous API for faster response (1-3 seconds)
 */
export async function POST(request: Request) {
    try {
        // Get client IP for rate limiting
        const headersList = await headers()
        const forwardedFor = headersList.get("x-forwarded-for")
        const realIp = headersList.get("x-real-ip")
        const clientIp = forwardedFor?.split(",")[0] || realIp || "unknown"

        // Check rate limit
        const rateLimit = checkRateLimit(clientIp)
        if (!rateLimit.allowed) {
            console.log(`⚠️ [Instant Preview] Rate limit exceeded for IP: ${clientIp}`)
            return NextResponse.json(
                {
                    error: "Too many preview requests. Please wait a moment.",
                    resetIn: Math.ceil(rateLimit.resetIn / 1000)
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
                    }
                }
            )
        }

        // Parse request body
        const body = await request.json()
        const { prompt } = body

        if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
            return NextResponse.json(
                { error: "Prompt must be at least 5 characters" },
                { status: 400 }
            )
        }

        // Check API key
        if (!FAL_KEY) {
            console.warn("⚠️ FAL_KEY not configured, returning mock preview")
            return NextResponse.json({
                success: true,
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=288&fit=crop",
                cached: false,
            })
        }

        console.log(`⚡ [Instant Preview] Generating for: "${prompt.substring(0, 50)}..."`)

        // Use Fal.ai Fast LCM Diffusion (synchronous endpoint for speed)
        // Model: fal-ai/fast-lcm-diffusion - optimized for speed (~1-2 seconds)
        const response = await fetch(`${FAL_API_BASE}/fal-ai/fast-lcm-diffusion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${FAL_KEY}`,
            },
            body: JSON.stringify({
                prompt: prompt.trim(),
                image_size: {
                    width: 512,  // Low-res for speed
                    height: 288, // 16:9 aspect ratio
                },
                num_inference_steps: 4, // LCM needs very few steps
                guidance_scale: 1.0, // LCM works best with low guidance
                num_images: 1,
                enable_safety_checker: true,
                sync_mode: true, // Synchronous mode for faster response
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ [Instant Preview] Fal.ai error: ${errorText}`)

            // Try fallback model if fast-lcm fails
            return NextResponse.json(
                { error: "Preview generation failed. Try again." },
                { status: 500 }
            )
        }

        const data: FalLCMResponse = await response.json()

        if (!data.images || data.images.length === 0) {
            return NextResponse.json(
                { error: "No preview generated" },
                { status: 500 }
            )
        }

        console.log(`✅ [Instant Preview] Generated successfully`)

        return NextResponse.json({
            success: true,
            imageUrl: data.images[0].url,
            width: data.images[0].width,
            height: data.images[0].height,
            cached: false,
        }, {
            headers: {
                "X-RateLimit-Remaining": String(rateLimit.remaining),
                "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
            }
        })

    } catch (error) {
        console.error("❌ [Instant Preview] Error:", error)
        return NextResponse.json(
            { error: "Preview generation failed" },
            { status: 500 }
        )
    }
}
