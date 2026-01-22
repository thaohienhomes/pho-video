"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const handleLocaleChange = (newLocale: string) => {
        // Construct the new path by replacing the locale part
        const segments = pathname.split('/')
        segments[1] = newLocale
        const newPath = segments.join('/')
        router.push(newPath)
    }

    return (
        <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="w-auto gap-2 bg-black/20 hover:bg-white/5 border-white/5 h-9 text-xs font-bold rounded-full transition-all">
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10 rounded-xl">
                    <SelectItem value="en" className="text-xs font-semibold focus:bg-vermilion/20 focus:text-white transition-colors">English</SelectItem>
                    <SelectItem value="vi" className="text-xs font-semibold focus:bg-vermilion/20 focus:text-white transition-colors">Tiếng Việt</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
