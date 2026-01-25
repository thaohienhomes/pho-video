/**
 * Script: Ingest Grok Videos Batch 2 into Ideas Gallery
 * 
 * Usage: node scripts/content-curator/ingest-grok-batch2.js
 */

const fs = require('fs');
const path = require('path');

const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');

// New video entries - Batch 2
const GROK_VIDEOS_BATCH2 = [
    {
        filename: "Anime magical girl transformation.mp4",
        title: "Anime Magical Girl Transformation",
        prompt: "Anime style magical girl transformation sequence, sparkling particles swirling around character, dramatic costume change, vibrant colors, Studio Ghibli inspired animation, smooth 24fps",
        category: "Anime",
        stylePreset: "anime",
        tags: ["Anime", "Magical", "Grok-Generated"]
    },
    {
        filename: "Underwater bioluminescent jellyfish.mp4",
        title: "Bioluminescent Jellyfish Deep Sea",
        prompt: "Deep underwater scene with bioluminescent jellyfish floating gracefully, soft blue glow, coral reef in background, calm and serene, BBC Planet Earth documentary style, 8K",
        category: "Nature",
        stylePreset: "nature",
        tags: ["Nature", "Underwater", "Grok-Generated"]
    },
    {
        filename: "3D isometric cozy coffee shop.mp4",
        title: "Isometric Cozy Coffee Shop",
        prompt: "Isometric 3D view of a cozy indie coffee shop, warm lighting, plants and books, tiny people working on laptops, Lo-fi aesthetic, Blender render style, soft shadows",
        category: "3D",
        stylePreset: "3d",
        tags: ["3D", "Isometric", "Grok-Generated"]
    },
    {
        filename: "Retro synthwave car driving sunset.mp4",
        title: "Synthwave Sunset Drive",
        prompt: "80s sports car driving on endless highway toward neon sunset, synthwave color palette, pink and purple gradients, VHS scanlines, retro futurism aesthetic",
        category: "Retro",
        stylePreset: "retro",
        tags: ["Retro", "Synthwave", "Grok-Generated"]
    },
    {
        filename: "Dance choreography studio lights.mp4",
        title: "Contemporary Dance Performance",
        prompt: "Professional dancer performing fluid contemporary moves, dramatic stage lighting, smoke machine effects, slow motion capture, music video production quality",
        category: "Dance",
        stylePreset: "cinematic",
        tags: ["Dance", "Performance", "Grok-Generated"]
    },
    {
        filename: "Magical forest fairy portal.mp4",
        title: "Enchanted Forest Fairy Portal",
        prompt: "Enchanted forest with glowing fairy dust, ancient tree with magical portal, fireflies dancing, mystical atmosphere, Lord of the Rings inspired, golden hour lighting",
        category: "Fantasy",
        stylePreset: "fantasy",
        tags: ["Fantasy", "Magical", "Grok-Generated"]
    },
    {
        filename: "Tech product unboxing hands.mp4",
        title: "Premium Tech Unboxing",
        prompt: "Hands unboxing premium smartphone from minimalist packaging, satisfying reveal, clean white background, Apple-style commercial aesthetic, macro detail shots",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Tech", "Grok-Generated"]
    },
    {
        filename: "Storm clouds timelapse dramatic.mp4",
        title: "Dramatic Storm Timelapse",
        prompt: "Dramatic timelapse of storm clouds rolling over mountain peaks, lightning strikes in distance, epic scale, National Geographic documentary, 8K resolution",
        category: "Nature",
        stylePreset: "nature",
        tags: ["Nature", "Timelapse", "Grok-Generated"]
    }
];

function generateId(filename) {
    const hash = Math.random().toString(36).substring(2, 8);
    return `grok-${hash}`;
}

function createIdea(video) {
    const id = generateId(video.filename);
    const encodedFilename = encodeURIComponent(video.filename);

    return {
        id,
        title: video.title,
        thumbnail: "",
        videoUrl: `/ideas/${encodedFilename}`,
        videoPreview: `/ideas/${encodedFilename}`,
        prompt: video.prompt,
        modelId: "grok-video",
        aspectRatio: "16:9",
        stylePreset: video.stylePreset,
        category: video.category,
        views: Math.floor(Math.random() * 2000) + 500,
        likes: Math.floor(Math.random() * 500) + 100,
        cost: 10,
        tags: video.tags,
        source: "Grok Video (xAI)"
    };
}

function appendToIdeasFile(newIdeas) {
    const content = fs.readFileSync(ideasFilePath, 'utf-8');
    const lastBracketIndex = content.lastIndexOf(']');

    if (lastBracketIndex === -1) {
        console.error("❌ Could not find IDEAS array end");
        return false;
    }

    const formattedIdeas = newIdeas.map(idea => JSON.stringify(idea, null, 4)).join(',\n');
    const beforeBracket = content.substring(0, lastBracketIndex).trimEnd();
    const needsComma = beforeBracket.endsWith('}');

    const newContent =
        content.substring(0, lastBracketIndex) +
        (needsComma ? ',\n' : '') +
        formattedIdeas + '\n' +
        content.substring(lastBracketIndex);

    fs.writeFileSync(ideasFilePath, newContent);
    return true;
}

function main() {
    console.log("🎬 Ingesting Grok Videos Batch 2...\n");

    const ideas = GROK_VIDEOS_BATCH2.map(video => {
        console.log(`   📹 ${video.filename} → ${video.category}`);
        return createIdea(video);
    });

    console.log(`\n📝 Adding ${ideas.length} new ideas...`);

    if (appendToIdeasFile(ideas)) {
        console.log("✅ Done!");
        console.log("\n📋 Added:");
        ideas.forEach(idea => console.log(`   • ${idea.id}: ${idea.title}`));
    }
}

main();
