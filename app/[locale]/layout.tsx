import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "../globals.css"

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: "swap",
    variable: "--font-inter",
})

const outfit = Outfit({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-outfit",
})

export const metadata: Metadata = {
    title: "Pho Video - Premium AI Video Generation",
    description: "Turn ideas into cinematic masterpieces with AI. Powered by Kling 2.6, Wan 2.6 and LTX-Video.",
    keywords: ["AI video", "video generation", "text to video", "Kling", "Wan", "LTX-Video", "Pho Video"],
    authors: [{ name: "Pho Video Team" }],
    openGraph: {
        title: "Pho Video - AI Video Generation",
        description: "Turn ideas into cinematic masterpieces with AI",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Pho Video - AI Video Generation",
        description: "Turn ideas into cinematic masterpieces with AI",
    },
}

export default async function RootLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <ClerkProvider>
            <html lang={locale} className="dark">
                <head>
                    <meta name="theme-color" content="#0A0A0A" />
                </head>
                <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground bg-background`}>
                    <NextIntlClientProvider messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
