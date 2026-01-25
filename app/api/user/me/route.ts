import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        id: "user_123",
        name: "Indie Hacker",
        email: "admin@phovideo.com",
        credits: 888, // Số credits để hiển thị trên App
        plan: "Pro"
    });
}
