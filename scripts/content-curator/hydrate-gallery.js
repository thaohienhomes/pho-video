const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const FAL_KEY = process.env.FAL_KEY;
const FAL_API_BASE = "https://queue.fal.run";

if (!FAL_KEY) {
    console.error("❌ FAL_KEY is missing in .env.local");
    process.exit(1);
}

const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');
const publicIdeasDir = path.join(__dirname, '../../public/ideas');

if (!fs.existsSync(publicIdeasDir)) {
    fs.mkdirSync(publicIdeasDir, { recursive: true });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(dest, buffer);
}

async function generateImage(prompt, aspectRatio = "16:9") {
    // Enhance prompt for quality
    const enhancedPrompt = `${prompt}, Cinematic movie still, high detail, 8k, masterpiece, trending on artstation, photorealistic, professional lighting`;

    // Map aspect ratio for FLUX
    let imageSize = { width: 1024, height: 1024 };
    if (aspectRatio === "16:9") imageSize = { width: 1408, height: 768 };
    else if (aspectRatio === "9:16") imageSize = { width: 768, height: 1408 };
    else if (aspectRatio === "21:9") imageSize = { width: 1536, height: 640 };

    console.log(`🚀 [Fal.ai] Generating for: "${prompt.substring(0, 50)}..."`);

    const response = await fetch(`${FAL_API_BASE}/fal-ai/flux-pro/v1.1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Key ${FAL_KEY}`,
        },
        body: JSON.stringify({
            prompt: enhancedPrompt,
            image_size: imageSize,
            num_images: 1,
            enable_safety_checker: true,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Fal API Error: ${err}`);
    }

    const { request_id } = await response.json();

    // Polling
    for (let i = 0; i < 30; i++) {
        await sleep(2000);
        const statusRes = await fetch(`${FAL_API_BASE}/fal-ai/flux-pro/v1.1/requests/${request_id}/status`, {
            headers: { "Authorization": `Key ${FAL_KEY}` }
        });
        const statusData = await statusRes.json();

        if (statusData.status === "COMPLETED") {
            const resultRes = await fetch(`${FAL_API_BASE}/fal-ai/flux-pro/v1.1/requests/${request_id}`, {
                headers: { "Authorization": `Key ${FAL_KEY}` }
            });
            const resultData = await resultRes.json();
            return resultData.images[0].url;
        }

        if (statusData.status === "FAILED") {
            throw new Error("Fal generation failed");
        }
    }
    throw new Error("Fal generation timed out");
}

async function hydrate() {
    console.log("🌊 Starting Gallery Hydration Pipeline...");

    const content = fs.readFileSync(ideasFilePath, 'utf-8');

    // Very simple extraction of the array content
    const arrayMatch = content.match(/export const IDEAS = (\[[\s\S]*?\]);/);
    if (!arrayMatch) {
        console.error("❌ Could not find IDEAS array in ideas.ts");
        return;
    }

    let ideas;
    try {
        // Evaluate the string to get the JS array
        // We use a regex-based replacement to make it valid JSON for parsing
        const jsonContent = arrayMatch[1]
            .replace(/'/g, '"') // simple single to double quote
            .replace(/(\w+):/g, '"$1":') // add quotes to keys
            .replace(/,\s*]/g, ']') // remove trailing comma
            .replace(/,\s*}/g, '}'); // remove trailing comma

        // Wait, evaluation is safer if the file has complex strings
        // But let's try a safer approach: eval in a sandbox or just a careful replace
        // Since we are in a trusted script context, eval is okay for this one-off
        ideas = eval(arrayMatch[1]);
    } catch (e) {
        console.log("⚠️ Failed to parse ideas.ts automatically, attempting regex fallback...");
        // Fallback or exit
        process.exit(1);
    }

    let updatedCount = 0;

    for (let i = 0; i < ideas.length; i++) {
        const idea = ideas[i];

        // Skip if already has a real local thumbnail or external non-placeholder image
        const needsHydration = !idea.thumbnail ||
            idea.thumbnail.includes('placehold.co') ||
            idea.thumbnail === '';

        if (!needsHydration) {
            console.log(`⏩ Skipping "${idea.title}" (Already hydrated)`);
            continue;
        }

        try {
            const imageUrl = await generateImage(idea.prompt, idea.aspectRatio);
            const fileName = `${idea.id}.jpg`;
            const localPath = path.join(publicIdeasDir, fileName);

            await downloadImage(imageUrl, localPath);

            idea.thumbnail = `/ideas/${fileName}`;
            console.log(`✅ Hydrated "${idea.title}" -> ${idea.thumbnail}`);
            updatedCount++;

            // Write back after each success to prevent data loss on crash
            const updatedContent = content.replace(arrayMatch[1], JSON.stringify(ideas, null, 4));
            fs.writeFileSync(ideasFilePath, updatedContent);

        } catch (error) {
            console.error(`❌ Error hydrating "${idea.title}":`, error.message);
        }

        // Rate limiting / safety sleep
        await sleep(1000);
    }

    console.log(`\n🎉 Hydration complete! ${updatedCount} ideas updated.`);
}

hydrate();
