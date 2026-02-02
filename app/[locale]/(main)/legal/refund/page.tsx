"use client"

import { useTranslations } from "next-intl"
import { RefreshCw, CreditCard, AlertTriangle, CheckCircle, XCircle, Mail } from "lucide-react"

export default function RefundPolicyPage() {
    const t = useTranslations("legal")

    return (
        <article className="prose prose-invert prose-lg max-w-none">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 not-prose">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <RefreshCw className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Refund Policy</h1>
                    <p className="text-sm text-gray-500">Last updated: February 2, 2026</p>
                </div>
            </div>

            {/* Introduction */}
            <section className="mb-10">
                <p className="text-gray-300 leading-relaxed">
                    At Phở Video, we strive to provide a reliable and high-quality AI video generation service. This Refund Policy outlines when and how you may be eligible for a refund.
                </p>
            </section>

            {/* Quick Overview Cards */}
            <section className="mb-10 not-prose">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Overview</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                        <h3 className="font-semibold text-green-300 text-sm">Eligible for Refund</h3>
                        <ul className="text-xs text-green-200 mt-2 space-y-1">
                            <li>• Failed generations (auto-refunded)</li>
                            <li>• Service outages we caused</li>
                            <li>• Unused subscription (within 7 days)</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
                        <h3 className="font-semibold text-yellow-300 text-sm">Case-by-Case</h3>
                        <ul className="text-xs text-yellow-200 mt-2 space-y-1">
                            <li>• Quality disputes</li>
                            <li>• Accidental purchases</li>
                            <li>• Technical issues on your end</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <XCircle className="w-6 h-6 text-red-400 mb-2" />
                        <h3 className="font-semibold text-red-300 text-sm">Not Eligible</h3>
                        <ul className="text-xs text-red-200 mt-2 space-y-1">
                            <li>• Points already used</li>
                            <li>• Dissatisfaction with AI output</li>
                            <li>• Policy violations</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 1 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">1.</span> Phở Points Refunds
                </h2>

                <h3 className="text-lg font-medium text-white mt-6">1.1 Automatic Refunds (Point Restoration)</h3>
                <p className="text-gray-300">
                    Phở Points are automatically refunded to your account in these situations:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Failed Generations:</strong> If our AI fails to generate your video or image, the points are automatically restored to your balance within a few minutes.</li>
                    <li><strong>Server Errors:</strong> Any generation that fails due to server-side errors will be automatically refunded.</li>
                    <li><strong>Timeout Errors:</strong> If a generation times out before completion, points are restored.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">1.2 Non-Refundable Use Cases</h3>
                <p className="text-gray-300">
                    Points are <strong>NOT</strong> refundable in these situations:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Successful Generations:</strong> If the AI successfully generates content (even if you don&apos;t like the result), points are considered used.</li>
                    <li><strong>Subjective Dissatisfaction:</strong> AI outputs are probabilistic. We cannot guarantee specific results, and dissatisfaction with creative output is not grounds for refund.</li>
                    <li><strong>Prompt Issues:</strong> If your prompt violates our content policy and is rejected, no refund is provided.</li>
                    <li><strong>User Error:</strong> Points spent on unintended settings (wrong model, duration, etc.) are not refundable.</li>
                </ul>

                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 not-prose">
                    <p className="text-sm text-blue-300">
                        <strong>💡 Tip:</strong> Use the &quot;Preview&quot; feature with Phở Instant (cheapest model) to test prompts before using premium models.
                    </p>
                </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    2. Subscription Refunds
                </h2>

                <h3 className="text-lg font-medium text-white mt-6">2.1 7-Day Satisfaction Guarantee (New Subscribers)</h3>
                <p className="text-gray-300">
                    If you are a <strong>first-time subscriber</strong>, you may request a full refund within 7 days of your initial subscription purchase, provided:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li>You have not used more than 20% of your monthly point allocation.</li>
                    <li>This is your first subscription with Phở Video (not available for re-subscriptions).</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">2.2 Mid-Cycle Cancellations</h3>
                <p className="text-gray-300">
                    If you cancel your subscription mid-cycle:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li>You will <strong>not</strong> receive a prorated refund.</li>
                    <li>You will retain access to your subscription benefits until the end of your current billing period.</li>
                    <li>Unused points will roll over for 30 days after your subscription ends.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">2.3 Annual Subscriptions</h3>
                <ul className="text-gray-300 space-y-2">
                    <li>Annual subscriptions are eligible for refund within 14 days of purchase if less than 10% of total annual points have been used.</li>
                    <li>After 14 days, annual subscriptions are non-refundable.</li>
                </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">3.</span> Credit Pack Refunds
                </h2>
                <p className="text-gray-300">
                    One-time credit pack purchases are <strong>generally non-refundable</strong> as they are considered consumed upon purchase. However, we may consider refunds in exceptional circumstances:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Accidental Duplicate Purchase:</strong> If you accidentally purchased the same pack twice within a short period, contact us within 24 hours.</li>
                    <li><strong>Technical Payment Issue:</strong> If you were charged but credits were not added to your account.</li>
                </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">4.</span> How to Request a Refund
                </h2>
                <ol className="text-gray-300 space-y-3 list-decimal list-inside">
                    <li>
                        <strong>Email Us:</strong> Send a refund request to{" "}
                        <a href="mailto:billing@pho.video" className="text-primary hover:underline">billing@pho.video</a>
                    </li>
                    <li>
                        <strong>Include Details:</strong> Your account email, transaction date, amount, and reason for the refund request.
                    </li>
                    <li>
                        <strong>Wait for Review:</strong> We will review your request within 3-5 business days.
                    </li>
                    <li>
                        <strong>Receive Decision:</strong> If approved, refunds are processed to your original payment method within 5-10 business days.
                    </li>
                </ol>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">5.</span> Service Credits (Alternative to Refunds)
                </h2>
                <p className="text-gray-300">
                    In some cases, instead of a monetary refund, we may offer:
                </p>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Bonus Phở Points:</strong> Additional points added to your account as compensation.</li>
                    <li><strong>Subscription Extension:</strong> Extra days added to your current subscription.</li>
                    <li><strong>Priority Support:</strong> Access to expedited support for technical issues.</li>
                </ul>
                <p className="text-gray-300 mt-3">
                    These alternatives may be offered at our discretion based on the nature of your issue.
                </p>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">6.</span> Chargebacks & Disputes
                </h2>
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 not-prose">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-300 font-medium">Warning</p>
                            <p className="text-sm text-red-200 mt-1">
                                Filing a chargeback or payment dispute without first contacting us may result in <strong>immediate account termination</strong> and forfeiture of all remaining Phở Points.
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-gray-300 mt-4">
                    We encourage you to contact our support team first. We are committed to resolving issues fairly and promptly.
                </p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="text-amber-400">7.</span> Changes to This Policy
                </h2>
                <p className="text-gray-300">
                    We may update this Refund Policy from time to time. Changes will be posted on this page with an updated revision date. Material changes will be communicated via email.
                </p>
            </section>

            {/* Contact Section */}
            <section className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Need Help?</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                    For refund requests or billing questions:
                </p>
                <div className="space-y-2">
                    <a href="mailto:billing@pho.video" className="text-amber-400 hover:underline text-sm block">
                        📧 billing@pho.video
                    </a>
                    <p className="text-gray-500 text-xs">
                        Response time: 1-2 business days
                    </p>
                </div>
            </section>
        </article>
    )
}
