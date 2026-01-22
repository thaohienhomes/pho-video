const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = withNextIntl(nextConfig)
