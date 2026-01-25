import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, controlImage, controlType } = body;

        console.log("🔥 [Backend] Nhận yêu cầu tạo video:", {
            prompt,
            hasControlImage: !!controlImage,
            controlType
        });

        // Giả lập độ trễ mạng (2 giây)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Trả về kết quả thành công giả (Mock)
        return NextResponse.json({
            taskId: "task_" + Date.now(),
            status: "pending",
            message: "Đang khởi tạo video...",
            config: { controlType, hasReference: !!controlImage }
        });
    } catch (error) {
        return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
    }
}
