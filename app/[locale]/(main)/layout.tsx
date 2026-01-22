
import { LeftRail } from "@/components/LeftRail"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full bg-[#0A0A0A] overflow-hidden">
            <LeftRail />
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden relative">
                {children}
            </main>
        </div>
    )
}
