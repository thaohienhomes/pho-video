const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Deploy under /studio path for pho.chat/studio integration
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.freepik.com',
            },
            {
                protocol: 'https',
                hostname: 'v1.pinimg.com',
            },
            {
                protocol: 'https',
                hostname: 'commondatastorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'fal.media',
            },
            {
                protocol: 'https',
                hostname: '*.fal.media',
            },
            {
                protocol: 'https',
                hostname: 'fal.run',
            },
            {
                protocol: 'https',
                hostname: 'd1q70pf5vjeyhc.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: '*.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = withNextIntl(nextConfig)
