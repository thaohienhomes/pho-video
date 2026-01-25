/**
 * LTX Video Production Pipeline
 * 
 * Autonomous batch video generator using LTX-Video via Fal.ai
 * Generates high-quality AI videos for the Phở Video Ideas Gallery.
 * 
 * Usage:
 *   node scripts/content-curator/generate-ltx.js [--count N] [--category CATEGORY]
 * 
 * Example:
 *   node scripts/content-curator/generate-ltx.js --count 3 --category "E-commerce"
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// ============================================================================
// Configuration
// ============================================================================

const FAL_KEY = process.env.FAL_KEY;
const FAL_API_BASE = "https://queue.fal.run";

if (!FAL_KEY) {
    console.error("❌ FAL_KEY is missing in .env.local");
    process.exit(1);
}

const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');
const publicVideosDir = path.join(__dirname, '../../public/videos/ltx');
const publicIdeasDir = path.join(__dirname, '../../public/ideas');

// Ensure directories exist
[publicVideosDir, publicIdeasDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// ============================================================================
// Trending Prompts Library (LTX-Optimized Natural Language)
// ============================================================================

const TRENDING_PROMPTS = [
    // E-commerce / Product Showcase
    {
        prompt: "Cinematic product shot of a luxury gold wristwatch rotating slowly on a dark marble pedestal, soft volumetric lighting, water droplets catching light, ultra-realistic reflections, 8K commercial quality, professional advertising aesthetic",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Product", "LTX-Generated"]
    },
    {
        prompt: "Premium skincare bottle emerging from crystalline water splash in slow motion, golden hour backlight, particles suspended in air, luxury beauty commercial style, cinematic shallow depth of field",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Beauty", "LTX-Generated"]
    },
    {
        prompt: "High-end sneaker floating mid-air with dynamic fabric movement, neon accent lighting reflecting off the surface, urban night backdrop with bokeh city lights, Nike commercial aesthetic",
        category: "E-commerce",
        stylePreset: "advertising",
        tags: ["E-commerce", "Fashion", "LTX-Generated"]
    },

    // Motion Control / Camera Movement
    {
        prompt: "Smooth drone fly-through of a futuristic glass skyscraper at sunset, camera weaving between buildings, golden light reflecting off windows, epic establishing shot, Hollywood blockbuster cinematography",
        category: "Action",
        stylePreset: "cinematic",
        tags: ["Motion Control", "Architecture", "LTX-Generated"]
    },
    {
        prompt: "First-person POV sprinting through neon-lit cyberpunk alleyway, rain droplets on camera lens, holographic advertisements flickering, dynamic motion blur, Blade Runner 2049 aesthetic",
        category: "Action",
        stylePreset: "cyberpunk",
        tags: ["Motion Control", "POV", "LTX-Generated"]
    },
    {
        prompt: "Orbital camera circling around a majestic lion standing on savanna rocks at dawn, dust particles floating in golden sunlight, National Geographic documentary quality, slow cinematic rotation",
        category: "Nature",
        stylePreset: "nature",
        tags: ["Motion Control", "Wildlife", "LTX-Generated"]
    },

    // Cinematic / Film-Quality
    {
        prompt: "Epic wide shot of a lone samurai walking through cherry blossom forest, petals falling in slow motion, mist rolling through bamboo, Akira Kurosawa film style, 35mm anamorphic lens flares",
        category: "Cinematic",
        stylePreset: "cinematic",
        tags: ["Cinematic", "Historical", "LTX-Generated"]
    },
    {
        prompt: "Mysterious cloaked figure emerging from portal of swirling purple energy, magical particles orbiting outward, dark fantasy atmosphere, volumetric god rays, Dune movie lighting style",
        category: "Fantasy",
        stylePreset: "fantasy",
        tags: ["Cinematic", "Fantasy", "LTX-Generated"]
    },
    {
        prompt: "Astronaut floating in zero gravity inside spacecraft, Earth visible through window, gentle lens flare from sun, peaceful contemplative mood, Interstellar cinematography, 4K hyperrealistic",
        category: "Sci-Fi",
        stylePreset: "scifi",
        tags: ["Cinematic", "Sci-Fi", "LTX-Generated"]
    },

    // Social Media / Viral Content
    {
        prompt: "Satisfying macro shot of thick colorful paint being poured and mixing together, swirling patterns forming, ASMR texture close-up, trending TikTok art video style, super slow motion 120fps",
        category: "Artistic",
        stylePreset: "abstract",
        tags: ["Social Media", "Satisfying", "LTX-Generated"]
    },
    {
        prompt: "Adorable golden retriever puppy tilting head curiously at camera, soft natural window light, cozy home interior bokeh, heartwarming pet content, viral video aesthetic",
        category: "Lifestyle",
        stylePreset: "lifestyle",
        tags: ["Social Media", "Pets", "LTX-Generated"]
    },
    {
        prompt: "Fresh sushi roll being assembled by chef hands in slow motion, rice grains and ingredients in perfect detail, steam rising, Japanese restaurant ambient lighting, food ASMR commercial quality",
        category: "Lifestyle",
        stylePreset: "lifestyle",
        tags: ["Social Media", "Food", "LTX-Generated"]
    }
];

// ============================================================================
// Utility Functions
// ============================================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ltx-${timestamp}-${random}`;
}

async function downloadFile(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`   📥 Saved to: ${path.basename(dest)}`);
}

// ============================================================================
// Fal.ai LTX-Video API Functions
// ============================================================================

async function submitLtxJob(prompt, negativePrompt = null) {
    const response = await fetch(`${FAL_API_BASE}/fal-ai/ltx-video`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
            prompt: prompt,
            negative_prompt: negativePrompt || "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly, blurry, watermark, text",
            num_inference_steps: 30,
            guidance_scale: 3,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Fal API Error: ${error}`);
    }

    const data = await response.json();
    return data.request_id;
}

async function checkLtxStatus(requestId) {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/ltx-video/requests/${requestId}/status`,
        {
            headers: { "Authorization": `Key ${FAL_KEY}` },
        }
    );

    if (!response.ok) throw new Error("Failed to check status");
    return response.json();
}

async function getLtxResult(requestId) {
    const response = await fetch(
        `${FAL_API_BASE}/fal-ai/ltx-video/requests/${requestId}`,
        {
            headers: { "Authorization": `Key ${FAL_KEY}` },
        }
    );

    if (!response.ok) throw new Error("Failed to retrieve result");
    return response.json();
}

async function generateVideo(promptData) {
    const { prompt, category, stylePreset, tags } = promptData;
    const id = generateId();

    console.log(`\n🚀 [LTX-Video] Generating: "${prompt.substring(0, 60)}..."`);
    console.log(`   Category: ${category} | Style: ${stylePreset}`);

    try {
        // Submit job
        const requestId = await submitLtxJob(prompt);
        console.log(`   📋 Job submitted: ${requestId}`);

        // Poll for completion (max 5 minutes)
        const maxAttempts = 150;
        const intervalMs = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await sleep(intervalMs);
            const status = await checkLtxStatus(requestId);

            if (attempt % 10 === 0 || status.status !== "IN_PROGRESS") {
                console.log(`   🔄 Status: ${status.status} (${attempt + 1}/${maxAttempts})`);
            }

            if (status.status === "COMPLETED") {
                const result = await getLtxResult(requestId);
                const videoUrl = result.video.url;

                // Download video locally
                const videoFileName = `${id}.mp4`;
                const videoLocalPath = path.join(publicVideosDir, videoFileName);
                await downloadFile(videoUrl, videoLocalPath);

                console.log(`   ✅ Video generated successfully!`);

                // Return idea object
                return {
                    id: id,
                    title: prompt.substring(0, 50).split(',')[0] + "...",
                    thumbnail: "", // Will use video poster or generate later
                    videoUrl: `/videos/ltx/${videoFileName}`,
                    videoPreview: `/videos/ltx/${videoFileName}`,
                    prompt: prompt,
                    modelId: "ltx-video",
                    aspectRatio: "16:9",
                    stylePreset: stylePreset,
                    category: category,
                    views: Math.floor(Math.random() * 2000) + 500,
                    likes: Math.floor(Math.random() * 500) + 100,
                    cost: 5,
                    tags: tags,
                    source: "LTX-Video (Fal.ai)"
                };
            }

            if (status.status === "FAILED") {
                throw new Error("LTX-Video generation failed");
            }
        }

        throw new Error("Generation timed out after 5 minutes");

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return null;
    }
}

// ============================================================================
// Ideas.ts File Management
// ============================================================================

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

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    console.log("🏭 LTX Video Production Pipeline Starting...\n");

    // Parse CLI arguments
    const args = process.argv.slice(2);
    let count = 3; // Default: generate 3 videos
    let categoryFilter = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--count' && args[i + 1]) {
            count = parseInt(args[i + 1], 10);
        }
        if (args[i] === '--category' && args[i + 1]) {
            categoryFilter = args[i + 1];
        }
    }

    // Filter prompts by category if specified
    let promptsToProcess = TRENDING_PROMPTS;
    if (categoryFilter) {
        promptsToProcess = TRENDING_PROMPTS.filter(p =>
            p.category.toLowerCase() === categoryFilter.toLowerCase() ||
            p.tags.some(t => t.toLowerCase() === categoryFilter.toLowerCase())
        );
        console.log(`📁 Filtered to category: ${categoryFilter} (${promptsToProcess.length} prompts available)`);
    }

    // Limit to requested count
    const selectedPrompts = promptsToProcess.slice(0, count);

    console.log(`🎬 Generating ${selectedPrompts.length} videos...\n`);
    console.log("━".repeat(60));

    const generatedIdeas = [];

    for (const promptData of selectedPrompts) {
        const idea = await generateVideo(promptData);
        if (idea) {
            generatedIdeas.push(idea);
        }

        // Rate limiting between generations
        await sleep(2000);
    }

    console.log("\n" + "━".repeat(60));

    if (generatedIdeas.length > 0) {
        console.log(`\n📝 Appending ${generatedIdeas.length} new ideas to ideas.ts...`);
        const success = appendToIdeasFile(generatedIdeas);

        if (success) {
            console.log("✅ Ideas file updated successfully!");
        } else {
            console.error("❌ Failed to update ideas file");
        }
    }

    console.log(`\n🎉 Production complete! Generated ${generatedIdeas.length}/${selectedPrompts.length} videos.`);

    // Summary
    if (generatedIdeas.length > 0) {
        console.log("\n📋 Generated Videos:");
        generatedIdeas.forEach(idea => {
            console.log(`   • ${idea.id}: ${idea.title}`);
        });
    }
}

main().catch(console.error);
