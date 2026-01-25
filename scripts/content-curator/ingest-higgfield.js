/**
 * Higgfield.ai Content Ingestor
 * 
 * Processes scraped data from higgfield-miner.js and integrates it into
 * the Phở Video Ideas database (data/ideas.ts).
 * 
 * Features:
 * - Cleans up old placeholder items (gen-*, scraped-*)
 * - Downloads thumbnails to public/ideas/
 * - Deduplicates by prompt text
 * - Maps to Idea schema
 * 
 * Usage: node scripts/content-curator/ingest-higgfield.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG = {
    importFile: path.join(__dirname, '../../data/higgfield_import.json'),
    ideasFile: path.join(__dirname, '../../data/ideas.ts'),
    thumbnailDir: path.join(__dirname, '../../public/ideas'),
    // Prefixes to delete (old placeholders and old scraped items)
    deletePrefixes: ['gen-', 'scraped-', 'higgsfield-', 'higgfield-'],
    // Default values for new items
    defaults: {
        modelId: 'kling-2.6-pro',
        aspectRatio: '16:9',
        stylePreset: 'cinematic',
        cost: 10
    }
};

// Ensure thumbnail directory exists
if (!fs.existsSync(CONFIG.thumbnailDir)) {
    fs.mkdirSync(CONFIG.thumbnailDir, { recursive: true });
}

/**
 * Download an image from URL and save locally
 */
async function downloadThumbnail(url, destPath) {
    if (!url || url.startsWith('blob:')) {
        return false;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(destPath, buffer);
        console.log(`   ✅ Downloaded: ${path.basename(destPath)}`);
        return true;

    } catch (error) {
        console.error(`   ❌ Failed to download thumbnail: ${error.message}`);
        return false;
    }
}

/**
 * Generate a unique ID for new items
 */
function generateId() {
    return 'higgfield-' + crypto.randomBytes(4).toString('hex');
}

/**
 * Create a title from the prompt text
 */
function getTitleFromPrompt(prompt, category) {
    if (!prompt) return `${category} Scene`;

    // Clean and truncate prompt for title
    const cleaned = prompt
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const words = cleaned.split(' ').slice(0, 4);
    return words.join(' ') + (cleaned.split(' ').length > 4 ? '...' : '');
}

/**
 * Map category name to style preset
 */
function getStylePreset(category) {
    const mapping = {
        'E-commerce': 'advertising',
        'Fashion': 'fashion',
        'Action': 'cinematic',
        'Social Media': 'lifestyle',
        'Cinematic': 'cinematic'
    };
    return mapping[category] || 'cinematic';
}

/**
 * Generate random engagement stats
 */
function generateStats() {
    return {
        views: Math.floor(Math.random() * 3000) + 500,
        likes: Math.floor(Math.random() * 800) + 100
    };
}

/**
 * Main ingestion process
 */
