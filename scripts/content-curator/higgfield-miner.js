/**
 * Higgsfield.ai Content Miner v2
 * 
 * Two-phase approach:
 * 1. Scrape community page to collect project URLs
 * 2. Visit each project page to extract video + prompt
 * 
 * Usage: node scripts/content-curator/higgfield-miner.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    communityUrl: 'https://higgsfield.ai/community',
    maxProjects: 10, // Testing with 10 projects first
    scrollAttempts: 3,
    scrollDelay: 2000,
    pageDelay: 2000, // Delay between project pages
    videoWait: 5000, // Wait for video to load
    outputFile: path.join(__dirname, '../../data/higgfield_import.json'),
    headless: false, // Keep visible for debugging
    timeout: 60000
};

// Category mapping based on keywords in prompt/title
const CATEGORY_KEYWORDS = {
    'E-commerce': ['product', 'commercial', 'advertisement', 'ad', 'brand', 'marketing', 'sale'],
    'Fashion': ['fashion', 'style', 'outfit', 'model', 'runway', 'clothing', 'dress'],
    'Action': ['action', 'fight', 'battle', 'explosion', 'chase', 'sport', 'motion', 'wrestling'],
    'Social Media': ['tiktok', 'viral', 'meme', 'trend', 'influencer', 'shorts'],
    'Cinematic': ['cinematic', 'film', 'movie', 'trailer', 'dramatic', 'epic', 'hollywood']
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function categorizeByContent(title, prompt) {
    const text = `${title} ${prompt}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => text.includes(kw))) {
            return category;
        }
    }
    return 'Cinematic'; // Default category
}

async function collectProjectUrls(page) {
    console.log('📂 Collecting project URLs from community page...');
    console.log(`🌐 URL: ${CONFIG.communityUrl}\n`);

    await page.goto(CONFIG.communityUrl, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
    });

    await sleep(3000);

    // Scroll to load more projects
    let previousCount = 0;
    for (let i = 0; i < CONFIG.scrollAttempts; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(CONFIG.scrollDelay);

        const currentCount = await page.evaluate(() => {
            return document.querySelectorAll('a[href*="/project/"]').length;
        });

        console.log(`   Scroll ${i + 1}/${CONFIG.scrollAttempts} - Found ${currentCount} project links`);

        if (currentCount >= CONFIG.maxProjects || currentCount === previousCount) {
            break;
        }
        previousCount = currentCount;
    }

    // Extract unique project URLs
    const projectUrls = await page.evaluate((max) => {
        const links = Array.from(document.querySelectorAll('a[href*="/project/"]'));
        const urls = links
            .map(a => a.href)
            .filter(href => href.includes('/project/') && !href.includes('/submit'));

        // Deduplicate
        const unique = [...new Set(urls)];
        return unique.slice(0, max);
    }, CONFIG.maxProjects);

    console.log(`\n✅ Found ${projectUrls.length} unique project URLs\n`);
    return projectUrls;
}

async function scrapeProjectPage(page, url, index, total) {
    console.log(`\n[${index + 1}/${total}] Scraping: ${url}`);

    let capturedVideoUrl = null;

    try {
        // Set up network interception to capture video URLs
        await page.setRequestInterception(true);
        const videoUrls = [];

        const requestHandler = (request) => {
            const reqUrl = request.url();
            // Capture .mp4 or video URLs from CDN
            if (reqUrl.includes('.mp4') ||
                reqUrl.includes('cdn.higgsfield') ||
                reqUrl.includes('static.higgsfield') ||
                (reqUrl.includes('video') && !reqUrl.includes('.js'))) {
                console.log(`   📹 Network video: ${reqUrl.substring(0, 80)}...`);
                videoUrls.push(reqUrl);
            }
            request.continue();
        };

        page.on('request', requestHandler);

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.timeout
        });

        // Wait for video element to potentially load
        console.log(`   ⏳ Waiting for video element...`);
        try {
            await page.waitForSelector('video', { timeout: 8000 });
        } catch (e) {
            console.log(`   ⚠️ No video element found`);
        }

        await sleep(CONFIG.videoWait);

        // Remove listener
        page.off('request', requestHandler);
        await page.setRequestInterception(false);

        // If we captured video from network
        if (videoUrls.length > 0) {
            // Filter to prefer .mp4 from CDN
            const mp4Url = videoUrls.find(u => u.includes('.mp4') && !u.includes('blob:'));
            capturedVideoUrl = mp4Url || videoUrls[0];
            console.log(`   🎬 Captured from network: ${capturedVideoUrl.substring(0, 60)}...`);
        }

        const data = await page.evaluate(() => {
            // Get title from H1 or og:title
            let title = '';
            const h1 = document.querySelector('h1');
            if (h1) title = h1.innerText.trim();
            if (!title) {
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle) title = ogTitle.content;
            }

            // Get prompt/description - og:description is the most reliable
            let prompt = '';
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc && ogDesc.content) {
                prompt = ogDesc.content;
            }

            // Fallback to meta description
            if (!prompt) {
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) prompt = metaDesc.content;
            }

            // Get video URL from DOM
            let videoUrl = '';
            let thumbnail = '';

            // 1. Check og:video
            const ogVideo = document.querySelector('meta[property="og:video"]') ||
                document.querySelector('meta[property="og:video:url"]') ||
                document.querySelector('meta[property="og:video:secure_url"]');
            if (ogVideo && ogVideo.content) {
                videoUrl = ogVideo.content;
            }

            // 2. Check video elements
            if (!videoUrl) {
                const videos = document.querySelectorAll('video');
                for (const video of videos) {
                    // Get poster as thumbnail
                    if (video.poster && !thumbnail) {
                        thumbnail = video.poster;
                    }

                    // Try source element
                    const source = video.querySelector('source');
                    if (source && source.src && !source.src.startsWith('blob:')) {
                        videoUrl = source.src;
                    }

                    // Try video.src directly
                    if (!videoUrl && video.src && !video.src.startsWith('blob:')) {
                        videoUrl = video.src;
                    }

                    // Try currentSrc
                    if (!videoUrl && video.currentSrc && !video.currentSrc.startsWith('blob:')) {
                        videoUrl = video.currentSrc;
                    }

                    if (videoUrl) break;
                }
            }

            // 3. Get thumbnail from og:image
            if (!thumbnail) {
                const ogImage = document.querySelector('meta[property="og:image"]');
                if (ogImage && ogImage.content) {
                    thumbnail = ogImage.content;
                }
            }

            // Debug: Log all video elements found
            const videoInfo = [];
            document.querySelectorAll('video').forEach((v, i) => {
                videoInfo.push({
                    index: i,
                    src: v.src || 'none',
                    currentSrc: v.currentSrc || 'none',
                    poster: v.poster || 'none',
                    sources: Array.from(v.querySelectorAll('source')).map(s => s.src)
                });
            });

            return { title, prompt, videoUrl, thumbnail, videoInfo };
        });

        console.log(`   📄 Title: ${data.title}`);
        console.log(`   📝 Prompt: ${data.prompt?.substring(0, 60)}...`);
        console.log(`   🎥 DOM Video: ${data.videoUrl || 'not found'}`);
        console.log(`   🖼️ Thumbnail: ${data.thumbnail || 'not found'}`);
        console.log(`   📊 Video elements:`, JSON.stringify(data.videoInfo).substring(0, 200));

        // Use network-captured URL if DOM didn't find one
        const finalVideoUrl = data.videoUrl || capturedVideoUrl;

        // Validate data
        if (!data.prompt || data.prompt.length < 15) {
            console.log(`   ⏩ Skipped: No valid prompt`);
            return null;
        }

        if (!finalVideoUrl) {
            console.log(`   ⏩ Skipped: No video URL found`);
            return null;
        }

        const category = categorizeByContent(data.title, data.prompt);

        console.log(`   ✅ SUCCESS: [${category}]`);

        return {
            id: 'higgsfield-' + Date.now() + '-' + index,
            title: data.title || 'Higgsfield Creation',
            prompt: data.prompt,
            videoUrl: finalVideoUrl,
            thumbnail: data.thumbnail || '',
            category: category,
            source: 'Higgsfield.ai',
            sourceUrl: url
        };

    } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        // Clean up interception on error
        try {
            await page.setRequestInterception(false);
        } catch (e) { }
        return null;
    }
}


async function mine() {
    console.log('🚀 Launching Higgsfield.ai Content Miner v2');
    console.log('📊 Strategy: Collect project URLs → Scrape individual pages');
    console.log(`📁 Output: ${CONFIG.outputFile}\n`);

    const browser = await puppeteer.launch({
        headless: CONFIG.headless,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized', '--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    const results = [];

    try {
        // Phase 1: Collect project URLs
        const projectUrls = await collectProjectUrls(page);

        if (projectUrls.length === 0) {
            console.log('❌ No project URLs found!');
            fs.writeFileSync(CONFIG.outputFile, '[]');
            return;
        }

        // Phase 2: Scrape each project page
        console.log('📄 Scraping individual project pages...\n');

        for (let i = 0; i < projectUrls.length; i++) {
            const data = await scrapeProjectPage(page, projectUrls[i], i, projectUrls.length);

            if (data) {
                results.push(data);
            }

            // Small delay between pages
            if (i < projectUrls.length - 1) {
                await sleep(CONFIG.pageDelay);
            }
        }

        // Save results
        if (results.length > 0) {
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));

            console.log(`\n🎉 Mining complete!`);
            console.log(`📊 Total videos collected: ${results.length}`);
            console.log(`📁 Saved to: ${CONFIG.outputFile}`);

            // Category breakdown
            console.log('\n📋 By category:');
            const summary = {};
            results.forEach(v => {
                summary[v.category] = (summary[v.category] || 0) + 1;
            });
            Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
                console.log(`   ${cat}: ${count}`);
            });
        } else {
            console.log('\n⚠️ No videos collected. Check the site structure.');
            fs.writeFileSync(CONFIG.outputFile, '[]');
        }

    } catch (err) {
        console.error('💥 Critical error:', err.message);
        fs.writeFileSync(CONFIG.outputFile, '[]');
    } finally {
        console.log('\n👋 Closing browser...');
        await browser.close();
    }
}

mine().catch(console.error);
