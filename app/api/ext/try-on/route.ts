import { NextRequest, NextResponse } from "next/server"
import { generateVirtualTryOn, VirtualTryOnOptions } from "@/lib/api-services"

// CORS headers for Chrome Extension
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            modelImageUrl,
            garmentImageUrl,
            garmentType = "auto",
            mode = "balanced",
        } = body as {
            modelImageUrl: string
            garmentImageUrl: string
            garmentType?: VirtualTryOnOptions["garmentType"]
            mode?: VirtualTryOnOptions["mode"]
        }

        // Validate
        if (!modelImageUrl) {
            return NextResponse.json(
                { error: "Model image URL is required" },
                { status: 400, headers: corsHeaders }
            )
        }
        if (!garmentImageUrl) {
            return NextResponse.json(
                { error: "Garment image URL is required" },
                { status: 400, headers: corsHeaders }
            )
        }

        console.log(`👕 [Extension Try-on] Generating...`)
        console.log(`   Model type: ${modelImageUrl.startsWith("data:") ? "BASE64" : "URL"}`)
        console.log(`   Model preview: ${modelImageUrl.substring(0, 80)}...`)
        console.log(`   Garment type: ${garmentImageUrl.startsWith("data:") ? "BASE64" : "URL"}`)
        console.log(`   Garment preview: ${garmentImageUrl.substring(0, 80)}...`)

        // Generate virtual try-on (1 sample for extension)
        console.log(`   🔄 Calling generateVirtualTryOn...`)
        const result = await generateVirtualTryOn({
            modelImageUrl,
            garmentImageUrl,
            garmentType,
            mode,
            numSamples: 1,
        })
        console.log(`   📤 Result status: ${result.status}`)

        if (result.status === "failed") {
            return NextResponse.json(
                { error: result.error || "Virtual try-on generation failed" },
                { status: 500, headers: corsHeaders }
            )
        }

        console.log(`✅ [Extension Try-on] Success!`)

        return NextResponse.json(
            {
                success: true,
                imageUrl: result.imageUrls?.[0],
                imageUrls: result.imageUrls,
                requestId: result.requestId,
            },
            { headers: corsHeaders }
        )
    } catch (error) {
        console.error("❌ [Extension Try-on] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500, headers: corsHeaders }
        )
    }
}
