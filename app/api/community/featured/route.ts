import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Mock data for community videos
const MOCK_VIDEOS = [
    {
        id: "1",
        title: "Cyberpunk City Night",
        prompt: "A bustling cyberpunk city at night, neon lights reflecting off wet streets, flying cars, cinematic aerial shot",
        videoUrl: "/videos/showcase_0001.mp4",
        thumbnailUrl: "/videos/showcase_0001.jpg",
        authorId: "user_1",
        authorName: "CyberCreator",
        likes: 1247,
        views: 15420,
        createdAt: "2026-01-28T10:00:00Z",
    },
    {
        id: "2",
        title: "Ocean Waves Sunset",
        prompt: "Golden hour sunset over calm ocean waves, drone shot moving forward, peaceful and serene atmosphere",
        videoUrl: "/videos/showcase_0002.mp4",
        thumbnailUrl: "/videos/showcase_0002.jpg",
        authorId: "user_2",
        authorName: "NatureFilms",
        likes: 892,
        views: 12300,
        createdAt: "2026-01-27T15:30:00Z",
    },
    {
        id: "3",
        title: "Space Station Orbit",
        prompt: "International space station orbiting Earth, stars in background, Earth visible below, cinematic slow motion",
        videoUrl: "/videos/showcase_0003.mp4",
        thumbnailUrl: "/videos/showcase_0003.jpg",
        authorId: "user_3",
        authorName: "SpaceEnthusiast",
        likes: 2105,
        views: 28700,
        createdAt: "2026-01-26T08:15:00Z",
    },
    {
        id: "4",
        title: "Ancient Temple Mystery",
        prompt: "Ancient temple hidden in jungle, morning mist, rays of light through trees, mysterious atmosphere",
        videoUrl: "/videos/showcase_0004.mp4",
        thumbnailUrl: "/videos/showcase_0004.jpg",
        authorId: "user_4",
        authorName: "ExplorerX",
        likes: 756,
        views: 9800,
        createdAt: "2026-01-25T12:00:00Z",
    },
    {
        id: "5",
        title: "Robot Dance Party",
        prompt: "Cute robots dancing in a neon club, colorful lights, fun and energetic, anime style",
        videoUrl: "/videos/showcase_0005.mp4",
        thumbnailUrl: "/videos/showcase_0005.jpg",
        authorId: "user_5",
        authorName: "AnimeArtist",
        likes: 3421,
        views: 45200,
        createdAt: "2026-01-24T18:45:00Z",
    },
    {
        id: "6",
        title: "Magical Forest",
        prompt: "Enchanted forest with glowing mushrooms, fireflies, soft moonlight, fantasy atmosphere",
        videoUrl: "/videos/showcase_0006.mp4",
        thumbnailUrl: "/videos/showcase_0006.jpg",
        authorId: "user_6",
        authorName: "FantasyCreator",
        likes: 1876,
        views: 22100,
        createdAt: "2026-01-23T09:20:00Z",
    },
]

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const tab = searchParams.get("tab") || "trending"
        const query = searchParams.get("q") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")

        // Filter by search query
        let videos = MOCK_VIDEOS
        if (query) {
            videos = videos.filter(v =>
                v.title.toLowerCase().includes(query.toLowerCase()) ||
                v.prompt.toLowerCase().includes(query.toLowerCase())
            )
        }

        // Sort based on tab
        switch (tab) {
            case "trending":
                videos = [...videos].sort((a, b) => b.likes - a.likes)
                break
            case "new":
                videos = [...videos].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                break
            case "picks":
                // Staff picks - shuffle for variety
                videos = [...videos].sort(() => Math.random() - 0.5)
                break
        }

        // Paginate
        const start = (page - 1) * limit
        const paginatedVideos = videos.slice(start, start + limit)

        return NextResponse.json({
            videos: paginatedVideos,
            hasMore: start + limit < videos.length,
            total: videos.length,
        })
    } catch (error) {
        console.error("[Community Featured] Error:", error)
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
    }
}
