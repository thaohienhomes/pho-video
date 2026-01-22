'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PhoPointsBalance } from '@/components/PhoPointsBalance';
import {
    Check, Coins, Sparkles, Zap, Crown, Star, ArrowRight, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Pricing tiers data
const PRICING_TIERS = [
    {
        id: 'free',
        name: 'Free',
        description: 'Explore AI video generation',
        monthlyPrice: 0,
        annualPrice: 0,
        phoPoints: '50K',
        phoPointsValue: 50000,
        features: [
            '50,000 Phở Points/month',
            '5s max video duration',
            'Standard models (LTX)',
            'Watermark on exports',
            '3 daily generations',
        ],
        cta: 'Current Plan',
        popular: false,
        color: 'from-gray-500/20 to-gray-600/20',
        borderColor: 'border-gray-500/30',
        icon: Sparkles,
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'For hobbyists and creators',
        monthlyPrice: 9,
        annualPrice: 86.40,
        phoPoints: '1M',
        phoPointsValue: 1000000,
        features: [
            '1,000,000 Phở Points/month',
            '10s max video duration',
            'No watermark',
            '50 daily generations',
            'Email support',
        ],
        cta: 'Get Started',
        popular: false,
        color: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/30',
        icon: Zap,
    },
    {
        id: 'creator',
        name: 'Creator',
        description: 'For serious content creators',
        monthlyPrice: 24,
        annualPrice: 230.40,
        phoPoints: '3M',
        phoPointsValue: 3000000,
        features: [
            '3,000,000 Phở Points/month',
            '20s max video duration',
            'Pro models (Kling, LTX Pro)',
            '4K upscaling included',
            '200 daily generations',
            'Priority support',
        ],
        cta: 'Start Creating',
        popular: true,
        color: 'from-vermilion/20 to-orange-500/20',
        borderColor: 'border-vermilion/50',
        icon: Crown,
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'For professionals and teams',
        monthlyPrice: 49,
        annualPrice: 470.40,
        phoPoints: '7M',
        phoPointsValue: 7000000,
        features: [
            '7,000,000 Phở Points/month',
            'Unlimited video duration',
            'All models + early access',
            'API access',
            'Unlimited generations',
            'Dedicated support',
            'Custom branding',
        ],
        cta: 'Go Pro',
        popular: false,
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30',
        icon: Star,
    },
];

export default function PricingPage() {
    const t = useTranslations('pricing');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (tierId: string) => {
        if (tierId === 'free') return;

        setLoading(tierId);
        try {
            const res = await fetch('/api/polar/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tierId, billingCycle }),
            });

            if (res.ok) {
                const { checkoutUrl } = await res.json();
                window.location.href = checkoutUrl;
            } else {
                console.error('Failed to create checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                        <span className="font-bold text-lg">Phở Video</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <PhoPointsBalance variant="default" />
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-vermilion/10 border border-vermilion/20 rounded-full mb-6">
                        <Coins className="w-4 h-4 text-vermilion" />
                        <span className="text-sm text-vermilion font-medium">{t('system_badge')}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        {t('subtitle')}
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                billingCycle === 'monthly'
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:text-white"
                            )}
                        >
                            {t('monthly')}
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                billingCycle === 'annual'
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:text-white"
                            )}
                        >
                            {t('annual')}
                            <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                                {t('save_20')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRICING_TIERS.map((tier) => {
                        const Icon = tier.icon;
                        const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice / 12;
                        const isPopular = tier.popular;
                        const isLoading = loading === tier.id;

                        // Localized strings
                        const tierName = t(`tiers.${tier.id}`);
                        const tierDescription = t(`descriptions.${tier.id}`);
                        const ctaKey = `cta_${tier.id}` as any;
                        const ctaText = t.has(ctaKey) ? t(ctaKey) : (tier.id === 'free' ? t('current_plan') : tier.cta);

                        return (
                            <div
                                key={tier.id}
                                className={cn(
                                    "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
                                    "bg-gradient-to-b",
                                    tier.color,
                                    tier.borderColor,
                                    isPopular && "ring-2 ring-vermilion scale-105 shadow-xl shadow-vermilion/10"
                                )}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vermilion text-white text-xs font-bold rounded-full whitespace-nowrap">
                                        {t('popular_badge')}
                                    </div>
                                )}

                                {/* Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            isPopular ? "bg-vermilion/20" : "bg-white/10"
                                        )}>
                                            <Icon className={cn(
                                                "w-5 h-5",
                                                isPopular ? "text-vermilion" : "text-white"
                                            )} />
                                        </div>
                                        <h3 className="text-xl font-bold">{tierName}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">{tierDescription}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">
                                            ${price === 0 ? '0' : price.toFixed(0)}
                                        </span>
                                        {tier.monthlyPrice > 0 && (
                                            <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'mo'}</span>
                                        )}
                                    </div>
                                    {billingCycle === 'annual' && tier.annualPrice > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('billed_annually', { amount: tier.annualPrice.toFixed(0) })}
                                        </p>
                                    )}
                                </div>

                                {/* Phở Points Highlight */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 mb-6">
                                    <Coins className="w-4 h-4 text-vermilion" />
                                    <span className="text-sm font-semibold text-vermilion">{tier.phoPoints}</span>
                                    <span className="text-xs text-gray-400">{t('points_label')}</span>
                                </div>

                                {/* Features */}
                                <ul className="flex-1 space-y-3 mb-6">
                                    {tier.id === 'free' && (
                                        <>
                                            <FeatureItem text={t('features.points_per_month', { amount: '50,000' })} />
                                            <FeatureItem text={t('features.max_duration', { amount: '5' })} />
                                            <FeatureItem text={t('features.standard_models')} />
                                            <FeatureItem text={t('features.watermark')} />
                                            <FeatureItem text={t('features.daily_generations', { amount: '3' })} />
                                        </>
                                    )}
                                    {tier.id === 'starter' && (
                                        <>
                                            <FeatureItem text={t('features.points_per_month', { amount: '1,000,000' })} />
                                            <FeatureItem text={t('features.max_duration', { amount: '10' })} />
                                            <FeatureItem text={t('features.no_watermark')} />
                                            <FeatureItem text={t('features.daily_generations', { amount: '50' })} />
                                            <FeatureItem text={t('features.support_email')} />
                                        </>
                                    )}
                                    {tier.id === 'creator' && (
                                        <>
                                            <FeatureItem text={t('features.points_per_month', { amount: '3,000,000' })} />
                                            <FeatureItem text={t('features.max_duration', { amount: '20' })} />
                                            <FeatureItem text={t('features.pro_models')} />
                                            <FeatureItem text={t('features.upscaling')} />
                                            <FeatureItem text={t('features.daily_generations', { amount: '200' })} />
                                            <FeatureItem text={t('features.support_priority')} />
                                        </>
                                    )}
                                    {tier.id === 'pro' && (
                                        <>
                                            <FeatureItem text={t('features.points_per_month', { amount: '7,000,000' })} />
                                            <FeatureItem text={t('features.unlimited_duration')} />
                                            <FeatureItem text={t('features.all_models')} />
                                            <FeatureItem text={t('features.api_access')} />
                                            <FeatureItem text={t('features.unlimited_generations')} />
                                            <FeatureItem text={t('features.support_dedicated')} />
                                            <FeatureItem text={t('features.custom_branding')} />
                                        </>
                                    )}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    onClick={() => handleSubscribe(tier.id)}
                                    disabled={tier.id === 'free' || isLoading}
                                    className={cn(
                                        "w-full h-11 font-semibold transition-all",
                                        isPopular
                                            ? "bg-vermilion hover:bg-vermilion/90 text-white"
                                            : tier.id === 'free'
                                                ? "bg-white/10 text-white/50 cursor-default"
                                                : "bg-white hover:bg-white/90 text-black"
                                    )}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            {t('processing')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {ctaText}
                                            {tier.id !== 'free' && <ArrowRight className="w-4 h-4" />}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 text-center">
                    <h2 className="text-2xl font-bold mb-8">{t('faq_title')}</h2>

                    <div className="max-w-3xl mx-auto grid gap-4 text-left">
                        <FAQItem question={t('faq.q1')} answer={t('faq.a1')} />
                        <FAQItem question={t('faq.q2')} answer={t('faq.a2')} />
                        <FAQItem question={t('faq.q3')} answer={t('faq.a3')} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
                    © 2026 Phở Video. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300">{text}</span>
        </li>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="font-semibold mb-2">{question}</h3>
            <p className="text-sm text-gray-400">{answer}</p>
        </div>
    );
}
