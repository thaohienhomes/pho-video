import { IDEAS } from '@/data/ideas';
import { IdeasGrid } from '@/components/IdeasGrid';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Wand2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata: Metadata = {
    title: 'Ideas Gallery | Phở Video',
    description: 'Explore and remix high-quality AI video generations.',
};

export default function IdeasPage() {
    const t = useTranslations('Ideas');

    return (
        <main className="h-full overflow-y-auto bg-[#0A0A0A] pt-12 pb-20 relative">
            {/* Language Switcher (Top Right) */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSwitcher />
            </div>

            {/* Hero Section */}
            <section className="relative px-6 mb-16 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F0421C]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Wand2 className="w-4 h-4 text-[#F0421C]" />
                        <span className="text-sm font-medium text-white/80">Inspiration Library</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                        {t.rich('title', {
                            span: (chunks) => <span className="text-[#F0421C]">{chunks}</span>
                        })}
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="px-6 max-w-[1600px] mx-auto">
                <IdeasGrid initialIdeas={IDEAS} />
            </section>
        </main>
    );
}