async function ingest() {
    console.log('🚀 Starting Higgfield Content Ingestor...\n');

    // 1. Check import file exists
    if (!fs.existsSync(CONFIG.importFile)) {
        console.error('❌ Import file not found:', CONFIG.importFile);
        console.log('💡 Run the miner first: node scripts/content-curator/higgfield-miner.js');
        return;
    }

    // 2. Load scraped data
    const rawData = JSON.parse(fs.readFileSync(CONFIG.importFile, 'utf-8'));
    console.log(`📊 Found ${rawData.length} items to process`);

    if (rawData.length === 0) {
        console.log('⚠️ No items to ingest. Exiting.');
        return;
    }

    // 3. Load current ideas.ts
    const ideasContent = fs.readFileSync(CONFIG.ideasFile, 'utf-8');
    const arrayMatch = ideasContent.match(/export const IDEAS = (\[[\s\S]*?\]);/);

    if (!arrayMatch) {
        console.error('❌ Could not parse IDEAS array in ideas.ts');
        return;
    }

    let currentIdeas;
    try {
        currentIdeas = eval(arrayMatch[1]);
    } catch (e) {
        console.error('❌ Failed to evaluate IDEAS array:', e.message);
        return;
    }

    console.log(`📚 Current database: ${currentIdeas.length} items`);

    // 4. Clean up old placeholders
    const beforeCount = currentIdeas.length;
    const keptIdeas = currentIdeas.filter(idea => {
        const shouldDelete = CONFIG.deletePrefixes.some(prefix =>
            idea.id.startsWith(prefix)
        );
        return !shouldDelete;
    });

    const deletedCount = beforeCount - keptIdeas.length;
    console.log(`🧹 Cleaned up ${deletedCount} placeholder items (gen-*, scraped-*)`);
    console.log(`📚 Keeping ${keptIdeas.length} permanent items`);

    // 5. Build deduplication set from kept items
    const existingPrompts = new Set(
        keptIdeas.map(i => i.prompt?.toLowerCase().trim()).filter(Boolean)
    );

    // 6. Process new items
    const newIdeas = [];
    const batchPrompts = new Set(); // Track prompts in this batch
    let skipped = 0;
    let downloaded = 0;

    for (const item of rawData) {
        const prompt = (item.prompt || '').trim();
        const lowPrompt = prompt.toLowerCase();

        // Skip if no valid prompt
        if (!prompt || prompt.length < 10) {
            console.log(`   ⏩ Skipping: No valid prompt`);
            skipped++;
            continue;
        }

        // Deduplicate against existing and batch
        if (existingPrompts.has(lowPrompt) || batchPrompts.has(lowPrompt)) {
            console.log(`   ⏩ Skipping: Duplicate prompt ("${prompt.substring(0, 30)}...")`);
            skipped++;
            continue;
        }

        batchPrompts.add(lowPrompt);

        // Generate unique ID
        const id = generateId();

        // Download thumbnail if available
        let thumbnailPath = '';
        if (item.thumbnail) {
            const fileName = `${id}.jpg`;
            const localPath = path.join(CONFIG.thumbnailDir, fileName);
            const success = await downloadThumbnail(item.thumbnail, localPath);
            if (success) {
                thumbnailPath = `/ideas/${fileName}`;
                downloaded++;
            }
        }

        // Use placeholder if no thumbnail
        if (!thumbnailPath) {
            thumbnailPath = `https://placehold.co/1920x1080/101010/F0421C/png?text=${encodeURIComponent(item.category || 'Higgfield')}`;
        }

        // Build the Idea object
        const stats = generateStats();
        const newIdea = {
            id: id,
            title: getTitleFromPrompt(prompt, item.category),
            thumbnail: thumbnailPath,
            videoUrl: item.videoUrl || '',
            videoPreview: item.videoUrl || '',
            prompt: prompt,
            modelId: CONFIG.defaults.modelId,
            aspectRatio: CONFIG.defaults.aspectRatio,
            stylePreset: getStylePreset(item.category),
            category: item.category || 'Community',
            views: stats.views,
            likes: stats.likes,
            cost: CONFIG.defaults.cost,
            tags: ['Higgfield', 'Community', item.category].filter(Boolean),
            source: 'Higgfield.ai'
        };

        newIdeas.push(newIdea);
        console.log(`   ✅ Added: "${newIdea.title}"`);
    }

    // 7. Merge and save
    if (newIdeas.length === 0) {
        console.log(`\n⚠️ No new unique ideas to add. (Skipped ${skipped})`);
        fs.writeFileSync(CONFIG.importFile, '[]');
        return;
    }

    const mergedIdeas = [...keptIdeas, ...newIdeas];

    try {
        const updatedContent = ideasContent.replace(
            arrayMatch[1],
            JSON.stringify(mergedIdeas, null, 4)
        );

        fs.writeFileSync(CONFIG.ideasFile, updatedContent);

        console.log(`\n🎉 Ingestion Complete!`);
        console.log(`📊 Summary:`);
        console.log(`   - Deleted placeholders: ${deletedCount}`);
        console.log(`   - New items added: ${newIdeas.length}`);
        console.log(`   - Thumbnails downloaded: ${downloaded}`);
        console.log(`   - Duplicates skipped: ${skipped}`);
        console.log(`   - Total items now: ${mergedIdeas.length}`);

        // Clear import file
        fs.writeFileSync(CONFIG.importFile, '[]');
        console.log(`\n🧹 Cleared ${path.basename(CONFIG.importFile)}`);

    } catch (e) {
        console.error('❌ Failed to save ideas.ts:', e.message);
    }
}

// Run the ingestor
ingest().catch(console.error);
