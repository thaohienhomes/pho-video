"use client"

import { useTranslations } from "next-intl"
import { Shield, Database, Eye, Lock, Globe, Mail, Trash2 } from "lucide-react"

export default function PrivacyPolicyPage() {
    const t = useTranslations("legal")

    return (
        <article className="prose prose-invert prose-lg max-w-none">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 not-prose">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Privacy Policy</h1>
                    <p className="text-sm text-gray-500">Last updated: February 2, 2026</p>
                </div>
            </div>

            {/* Introduction */}
            <section className="mb-10">
                <p className="text-gray-300 leading-relaxed">
                    At Phở Video, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI video generation platform.
                </p>
                <p className="text-gray-300 leading-relaxed">
                    We are committed to complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
                </p>
            </section>

            {/* Section 1 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    1. Information We Collect
                </h2>

                <h3 className="text-lg font-medium text-white mt-6">1.1 Information You Provide</h3>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Account Information:</strong> Email address, name, password (hashed), and profile picture when you sign up via Clerk authentication.</li>
                    <li><strong>Payment Information:</strong> Billing address and payment method details processed through our payment provider (Polar). We do not store your full credit card number.</li>
                    <li><strong>User Content:</strong> Prompts, uploaded images, and generated videos/images you create using our Service.</li>
                    <li><strong>Communications:</strong> Messages you send to our support team.</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-6">1.2 Information Collected Automatically</h3>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Usage Data:</strong> Pages visited, features used, generation history, and interaction patterns.</li>
                    <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and IP address.</li>
                    <li><strong>Cookies:</strong> We use essential cookies for authentication and optional analytics cookies (with your consent).</li>
                </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    2. How We Use Your Information
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Provide the Service:</strong> Process your prompts, generate AI content, and deliver features you request.</li>
                    <li><strong>Account Management:</strong> Create and manage your account, process payments, and manage subscriptions.</li>
                    <li><strong>Service Improvement:</strong> Analyze usage patterns to improve our AI models and user experience (aggregated, anonymized data).</li>
                    <li><strong>Communication:</strong> Send transactional emails, service updates, and (with your consent) marketing communications.</li>
                    <li><strong>Security:</strong> Detect and prevent fraud, abuse, and policy violations.</li>
                    <li><strong>Legal Compliance:</strong> Comply with applicable laws and respond to legal requests.</li>
                </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    3. Information Sharing
                </h2>
                <p className="text-gray-300 mb-4">We do NOT sell your personal information. We may share information with:</p>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our Service:
                        <ul className="ml-6 mt-2 space-y-1">
                            <li>Clerk (Authentication)</li>
                            <li>Polar (Payments)</li>
                            <li>Fal.AI, WaveSpeedAI (AI model providers)</li>
                            <li>Vercel (Hosting)</li>
                            <li>Supabase/Neon (Database)</li>
                        </ul>
                    </li>
                    <li><strong>Legal Requirements:</strong> When required by law, subpoena, or government request.</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                    <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information.</li>
                </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    4. Data Security
                </h2>
                <p className="text-gray-300">
                    We implement industry-standard security measures to protect your information:
                </p>
                <ul className="text-gray-300 space-y-2 mt-3">
                    <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                    <li>Secure authentication via Clerk with multi-factor authentication options</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls limiting employee access to personal data</li>
                </ul>
                <p className="text-gray-300 mt-3">
                    However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-primary" />
                    5. Data Retention
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li><strong>Account Data:</strong> Retained while your account is active. Deleted within 30 days of account deletion request.</li>
                    <li><strong>Generated Content:</strong> Stored for your access until you delete it or close your account.</li>
                    <li><strong>Usage Logs:</strong> Retained for up to 12 months for analytics and security purposes.</li>
                    <li><strong>Payment Records:</strong> Retained as required by tax and accounting laws (typically 7 years).</li>
                </ul>
            </section>

            {/* Section 6 - GDPR/CCPA Rights */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>

                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 not-prose mb-4">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">🇪🇺 For EU/EEA Residents (GDPR)</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                        <li>• Right to Access: Request a copy of your personal data</li>
                        <li>• Right to Rectification: Correct inaccurate personal data</li>
                        <li>• Right to Erasure: Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                        <li>• Right to Data Portability: Receive your data in a machine-readable format</li>
                        <li>• Right to Object: Object to processing for direct marketing</li>
                        <li>• Right to Restrict Processing: Limit how we use your data</li>
                    </ul>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 not-prose">
                    <h4 className="text-sm font-semibold text-amber-300 mb-2">🇺🇸 For California Residents (CCPA)</h4>
                    <ul className="text-sm text-amber-200 space-y-1">
                        <li>• Right to Know: What personal information we collect and how we use it</li>
                        <li>• Right to Delete: Request deletion of your personal information</li>
                        <li>• Right to Opt-Out: We do not sell personal information</li>
                        <li>• Right to Non-Discrimination: Equal service regardless of privacy choices</li>
                    </ul>
                </div>

                <p className="text-gray-300 mt-4">
                    To exercise any of these rights, please contact us at <a href="mailto:privacy@pho.video" className="text-primary hover:underline">privacy@pho.video</a>. We will respond within 30 days.
                </p>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white">7. Cookies & Tracking</h2>
                <p className="text-gray-300 mb-4">We use the following types of cookies:</p>
                <table className="w-full text-sm text-gray-300 not-prose">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Purpose</th>
                            <th className="px-4 py-2 text-left">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr>
                            <td className="px-4 py-2 font-medium">Essential</td>
                            <td className="px-4 py-2">Authentication, session management</td>
                            <td className="px-4 py-2 text-green-400">Yes</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium">Analytics</td>
                            <td className="px-4 py-2">Usage patterns, feature engagement</td>
                            <td className="px-4 py-2 text-yellow-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 font-medium">Preferences</td>
                            <td className="px-4 py-2">Language, theme settings</td>
                            <td className="px-4 py-2 text-yellow-400">Optional</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-gray-300 mt-4">
                    You can control non-essential cookies through your browser settings or our cookie consent banner.
                </p>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white">8. International Transfers</h2>
                <p className="text-gray-300">
                    Your information may be transferred to and processed in countries outside your country of residence, including the United States. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses for EU data transfers.
                </p>
            </section>

            {/* Section 9 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white">9. Children&apos;s Privacy</h2>
                <p className="text-gray-300">
                    Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected data from a child, we will delete it promptly.
                </p>
            </section>

            {/* Section 10 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold text-white">10. Changes to This Policy</h2>
                <p className="text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a notice on our Service. Your continued use after changes take effect constitutes acceptance.
                </p>
            </section>

            {/* Contact Section */}
            <section className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Contact Our Privacy Team</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                    For privacy-related inquiries, data requests, or concerns:
                </p>
                <a href="mailto:privacy@pho.video" className="text-emerald-400 hover:underline text-sm">
                    privacy@pho.video
                </a>
                <p className="text-gray-500 text-xs mt-3">
                    Data Protection Officer available for EU inquiries.
                </p>
            </section>
        </article>
    )
}
