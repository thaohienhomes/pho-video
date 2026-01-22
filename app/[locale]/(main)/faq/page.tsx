"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import {
    ChevronDown,
    HelpCircle,
    CreditCard,
    Zap,
    Settings,
    Video
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// FAQ Data
const FAQ_CATEGORIES = [
    {
        id: "pricing",
        title: "Pricing & Billing",
        titleVi: "Giá Cả & Thanh Toán",
        icon: CreditCard,
        questions: [
            {
                q: "How do Phở Points work?",
                qVi: "Phở Points hoạt động như thế nào?",
                a: "Phở Points are our universal credit system. Each AI model costs a specific number of points per generation. Points are allocated monthly based on your subscription tier and reset at the start of each billing cycle.",
                aVi: "Phở Points là hệ thống tín dụng thống nhất của chúng tôi. Mỗi model AI có chi phí cụ thể tính bằng điểm cho mỗi lần tạo. Điểm được phân bổ hàng tháng dựa trên gói đăng ký và được đặt lại vào đầu mỗi chu kỳ thanh toán."
            },
            {
                q: "When do my points reset?",
                qVi: "Khi nào điểm của tôi được đặt lại?",
                a: "Your Phở Points reset on the first day of each billing cycle. Unused points do not roll over to the next month.",
                aVi: "Phở Points của bạn được đặt lại vào ngày đầu tiên của mỗi chu kỳ thanh toán. Điểm chưa sử dụng không được chuyển sang tháng tiếp theo."
            },
            {
                q: "Can I get a refund?",
                qVi: "Tôi có thể được hoàn tiền không?",
                a: "We offer a 7-day money-back guarantee for first-time subscribers. After that, you can cancel anytime but refunds are not provided for partial months.",
                aVi: "Chúng tôi cung cấp đảm bảo hoàn tiền 7 ngày cho người đăng ký lần đầu. Sau đó, bạn có thể hủy bất cứ lúc nào nhưng không hoàn tiền cho các tháng chưa hoàn tất."
            },
            {
                q: "How do I upgrade or downgrade my plan?",
                qVi: "Làm thế nào để nâng cấp hoặc hạ cấp gói?",
                a: "You can change your plan anytime from Account > Subscription. Upgrades take effect immediately with prorated charges. Downgrades take effect at the next billing cycle.",
                aVi: "Bạn có thể thay đổi gói bất cứ lúc nào từ Tài khoản > Đăng ký. Nâng cấp có hiệu lực ngay lập tức với phí tính theo tỷ lệ. Hạ cấp có hiệu lực vào chu kỳ thanh toán tiếp theo."
            },
            {
                q: "What payment methods are accepted?",
                qVi: "Chấp nhận phương thức thanh toán nào?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans in Vietnam.",
                aVi: "Chúng tôi chấp nhận tất cả thẻ tín dụng chính (Visa, Mastercard, American Express), PayPal và chuyển khoản ngân hàng cho gói năm tại Việt Nam."
            }
        ]
    },
    {
        id: "generation",
        title: "Video Generation",
        titleVi: "Tạo Video",
        icon: Video,
        questions: [
            {
                q: "What is the maximum video duration?",
                qVi: "Thời lượng video tối đa là bao nhiêu?",
                a: "Video duration depends on your plan: Free (5s), Starter (10s), Creator (20s), Pro (unlimited). Some models may have their own limits regardless of your plan.",
                aVi: "Thời lượng video phụ thuộc vào gói của bạn: Miễn phí (5 giây), Khởi đầu (10 giây), Sáng tạo (20 giây), Chuyên nghiệp (không giới hạn). Một số model có thể có giới hạn riêng."
            },
            {
                q: "What video formats are supported?",
                qVi: "Hỗ trợ định dạng video nào?",
                a: "All generated videos are exported in MP4 format with H.264 encoding. Resolutions available are 720p, 1080p, and 4K (Pro plan only).",
                aVi: "Tất cả video được tạo đều xuất ra định dạng MP4 với mã hóa H.264. Độ phân giải có sẵn là 720p, 1080p và 4K (chỉ gói Pro)."
            },
            {
                q: "Why did my generation fail?",
                qVi: "Tại sao việc tạo video của tôi thất bại?",
                a: "Generation can fail due to: content policy violations, server overload, or invalid prompts. You are not charged points for failed generations. Try simplifying your prompt or contact support if the issue persists.",
                aVi: "Việc tạo video có thể thất bại do: vi phạm chính sách nội dung, quá tải máy chủ hoặc prompts không hợp lệ. Bạn không bị tính điểm cho các lần tạo thất bại. Hãy thử đơn giản hóa prompt hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn."
            },
            {
                q: "Can I use the videos commercially?",
                qVi: "Tôi có thể sử dụng video cho mục đích thương mại không?",
                a: "Yes! All paid plans include full commercial rights. Free plan videos have a watermark and limited commercial use.",
                aVi: "Có! Tất cả các gói trả phí đều bao gồm đầy đủ quyền thương mại. Video gói miễn phí có watermark và giới hạn sử dụng thương mại."
            }
        ]
    },
    {
        id: "technical",
        title: "Technical",
        titleVi: "Kỹ Thuật",
        icon: Zap,
        questions: [
            {
                q: "Is there an API available?",
                qVi: "Có API không?",
                a: "Yes, API access is available for Pro plan subscribers. Visit Account > Settings > API Keys to generate your API key. Documentation is available at docs.pho.video.",
                aVi: "Có, truy cập API dành cho người đăng ký gói Pro. Truy cập Tài khoản > Cài đặt > API Keys để tạo khóa API. Tài liệu có sẵn tại docs.pho.video."
            },
            {
                q: "What are the rate limits?",
                qVi: "Giới hạn tốc độ là gì?",
                a: "Rate limits depend on your plan: Free (3/day), Starter (50/day), Creator (200/day), Pro (unlimited). Concurrent generation limit is 3 for all plans.",
                aVi: "Giới hạn tốc độ phụ thuộc vào gói: Miễn phí (3/ngày), Khởi đầu (50/ngày), Sáng tạo (200/ngày), Chuyên nghiệp (không giới hạn). Giới hạn tạo đồng thời là 3 cho tất cả các gói."
            },
            {
                q: "How long is my data stored?",
                qVi: "Dữ liệu của tôi được lưu trữ bao lâu?",
                a: "Generated videos are stored for 30 days. You can download them anytime within this period. After 30 days, videos are automatically deleted. Pro users get extended storage (90 days).",
                aVi: "Video được tạo lưu trữ 30 ngày. Bạn có thể tải xuống bất cứ lúc nào trong thời gian này. Sau 30 ngày, video tự động bị xóa. Người dùng Pro được lưu trữ mở rộng (90 ngày)."
            }
        ]
    },
    {
        id: "account",
        title: "Account",
        titleVi: "Tài Khoản",
        icon: Settings,
        questions: [
            {
                q: "How do I cancel my subscription?",
                qVi: "Làm thế nào để hủy đăng ký?",
                a: "Go to Account > Subscription > Manage Billing. You can cancel anytime. Your access continues until the end of the current billing period.",
                aVi: "Vào Tài khoản > Đăng ký > Quản lý thanh toán. Bạn có thể hủy bất cứ lúc nào. Quyền truy cập tiếp tục cho đến cuối chu kỳ thanh toán hiện tại."
            },
            {
                q: "How do I delete my account?",
                qVi: "Làm thế nào để xóa tài khoản?",
                a: "Go to Account > Settings > Danger Zone > Delete Account. This action is irreversible and will permanently delete all your data, videos, and generation history.",
                aVi: "Vào Tài khoản > Cài đặt > Vùng nguy hiểm > Xóa tài khoản. Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn tất cả dữ liệu, video và lịch sử tạo của bạn."
            },
            {
                q: "Can I transfer my account to someone else?",
                qVi: "Tôi có thể chuyển tài khoản cho người khác không?",
                a: "Account transfers are not supported. Each account is tied to a unique email address. You can invite team members on Business plans (coming soon).",
                aVi: "Không hỗ trợ chuyển tài khoản. Mỗi tài khoản gắn liền với một địa chỉ email duy nhất. Bạn có thể mời thành viên nhóm trên gói Doanh nghiệp (sắp ra mắt)."
            }
        ]
    }
]

