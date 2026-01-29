"use client"

import { useState, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
    title: string
    icon?: ReactNode
    defaultOpen?: boolean
    children: ReactNode
    className?: string
    badge?: string
}

export function CollapsibleSection({
    title,
    icon,
    defaultOpen = false,
    children,
    className,
    badge,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={cn("border-t border-white/5", className)}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-3 px-1 cursor-pointer group"
            >
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="text-white/50 group-hover:text-white/70 transition-colors">
                            {icon}
                        </span>
                    )}
                    <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                        {title}
                    </span>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                            {badge}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-white/50 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 space-y-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Simple toggle for switches
interface CollapsibleToggleProps {
    label: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
    icon?: ReactNode
}

export function CollapsibleToggle({
    label,
    description,
    checked,
    onChange,
    icon,
}: CollapsibleToggleProps) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer",
                checked
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/5 border-white/10 hover:border-white/20"
            )}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <span className={cn(
                        "transition-colors",
                        checked ? "text-primary" : "text-white/50"
                    )}>
                        {icon}
                    </span>
                )}
                <div className="text-left">
                    <p className="text-sm font-medium text-white">{label}</p>
                    {description && (
                        <p className="text-xs text-white/50">{description}</p>
                    )}
                </div>
            </div>

            {/* Toggle Switch */}
            <div className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                checked ? "bg-primary" : "bg-white/20"
            )}>
                <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ left: checked ? 20 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
        </button>
    )
}
