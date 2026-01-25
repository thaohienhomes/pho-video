import { NextRequest, NextResponse } from "next/server"
import { IDEAS } from "@/data/ideas"

export const dynamic = 'force-dynamic'
/**
 * GET /api/ideas
 * 
 * Exposes the IDEAS data to React Native mobile app.
 * Supports pagination and returns absolute asset URLs.
 * 
 * Query Params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 * - category: Optional category filter
 */

// Helper to make URLs absolute for mobile app
function makeAbsoluteUrl(relativeUrl: string | undefined): string {
    if (!relativeUrl) return ""

    // Already absolute
    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
        return relativeUrl
    }

    // Get base URL (for LAN access, use env or fallback)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
        "http://localhost:3000"

    // Ensure relative URL starts with /
    const cleanPath = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`

    return `${baseUrl}${cleanPath}`
}

// Transform idea for mobile consumption
function transformIdeaForMobile(idea: typeof IDEAS[0]) {
    return {
        ...idea,
        // Make all media URLs absolute
        thumbnail: makeAbsoluteUrl(idea.thumbnail) || makeAbsoluteUrl(idea.videoUrl), // Fallback to video poster
        videoUrl: makeAbsoluteUrl(idea.videoUrl),
        videoPreview: makeAbsoluteUrl(idea.videoPreview),
        // Add computed fields helpful for mobile
        posterUrl: makeAbsoluteUrl(idea.thumbnail) || makeAbsoluteUrl(idea.videoUrl),
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Pagination params
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))

        // Optional filters
        const category = searchParams.get("category")

        // Filter ideas
        let filteredIdeas = [...IDEAS]

        if (category && category !== "All") {
            filteredIdeas = filteredIdeas.filter(idea =>
                idea.category.toLowerCase() === category.toLowerCase()
            )
        }

        // Calculate pagination
        const totalItems = filteredIdeas.length
        const totalPages = Math.ceil(totalItems / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit

        // Slice for current page
        const paginatedIdeas = filteredIdeas.slice(startIndex, endIndex)

        // Transform for mobile
        const mobileIdeas = paginatedIdeas.map(transformIdeaForMobile)

        // Get unique categories for filter UI
        const categories = Array.from(new Set(IDEAS.map(idea => idea.category)))

        return NextResponse.json({
            success: true,
            data: mobileIdeas,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            meta: {
                categories,
                baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            },
        })

    } catch (error) {
        console.error("[API] /api/ideas error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch ideas" },
            { status: 500 }
        )
    }
}