function FAQItem({
    question,
    answer,
    isOpen,
    onToggle
}: {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className="text-white font-medium pr-4 group-hover:text-[#F0421C] transition-colors">
                    {question}
                </span>
                <ChevronDown className={cn(
                    "w-5 h-5 text-white/40 flex-shrink-0 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-96 pb-4" : "max-h-0"
            )}>
                <p className="text-white/60 leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    )
}

export default function FAQPage() {
    const pathname = usePathname()
    const isVietnamese = pathname.includes("/vi/")
    const locale = pathname.split("/")[1] || "en"

    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

    const toggleItem = (categoryId: string, questionIndex: number) => {
        const key = `${categoryId}-${questionIndex}`
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="flex-1 overflow-y-auto relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F0421C]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F0421C]/10 flex items-center justify-center">
                        <HelpCircle className="w-8 h-8 text-[#F0421C]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        {isVietnamese ? "Câu Hỏi Thường Gặp" : "Frequently Asked Questions"}
                    </h1>
                    <p className="text-white/60 mt-2 max-w-xl mx-auto">
                        {isVietnamese
                            ? "Tìm câu trả lời cho các câu hỏi phổ biến về Phở Video"
                            : "Find answers to common questions about Phở Video"
                        }
                    </p>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-6">
                    {FAQ_CATEGORIES.map((category) => {
                        const CategoryIcon = category.icon

                        return (
                            <div
                                key={category.id}
                                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Category Header */}
                                <div className="flex items-center gap-3 p-5 border-b border-white/10 bg-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-[#F0421C]/10 flex items-center justify-center">
                                        <CategoryIcon className="w-5 h-5 text-[#F0421C]" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {isVietnamese ? category.titleVi : category.title}
                                    </h2>
                                </div>

                                {/* Questions */}
                                <div className="px-5">
                                    {category.questions.map((item, index) => (
                                        <FAQItem
                                            key={index}
                                            question={isVietnamese ? item.qVi : item.q}
                                            answer={isVietnamese ? item.aVi : item.a}
                                            isOpen={openItems[`${category.id}-${index}`] || false}
                                            onToggle={() => toggleItem(category.id, index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-r from-[#F0421C]/10 to-orange-500/10 border border-[#F0421C]/20 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {isVietnamese ? "Vẫn cần hỗ trợ?" : "Still need help?"}
                    </h3>
                    <p className="text-white/60 mb-4">
                        {isVietnamese
                            ? "Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn"
                            : "Our support team is always ready to help you"
                        }
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="mailto:support@pho.video">
                            <Button className="bg-[#F0421C] hover:bg-[#D93A18]">
                                {isVietnamese ? "Liên Hệ Hỗ Trợ" : "Contact Support"}
                            </Button>
                        </a>
                        <Link href={`/${locale}/account`}>
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                {isVietnamese ? "Quay lại Tài Khoản" : "Back to Account"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
