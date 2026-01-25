import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getPhoPointsHistory } from "@/lib/pho-points/transactions";

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { clerkId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        const transactions = await getPhoPointsHistory(user.id, limit, offset);

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
