const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CATEGORIES = [
    { name: 'Nature', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=nature' },
    { name: 'Advertising', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=commercial' },
    { name: '3D', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=3d+render' },
    { name: 'Artistic', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=art' },
    { name: 'Lifestyle', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=lifestyle' },
    { name: 'Action', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=action' },
    { name: 'Fashion', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month&tag=fashion' },
    { name: 'General', url: 'https://civitai.com/videos?sort=Most+Reactions&timePeriod=Month' }
];

const CONFIG = {
    limitPerCategory: 5,
    outputFile: path.join(__dirname, '../../data/civitai_import.json'),
    delay: 3000 // 3 seconds between requests
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function mine() {
    console.log('🚀 Launching Civitai Multi-Category Auto-Miner...');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    const results = [];

    try {
        for (const category of CATEGORIES) {
            console.log(`\n📂 Category: ${category.name}`);
            console.log(`🌐 Navigating to: ${category.url}`);

            try {
                await page.goto(category.url, { waitUntil: 'networkidle2', timeout: 60000 });
                await page.waitForSelector('a[href^="/images/"]', { timeout: 60000 });

                // Extract potential video links from the list
                const videoLinks = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a[href^="/images/"]'))
                        .map(a => a.href)
                        .filter(href => !href.includes('/posts/'));
                    return [...new Set(links)];
                });

                console.log(`🔍 Found ${videoLinks.length} potential links. Hunting for 5 valid videos...`);

                let foundInCategory = 0;
                for (let i = 0; i < videoLinks.length && foundInCategory < CONFIG.limitPerCategory; i++) {
                    const link = videoLinks[i];
                    console.log(`   [${foundInCategory + 1}/${CONFIG.limitPerCategory}] Checking: ${link}`);

                    try {
                        await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
                        await page.waitForSelector('video, .mantine-Text-root', { timeout: 20000 });

                        const data = await page.evaluate((categoryName) => {
                            try {
                                // 1. Check NSFW (Fail-Safe)
                                const nsfwKeywords = ['nsfw', 'porn', 'nudity', 'x-rated', 'hentai', 'sexy', 'erotic'];
                                const pageText = document.body.innerText.toLowerCase();
                                const isNSFW = nsfwKeywords.some(keyword => pageText.includes(keyword)) ||
                                    !!document.querySelector('.mantine-Badge-root[data-color="red"]'); // Red badges often indicate NSFW on Civitai

                                if (isNSFW) return null;

                                // 2. Get Prompt
                                let promptText = "No prompt found";
                                const metaElements = document.querySelectorAll('.mantine-Text-root');
                                for (let el of metaElements) {
                                    if (el.innerText.length > 50 && el.innerText.includes(',')) {
                                        promptText = el.innerText;
                                        break;
                                    }
                                }

                                const cleanPrompt = promptText
                                    .replace(/<lora:[^>]+>/g, '')
                                    .replace(/\(([^)]+):[\d\.]+\)/g, '$1')
                                    .replace(/\s+/g, ' ')
                                    .trim();

                                // 3. Robust Video Detection
                                let videoUrl = "";
                                let posterUrl = "";

                                // JSON-LD
                                const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
                                for (const script of jsonLdScripts) {
                                    try {
                                        const json = JSON.parse(script.innerText);
                                        if (json['@type'] === 'VideoObject' || json['@type'] === 'ImageObject') {
                                            if (json.contentUrl) videoUrl = json.contentUrl;
                                            if (json.thumbnailUrl) posterUrl = json.thumbnailUrl;
                                            if (videoUrl) break;
                                        }
                                    } catch (e) { }
                                }

                                // Meta Tags
                                if (!videoUrl) {
                                    const metaVideo = document.querySelector('meta[property="og:video"]') ||
                                        document.querySelector('meta[property="og:video:url"]') ||
                                        document.querySelector('meta[property="og:video:secure_url"]') ||
                                        document.querySelector('meta[name="twitter:player:stream"]');
                                    if (metaVideo) videoUrl = metaVideo.content;
                                }

                                // Video Element
                                if (!videoUrl) {
                                    const videoEl = document.querySelector('video');
                                    if (videoEl) {
                                        videoUrl = videoEl.currentSrc || videoEl.src;
                                        if (!videoUrl || videoUrl.startsWith('blob:')) {
                                            const source = videoEl.querySelector('source');
                                            if (source) videoUrl = source.src;
                                        }
                                        posterUrl = posterUrl || videoEl.poster;
                                    }
                                }

                                if (!videoUrl || videoUrl.startsWith('blob:')) return null;

                                // Fallback Thumbnail
                                if (!posterUrl) {
                                    const metaImage = document.querySelector('meta[property="og:image"]');
                                    posterUrl = metaImage ? metaImage.content : "";
                                }

                                return {
                                    id: 'civitai-' + Math.random().toString(36).substr(2, 9),
                                    title: categoryName + " Scene",
                                    prompt: cleanPrompt,
                                    thumbnail: posterUrl,
                                    videoPreview: videoUrl,
                                    author: "Community Artist",
                                    source: "Civitai",
                                    category: categoryName,
                                    tags: ["Community", "Auto-Mined", categoryName],
                                    credits: 10
                                };
                            } catch (e) { return null; }
                        }, category.name);

                        if (data) {
                            results.push(data);
                            foundInCategory++;
                            console.log(`      ✅ Found: ${data.prompt.substring(0, 30)}...`);
                        } else {
                            console.log('      ⚠️ Item skipped (NSFW or No Video).');
                        }

                    } catch (err) {
                        console.error(`      ❌ Error checking ${link}:`, err.message);
                    }

                    await sleep(CONFIG.delay);
                }
            } catch (err) {
                console.error(`❌ Failed to process category ${category.name}:`, err.message);
            }
        }

        // Save Results
        if (results.length > 0) {
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
            console.log(`\n🎉 Mining complete! Total saved: ${results.length} items across all categories.`);
        } else {
            console.log('\n❌ No data collected.');
        }

    } catch (err) {
        console.error('💥 Critical breakdown:', err.message);
    } finally {
        console.log('👋 Closing browser...');
        await browser.close();
    }
}

mine();
