"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StudioLayoutProps {
    /** Left sidebar content - controls, settings */
    sidebar: ReactNode
    /** Main stage content - video preview, results */
    mainStage: ReactNode
    /** Bottom dock content - storyboard thumbnails */
    dock?: ReactNode
    /** Show/hide dock */
    showDock?: boolean
    /** Additional className */
    className?: string
}

/**
 * StudioLayout - 3-panel layout matching mockup design
 * 
 * Layout Structure:
 * ┌──────────────────────────────────────────────────┐
 * │                    Header                         │
 * ├────────────┬─────────────────────────────────────┤
 * │   SIDEBAR  │           MAIN STAGE                │
 * │   (280px)  │           (flex-1)                  │
 * │            │                                      │
 * ├────────────┴─────────────────────────────────────┤
 * │              STORYBOARD DOCK (100px)             │
 * └──────────────────────────────────────────────────┘
 * 
 * Specs:
 * - Sidebar: 280px fixed width (--pho-sidebar-width)
 * - Main Stage: Fills remaining space
 * - Dock: 100px height, full width, glassmorphism
 */
export function StudioLayout({
    sidebar,
    mainStage,
    dock,
    showDock = true,
    className
}: StudioLayoutProps) {
    return (
        <div
            className={cn(
                "flex flex-col h-[calc(100vh-var(--header-height,64px))]",
                "bg-[var(--pho-bg-base)]",
                className
            )}
        >
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Fixed 280px */}
                <aside
                    className={cn(
                        "w-[280px] min-w-[280px] flex-shrink-0",
                        "bg-[var(--pho-bg-base)]",
                        "border-r border-[rgba(255,255,255,0.05)]",
                        "overflow-y-auto",
                        "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    )}
                >
                    <div className="p-4 space-y-4">
                        {sidebar}
                    </div>
                </aside>

                {/* Main Stage - Flexible */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto h-full">
                        {mainStage}
                    </div>
                </main>
            </div>

            {/* Bottom Dock - Full Width */}
            {showDock && dock && (
                <div
                    className={cn(
                        "h-[100px] flex-shrink-0",
                        "bg-[var(--pho-glass-light)]",
                        "backdrop-blur-[var(--pho-blur-lg)]",
                        "border-t border-[var(--pho-border-default)]",
                        "rounded-t-[var(--pho-radius-xl)]"
                    )}
                >
                    {dock}
                </div>
            )}
        </div>
    )
}

/**
 * StudioSidebar - Wrapper for sidebar sections
 */
interface StudioSidebarSectionProps {
    title?: string
    children: ReactNode
    className?: string
}

export function StudioSidebarSection({ title, children, className }: StudioSidebarSectionProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {title && (
                <h3 className="text-xs font-medium text-[var(--pho-text-muted)] uppercase tracking-wider">
                    {title}
                </h3>
            )}
            {children}
        </div>
    )
}

/**
 * StudioMainStage - Wrapper for main content area
 */
interface StudioMainStageProps {
    children: ReactNode
    emptyState?: ReactNode
    isEmpty?: boolean
    className?: string
}

export function StudioMainStage({ children, emptyState, isEmpty, className }: StudioMainStageProps) {
    if (isEmpty && emptyState) {
        return (
            <div className={cn(
                "flex items-center justify-center h-full",
                "rounded-[var(--pho-radius-xl)]",
                "bg-[var(--pho-glass-light)]",
                "border border-dashed border-[var(--pho-border-default)]",
                className
            )}>
                {emptyState}
            </div>
        )
    }

    return <div className={cn("space-y-4", className)}>{children}</div>
}
