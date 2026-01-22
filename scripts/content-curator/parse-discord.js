const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, 'raw_discord_dump.txt');
const dataDir = path.join(__dirname, '../../data');
const outputFilePath = path.join(dataDir, 'scraped_ideas.json');

if (!fs.existsSync(inputFilePath)) {
    console.error(`Input file not found: ${inputFilePath}`);
    console.log('Please create raw_discord_dump.txt in scripts/content-curator/ and paste your Discord logs there.');
    process.exit(1);
}

const rawContent = fs.readFileSync(inputFilePath, 'utf-8');
const lines = rawContent.split('\n');

const promptPatterns = [
    /\/imagine prompt:\s*(.*)/i,
    /Prompt:\s*(.*)/i,
    /(.*)--ar\s+\d+:\d+/i,
    /Video prompt:\s*(.*)/i
];

const categories = [
    { keywords: ['samurai', 'cyberpunk', 'neon', 'city', 'night'], name: 'Sci-Fi' },
    { keywords: ['anime', 'ghibli', 'manga', 'drawn'], name: 'Anime' },
    { keywords: ['ocean', 'forest', 'nature', 'animal', 'mountain'], name: 'Nature' },
    { keywords: ['cinematic', 'photorealistic', '8k', 'real'], name: 'Cinematic' },
    { keywords: ['fantasy', 'magic', 'dragon', 'wizard'], name: 'Fantasy' },
    { keywords: ['abstract', 'art', 'colorful', 'pattern'], name: 'Artistic' }
];

const autoAssignCategory = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    for (const cat of categories) {
        if (cat.keywords.some(keyword => lowerPrompt.includes(keyword))) {
            return cat.name;
        }
    }
    return 'General';
};

const ideas = [];
lines.forEach((line, index) => {
    let extractedPrompt = null;

    for (const pattern of promptPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
            extractedPrompt = match[1].trim();
            break;
        }
    }

    if (extractedPrompt) {
        const id = `scraped-${Date.now()}-${index}`;
        ideas.push({
            id,
            title: `Scraped Idea ${ideas.length + 1}`,
            thumbnail: `https://placehold.co/1920x1080/101010/F0421C/png?text=Scraped+${ideas.length + 1}`,
            videoUrl: 'https://cdn.openai.com/tmp/placeholder.mp4',
            prompt: extractedPrompt,
            modelId: 'kling-2.6-pro',
            aspectRatio: extractedPrompt.includes('--ar') ? extractedPrompt.match(/--ar\s+(\d+:\d+)/)[1] : '16:9',
            stylePreset: 'cinematic',
            category: autoAssignCategory(extractedPrompt),
            views: Math.floor(Math.random() * 500),
            likes: Math.floor(Math.random() * 100),
            cost: 10
        });
    }
});

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputFilePath, JSON.stringify(ideas, null, 2));
console.log(`Successfully parsed ${ideas.length} ideas into ${outputFilePath}`);
