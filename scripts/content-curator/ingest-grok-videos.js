/**
 * Script: Ingest Grok Videos into Ideas Gallery
 * 
 * Usage: node scripts/content-curator/ingest-grok-videos.js
 */

const fs = require('fs');
const path = require('path');

const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');

// Video entries with full prompts
const GROK_VIDEOS = [
    // E-commerce (3)
    {
        filename: "Luxury gold product shot.mp4",
        title: "Luxury Gold Wristwatch Product Shot",
        prompt: "Cinematic product shot of a luxury gold wristwatch rotating slowly on a dark marble pedestal, soft volumetric lighting, water droplets catching light, ultra-realistic reflections, 8K commercial quality, professional advertising aesthetic",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Product", "Grok-Generated"]
    },
    {
        filename: "Premium skincare bottle.mp4",
        title: "Premium Skincare Splash Commercial",
        prompt: "Premium skincare bottle emerging from crystalline water splash in slow motion, golden hour backlight, particles suspended in air, luxury beauty commercial style, cinematic shallow depth of field",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Beauty", "Grok-Generated"]
    },
    {
        filename: "High-end sneaker.mp4",
        title: "Floating Sneaker Urban Ad",
        prompt: "High-end sneaker floating mid-air with dynamic fabric movement, neon accent lighting reflecting off the surface, urban night backdrop with bokeh city lights, Nike commercial aesthetic",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Fashion", "Grok-Generated"]
    },

    // Motion Control (3)
    {
        filename: "a futuristic glass skyscraper at sunset.mp4",
        title: "Futuristic Skyscraper Drone Shot",
        prompt: "Smooth drone fly-through of a futuristic glass skyscraper at sunset, camera weaving between buildings, golden light reflecting off windows, epic establishing shot, Hollywood blockbuster cinematography",
        category: "Action",
        stylePreset: "cinematic",
        tags: ["Motion Control", "Architecture", "Grok-Generated"]
    },
    {
        filename: "First-person POV.mp4",
        title: "Cyberpunk Alleyway POV Chase",
        prompt: "First-person POV sprinting through neon-lit cyberpunk alleyway, rain droplets on camera lens, holographic advertisements flickering, dynamic motion blur, Blade Runner 2049 aesthetic",
        category: "Action",
        stylePreset: "cyberpunk",
        tags: ["Motion Control", "POV", "Grok-Generated"]
    },
    {
        filename: "Orbital camera circling around a majestic lio.mp4",
        title: "Majestic Lion Dawn Orbital Shot",
        prompt: "Orbital camera circling around a majestic lion standing on savanna rocks at dawn, dust particles floating in golden sunlight, National Geographic documentary quality, slow cinematic rotation",
        category: "Nature",
        stylePreset: "nature",
        tags: ["Motion Control", "Wildlife", "Grok-Generated"]
    },

    // Cinematic (3)
    {
        filename: "Epic wide shot of a lone samurai.mp4",
        title: "Samurai in Cherry Blossom Forest",
        prompt: "Epic wide shot of a lone samurai walking through cherry blossom forest, petals falling in slow motion, mist rolling through bamboo, Akira Kurosawa film style, 35mm anamorphic lens flares",
        category: "Cinematic",
        stylePreset: "cinematic",
        tags: ["Cinematic", "Historical", "Grok-Generated"]
    },
    {
        filename: "Mysterious cloaked figure.mp4",
        title: "Dark Fantasy Portal Emergence",
        prompt: "Mysterious cloaked figure emerging from portal of swirling purple energy, magical particles orbiting outward, dark fantasy atmosphere, volumetric god rays, Dune movie lighting style",
        category: "Fantasy",
        stylePreset: "fantasy",
        tags: ["Cinematic", "Fantasy", "Grok-Generated"]
    },
    {
        filename: "Astronaut floating in zero gravity inside spacecraft.mp4",
        title: "Astronaut Zero Gravity Contemplation",
        prompt: "Astronaut floating in zero gravity inside spacecraft, Earth visible through window, gentle lens flare from sun, peaceful contemplative mood, Interstellar cinematography, 4K hyperrealistic",
        category: "Sci-Fi",
        stylePreset: "scifi",
        tags: ["Cinematic", "Sci-Fi", "Grok-Generated"]
    },

    // Social Media (3)
    {
        filename: "Satisfying macro shot of thick colorful paint.mp4",
        title: "Satisfying Paint Pour ASMR",
        prompt: "Satisfying macro shot of thick colorful paint being poured and mixing together, swirling patterns forming, ASMR texture close-up, trending TikTok art video style, super slow motion 120fps",
        category: "Artistic",
        stylePreset: "abstract",
        tags: ["Social Media", "Satisfying", "Grok-Generated"]
    },
    {
        filename: "Adorable golden retriever puppy tilting head curiously at camera.mp4",
        title: "Curious Golden Retriever Puppy",
        prompt: "Adorable golden retriever puppy tilting head curiously at camera, soft natural window light, cozy home interior bokeh, heartwarming pet content, viral video aesthetic",
        category: "Lifestyle",
        stylePreset: "lifestyle",
        tags: ["Social Media", "Pets", "Grok-Generated"]
    },
    {
        filename: "Fresh sushi roll being assembled by chef hands in slow motion.mp4",
        title: "Sushi Chef Slow Motion ASMR",
        prompt: "Fresh sushi roll being assembled by chef hands in slow motion, rice grains and ingredients in perfect detail, steam rising, Japanese restaurant ambient lighting, food ASMR commercial quality",
        category: "Lifestyle",
        stylePreset: "lifestyle",
        tags: ["Social Media", "Food", "Grok-Generated"]
    }
];

function generateId(filename) {
    const base = filename.replace('.mp4', '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const hash = Math.random().toString(36).substring(2, 8);
    return `grok-${hash}`;
}

function createIdea(video) {
    const id = generateId(video.filename);
    // URL encode the filename for the path
    const encodedFilename = encodeURIComponent(video.filename);

    return {
        id,
        title: video.title,
        thumbnail: "", // Empty - will use video first frame
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

    // Find the closing bracket of the array
    const lastBracketIndex = content.lastIndexOf(']');
    if (lastBracketIndex === -1) {
        console.error("❌ Could not find IDEAS array end in ideas.ts");
        return false;
    }

    // Format new ideas as JSON
    const formattedIdeas = newIdeas.map(idea => JSON.stringify(idea, null, 4)).join(',\n');

    // Check if there's content before the bracket (needs comma)
    const beforeBracket = content.substring(0, lastBracketIndex).trimEnd();
    const needsComma = beforeBracket.endsWith('}');

    // Insert new ideas
    const newContent =
        content.substring(0, lastBracketIndex) +
        (needsComma ? ',\n' : '') +
        formattedIdeas + '\n' +
        content.substring(lastBracketIndex);

    fs.writeFileSync(ideasFilePath, newContent);
    return true;
}

function main() {
    console.log("🎬 Ingesting Grok Videos into Ideas Gallery...\n");

    const ideas = GROK_VIDEOS.map(video => {
        console.log(`   📹 ${video.filename} → ${video.category}`);
        return createIdea(video);
    });

    console.log(`\n📝 Adding ${ideas.length} new ideas to ideas.ts...`);
    const success = appendToIdeasFile(ideas);

    if (success) {
        console.log("✅ Ideas file updated successfully!");
        console.log("\n📋 Added Ideas:");
        ideas.forEach(idea => {
            console.log(`   • ${idea.id}: ${idea.title}`);
        });
    } else {
        console.error("❌ Failed to update ideas file");
    }
}

main();
