const fs = require('fs');
const path = require('path');

const styles = ['Cyberpunk', 'Studio Ghibli', 'Cinematic', 'Anime', 'Realistic', 'Fantasy', '3D Render', 'Vaporwave', 'Abstract', 'Noir'];
const subjects = ['Samurai', 'Cybernetic Cat', 'Interstellar Spaceship', 'Ancient Dragon', 'Lonely Astronaut', 'Futuristic Robot', 'Mysterious Sorceress', 'Flying Whale', 'Cyberpunk Girl', 'Golden Retriever'];
const actions = ['running through', 'flying over', 'eating in', 'contemplating near', 'fighting in', 'gazing at', 'meditating inside', 'dancing through', 'exploring', 'defending'];
const environments = ['a rainy neon city', 'a lush floating jungle', 'the surface of Mars', 'a bioluminescent ocean', 'a steampunk factory', 'a serene mountain temple', 'a post-apocalyptic wasteland', 'a futuristic orbital station', 'a dreamlike cloud kingdom', 'a digital wireframe world'];
const modifiers = ['8k', 'highly detailed', 'photorealistic', 'cinematic lighting', 'masterpiece', 'intricate details', 'volumetric fog', 'ray tracing', 'vibrant colors', 'epic scale'];

const modelIds = ['kling-2.6-pro', 'flux-1.1-pro', 'recraft-v3'];
const aspectRatios = ['16:9', '9:16', '1:1', '21:9'];
const categories = ['Cinematic', 'Anime', 'Sci-Fi', 'Nature', 'Artistic', 'Fantasy', '3D', 'Abstract'];

const generatePrompt = () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const env = environments[Math.floor(Math.random() * environments.length)];
    const mod1 = modifiers[Math.floor(Math.random() * modifiers.length)];
    const mod2 = modifiers[Math.floor(Math.random() * modifiers.length)];

    return {
        prompt: `${style} video of a ${subject} ${action} ${env}, ${mod1}, ${mod2}.`,
        style: style
    };
};

const generateIdeas = (count) => {
    const ideas = [];
    for (let i = 0; i < count; i++) {
        const id = `gen-${Date.now()}-${i}`;
        const { prompt, style } = generatePrompt();
        const category = categories[Math.floor(Math.random() * categories.length)];
        const modelId = modelIds[Math.floor(Math.random() * modelIds.length)];

        ideas.push({
            id,
            title: `Generated Idea ${i + 1}`,
            thumbnail: `https://placehold.co/1920x1080/101010/F0421C/png?text=Idea+${i + 1}`,
            videoUrl: 'https://cdn.openai.com/tmp/placeholder.mp4',
            prompt,
            modelId,
            aspectRatio: aspectRatios[Math.floor(Math.random() * aspectRatios.length)],
            stylePreset: style.toLowerCase(),
            category,
            views: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 200),
            cost: modelId.includes('pro') ? 10 : 5
        });
    }
    return ideas;
};

const count = 50;
const generatedData = generateIdeas(count);
const dataDir = path.join(__dirname, '../../data');
const outputFile = path.join(dataDir, 'generated_ideas.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(generatedData, null, 2));
console.log(`Successfully generated ${count} ideas into ${outputFile}`);
