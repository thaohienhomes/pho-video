import { NextResponse } from 'next/server';

export async function GET() {
    // Trả về dữ liệu giả để Gallery hiển thị
    const mockVideos = [
        {
            id: "v1",
            thumbnailUrl: "https://images.unsplash.com/photo-1533903345306-15d1c30952de", // Ảnh demo đẹp
            prompt: "Cyberpunk city at night",
            status: "ready",
            duration: 10,
            model: "Kling AI"
        },
        {
            id: "v2",
            thumbnailUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
            prompt: "Cute cat astronaut",
            status: "ready", // Fixed: Always ready to avoid infinite spinner complaint
            duration: 5,
            model: "Luma"
        },
        {
            id: "v3",
            thumbnailUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0",
            prompt: "Abstract colorful fluid",
            status: "ready",
            duration: 8,
            model: "Runway"
        }
    ];

    return NextResponse.json(mockVideos);
}
