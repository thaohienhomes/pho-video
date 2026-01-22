"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import {
    Globe,
    Bell,
    Palette,
    Trash2,
    AlertTriangle,
    Check,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const { user } = useUser()
    const pathname = usePathname()
    const router = useRouter()
    const isVietnamese = pathname.includes("/vi/")
    const currentLocale = pathname.split("/")[1] || "en"

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Settings state
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [marketingEmails, setMarketingEmails] = useState(false)
    const [defaultQuality, setDefaultQuality] = useState("1080p")

    const handleLanguageChange = (locale: string) => {
        const newPath = pathname.replace(`/${currentLocale}/`, `/${locale}/`)
        router.push(newPath)
    }

    const handleSave = async () => {
        setSaving(true)
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {isVietnamese ? "Cài Đặt" : "Settings"}
                </h1>
                <p className="text-white/60 mt-1">
                    {isVietnamese
                        ? "Quản lý preferences và cài đặt tài khoản"
                        : "Manage your preferences and account settings"
                    }
                </p>
            </div>

            {/* Language Settings */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">
                            {isVietnamese ? "Ngôn Ngữ" : "Language"}
                        </h3>
                        <p className="text-white/60 text-sm mt-1">
                            {isVietnamese
                                ? "Chọn ngôn ngữ hiển thị cho ứng dụng"
                                : "Select your preferred display language"
                            }
                        </p>
                    </div>
                    <Select value={currentLocale} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10">
                            <SelectItem value="en" className="text-white hover:bg-white/10">
                                🇺🇸 English
                            </SelectItem>
                            <SelectItem value="vi" className="text-white hover:bg-white/10">
                                🇻🇳 Tiếng Việt
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">
                            {isVietnamese ? "Thông Báo" : "Notifications"}
                        </h3>
                        <p className="text-white/60 text-sm">
                            {isVietnamese
                                ? "Quản lý cách bạn nhận thông báo"
                                : "Manage how you receive notifications"
                            }
                        </p>
                    </div>
                </div>

                <div className="space-y-4 pl-14">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm">
                                {isVietnamese ? "Email thông báo" : "Email Notifications"}
                            </p>
                            <p className="text-white/40 text-xs">
                                {isVietnamese
                                    ? "Nhận thông báo khi video hoàn thành"
                                    : "Get notified when your video is ready"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm">
                                {isVietnamese ? "Email marketing" : "Marketing Emails"}
                            </p>
                            <p className="text-white/40 text-xs">
                                {isVietnamese
                                    ? "Nhận tin tức và ưu đãi đặc biệt"
                                    : "Receive news and special offers"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={marketingEmails}
                            onCheckedChange={setMarketingEmails}
                        />
                    </div>
                </div>
            </div>

            {/* Default Settings */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">
                            {isVietnamese ? "Chất Lượng Mặc Định" : "Default Quality"}
                        </h3>
                        <p className="text-white/60 text-sm mt-1">
                            {isVietnamese
                                ? "Độ phân giải mặc định cho video xuất ra"
                                : "Default resolution for exported videos"
                            }
                        </p>
                    </div>
                    <Select value={defaultQuality} onValueChange={setDefaultQuality}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-white/10">
                            <SelectItem value="720p" className="text-white hover:bg-white/10">
                                720p
                            </SelectItem>
                            <SelectItem value="1080p" className="text-white hover:bg-white/10">
                                1080p HD
                            </SelectItem>
                            <SelectItem value="4k" className="text-white hover:bg-white/10">
                                4K Ultra HD
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#F0421C] hover:bg-[#D93A18] gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <Check className="w-4 h-4" />
                    ) : null}
                    {saved
                        ? (isVietnamese ? "Đã lưu!" : "Saved!")
                        : (isVietnamese ? "Lưu thay đổi" : "Save Changes")
                    }
                </Button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-red-400 font-medium">
                            {isVietnamese ? "Vùng Nguy Hiểm" : "Danger Zone"}
                        </h3>
                        <p className="text-white/60 text-sm mt-1">
                            {isVietnamese
                                ? "Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn."
                                : "This action cannot be undone. All data will be permanently deleted."
                            }
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isVietnamese ? "Xóa Tài Khoản" : "Delete Account"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1A1A1A] border-white/10">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">
                                    {isVietnamese ? "Bạn chắc chắn không?" : "Are you sure?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                    {isVietnamese
                                        ? "Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Bạn sẽ mất tất cả video, lịch sử và Phở Points."
                                        : "This will permanently delete your account and all your data. You will lose all videos, history, and Phở Points."
                                    }
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                    {isVietnamese ? "Hủy" : "Cancel"}
                                </AlertDialogCancel>
                                <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white">
                                    {isVietnamese ? "Xóa Tài Khoản" : "Delete Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
