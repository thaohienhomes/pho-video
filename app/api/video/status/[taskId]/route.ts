import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    // In a real application, you would use the taskId to fetch the actual status from your database.
    // const { taskId } = params;

    // Mock Logic for Mobile App UI Testing
    // We return a "success" status immediately to stop the infinite loading spinner.

    return NextResponse.json({
        status: 'success',
        progress: 100,
        // Using a reliable public MP4 for testing video playback
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        // High-quality placeholder image for the thumbnail
        thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
        duration: 10,
        width: 1280,
        height: 720
    });
}
