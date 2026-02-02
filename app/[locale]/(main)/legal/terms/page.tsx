"use client"

import { useTranslations } from "next-intl"
import { FileText, Shield, Scale, AlertCircle, Mail } from "lucide-react"

export default function TermsOfServicePage() {
    const t = useTranslations("legal")

    return (
        <article className="prose prose-invert prose-lg max-w-none">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 not-prose">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Terms of Service</h1>
                    <p className="text-sm text-gray-500">Last updated: February 2, 2026</p>
                </div>
            </div>

            {/* Introduction */}
            <section className="mb-10">
                <p className="text-gray-300 leading-relaxed">
                    Welcome to Phở Video (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our AI-powered video generation platform, including our website, applications, and services (collectively, the &quot;Service&quot;).
                </p>
                <p className="text-gray-300 leading-relaxed">
                    By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
                </p>
            </section>

            {/* Section 1 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">1.</span> Account Registration
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li>You must be at least 18 years old to create an account and use our Service.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You agree to provide accurate, current, and complete information during registration.</li>
                    <li>You are solely responsible for all activities that occur under your account.</li>
                </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">2.</span> Phở Points & Payment
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Phở Points</strong> are our internal currency used to access AI generation features.</li>
                    <li>Points are non-transferable, non-refundable (except as specified in our Refund Policy), and have no cash value.</li>
                    <li>Subscription plans provide monthly point allocations. Unused points roll over for 30 days after your billing cycle ends.</li>
                    <li>Credit pack purchases are one-time transactions. Points from credit packs never expire while your account remains active.</li>
                    <li>We reserve the right to modify pricing, point costs, and features with reasonable notice.</li>
                </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">3.</span> Acceptable Use Policy
                </h2>
                <p className="text-gray-300 mb-4">You agree NOT to use our Service to:</p>
                <ul className="text-gray-300 space-y-2">
                    <li>Generate content that is illegal, harmful, threatening, abusive, defamatory, or violates any third-party rights.</li>
                    <li>Create deepfakes, non-consensual intimate imagery, or content depicting minors in any inappropriate context.</li>
                    <li>Generate content that infringes copyrights, trademarks, or intellectual property rights of others.</li>
                    <li>Produce misleading political content, disinformation, or content intended to deceive or manipulate.</li>
                    <li>Attempt to reverse-engineer, decompile, or extract our AI models or algorithms.</li>
                    <li>Circumvent technical measures designed to control access to or protect the Service.</li>
                    <li>Use automated scripts, bots, or tools to access the Service without our written permission.</li>
                </ul>
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 not-prose">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">
                            <strong>Violation of these policies may result in immediate account termination</strong> without refund of any remaining Phở Points.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">4.</span> Intellectual Property
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Your Content:</strong> You retain ownership of your input prompts and source images. You grant us a license to process this content solely to provide the Service.</li>
                    <li><strong>Generated Content:</strong> Subject to these Terms, you own the AI-generated videos and images created using your account. You may use them for personal or commercial purposes.</li>
                    <li><strong>Our Platform:</strong> The Service, including AI models, algorithms, software, branding, and design, remains our exclusive property.</li>
                    <li><strong>Attribution:</strong> Free tier users must include our watermark on generated content. Paid users may remove the watermark per their subscription tier.</li>
                </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">5.</span> Disclaimer of Warranties
                </h2>
                <p className="text-gray-300">
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-gray-300 mt-3">
                    We do not guarantee that AI-generated content will meet your specific requirements, be error-free, or produce consistent results. AI outputs are probabilistic and may vary.
                </p>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">6.</span> Limitation of Liability
                </h2>
                <p className="text-gray-300">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="text-gray-300 mt-3">
                    Our total liability shall not exceed the amount you paid for the Service during the 12 months preceding the claim.
                </p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">7.</span> Termination
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li>You may cancel your account at any time through your account settings.</li>
                    <li>We may suspend or terminate your access if you violate these Terms.</li>
                    <li>Upon termination, your right to use the Service ceases immediately, and any remaining Phở Points are forfeited.</li>
                </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">8.</span> Changes to Terms
                </h2>
                <p className="text-gray-300">
                    We may update these Terms from time to time. If we make material changes, we will notify you via email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
                </p>
            </section>

            {/* Section 9 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">9.</span> Governing Law
                </h2>
                <p className="text-gray-300">
                    These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
            </section>

            {/* Contact Section */}
            <section className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-white">Contact Us</h3>
                </div>
                <p className="text-gray-400 text-sm">
                    If you have any questions about these Terms of Service, please contact us at:
                </p>
                <a href="mailto:legal@pho.video" className="text-primary hover:underline text-sm mt-2 inline-block">
                    legal@pho.video
                </a>
            </section>
        </article>
    )
}
