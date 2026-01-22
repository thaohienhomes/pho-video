const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const importFilePath = path.join(__dirname, '../../data/civitai_import.json');
const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');
const publicIdeasDir = path.join(__dirname, '../../public/ideas');

if (!fs.existsSync(publicIdeasDir)) {
    fs.mkdirSync(publicIdeasDir, { recursive: true });
}

async function downloadImage(url, dest) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(dest, buffer);
        console.log(`✅ Downloaded: ${path.basename(dest)}`);
    } catch (error) {
        console.error(`❌ Failed to download ${url}: ${error.message}`);
        return false;
    }
    return true;
}

function generateId() {
    return 'civitai-' + crypto.randomBytes(4).toString('hex');
}

function getTitleFromPrompt(prompt) {
    if (!prompt) return "Untitled Community Art";
    const words = prompt.split(' ');
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
}

async function ingest() {
    if (!fs.existsSync(importFilePath)) {
        console.error("❌ Import file not found: data/civitai_import.json");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(importFilePath, 'utf-8'));
    console.log(`🔍 Found ${rawData.length} items to process.`);

    // 1. Identify items to keep (non-civitai) vs those to replace
    const content = fs.readFileSync(ideasFilePath, 'utf-8');
    const arrayMatch = content.match(/export const IDEAS = (\[[\s\S]*?\]);/);
    if (!arrayMatch) {
        console.error("❌ Could not find IDEAS array in ideas.ts");
        return;
    }

    // Parse existing ideas
    const currentIdeas = eval(arrayMatch[1]);

    // SMART RESET: We will remove all 'civitai-' items. 
    // So we only deduplicate against the ones we ARE KEEPING (gen-, etc.)
    const keptIdeas = currentIdeas.filter(i => !i.id.startsWith('civitai-'));
    console.log(`🧹 Smart Reset Prepared: Will replace old community items. Keeping ${keptIdeas.length} permanent items.`);

    const existingPrompts = new Set(keptIdeas.map(i => i.prompt.toLowerCase().trim()));

    const newIdeas = [];
    let skippedCount = 0;
    const batchPrompts = new Set(); // Track prompts within this batch to avoid internal duplicates

    for (const item of rawData) {
        const prompt = (item.prompt || "").trim();
        const lowPrompt = prompt.toLowerCase();

        // Use ID from import if reasonable, else generate
        const processingId = item.id || generateId();

        // 2. Performance-safe Deduplication
        // We skip if:
        // - It's a duplicate of a PERMANENT item
        // - OR it's a duplicate WITHIN the same batch (unless it's a generic placeholder)
        const isGeneric = !prompt || lowPrompt === "no prompt found" || prompt.length < 10;

        if (!isGeneric) {
            if (existingPrompts.has(lowPrompt) || batchPrompts.has(lowPrompt)) {
                console.log(`⏩ Skipping: Duplicate prompt found ("${prompt.substring(0, 30)}...")`);
                skippedCount++;
                continue;
            }
            batchPrompts.add(lowPrompt);
        }

        const imageUrl = item.thumbnail || item.url || item.thumbnailUrl;
        if (!imageUrl) {
            console.warn(`⚠️ Skipping item - No image URL found.`);
            continue;
        }

        const id = generateId();
        const fileName = `${id}.jpg`;
        const localPath = path.join(publicIdeasDir, fileName);

        // 3. Only download if truly new
        const success = await downloadImage(imageUrl, localPath);

        if (success) {
            newIdeas.push({
                id: processingId,
                title: item.title || getTitleFromPrompt(prompt),
                thumbnail: `/ideas/${fileName}`,
                videoUrl: item.videoPreview || 'https://cdn.openai.com/tmp/placeholder.mp4',
                videoPreview: item.videoPreview || '',
                prompt: prompt || "Cinematic AI motion masterpiece",
                modelId: 'kling-2.6-pro',
                aspectRatio: item.aspectRatio || '16:9',
                stylePreset: 'cinematic',
                category: item.category || 'Community',
                views: Math.floor(Math.random() * 2000) + 500,
                likes: Math.floor(Math.random() * 500) + 100,
                cost: 10,
                tags: item.tags || ["Community", "Curated"]
            });
        }
    }

    if (newIdeas.length === 0) {
        console.log(`\n✅ No new unique ideas found. (Skipped ${skippedCount} duplicates)`);
        fs.writeFileSync(importFilePath, '[]');
        return;
    }

    try {
        const mergedIdeas = [...keptIdeas, ...newIdeas];
        const updatedContent = content.replace(arrayMatch[1], JSON.stringify(mergedIdeas, null, 4));
        fs.writeFileSync(ideasFilePath, updatedContent);

        console.log(`\n🚀 Success! Database refreshed. Added ${newIdeas.length} new high-quality videos.`);

        // Cleanup import file
        fs.writeFileSync(importFilePath, '[]');
        console.log("🧹 Cleared data/civitai_import.json");

    } catch (e) {
        console.error("❌ Failed to merge ideas:", e.message);
    }
}

ingest();
