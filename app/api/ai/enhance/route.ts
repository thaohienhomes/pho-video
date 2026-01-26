import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { enhancePrompt } from "@/lib/api-services"

// Dev bypass token for mobile testing (remove in production)
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN || "dev_bypass_token"

export async function POST(request: NextRequest) {
    try {
        // Check for dev bypass token (for mobile app testing)
        const authHeader = request.headers.get("authorization")
        const hasDevToken = authHeader === `Bearer ${DEV_BYPASS_TOKEN}`

        // If no dev bypass token, check Clerk authentication
        if (!hasDevToken) {
            const { userId } = await auth()
            if (!userId) {
                return NextResponse.json(
                    { error: "Unauthorized. Please sign in." },
                    { status: 401 }
                )
            }
        }

        // Parse request body
        const body = await request.json()
        const { prompt } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: "Missing or invalid required field: prompt" },
                { status: 400 }
            )
        }

        // Perform enhancement
        const result = await enhancePrompt(prompt)

        return NextResponse.json({
            enhancedPrompt: result.enhancedPrompt,
            status: "success"
        })

    } catch (error: any) {
        console.error("❌ [Enhance API] Error:", error)
        return NextResponse.json(
            { error: error?.message || "Failed to enhance prompt" },
            { status: 500 }
        )
    }
}
