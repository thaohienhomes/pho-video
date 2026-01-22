const fs = require('fs');
const path = require('path');

const ideasFilePath = path.join(__dirname, '../../data/ideas.ts');
const generatedFilePath = path.join(__dirname, '../../data/generated_ideas.json');
const scrapedFilePath = path.join(__dirname, '../../data/scraped_ideas.json');

const mergeIdeas = () => {
    let currentIdeasRaw = fs.readFileSync(ideasFilePath, 'utf-8');

    // Extract the array content between [ and ]
    const arrayStart = currentIdeasRaw.indexOf('[');
    const arrayEnd = currentIdeasRaw.lastIndexOf(']');

    if (arrayStart === -1 || arrayEnd === -1) {
        console.error('Could not find IDEAS array in data/ideas.ts');
        return;
    }

    let currentIdeas = [];
    try {
        // We use eval here carefully since it's a build-time script and we control the input
        // A better way would be regex or a proper TS parser, but for this task simplicity wins
        const arrayStrings = currentIdeasRaw.substring(arrayStart, arrayEnd + 1);
        // Note: This assumes the file is simple enough to be "parsed" this way.
        // If it fails, we'll fallback to a cleaner approach.
    } catch (e) {
        console.error('Failed to parse current ideas.ts');
    }

    const newIdeas = [];
    if (fs.existsSync(generatedFilePath)) {
        newIdeas.push(...JSON.parse(fs.readFileSync(generatedFilePath, 'utf-8')));
    }
    if (fs.existsSync(scrapedFilePath)) {
        newIdeas.push(...JSON.parse(fs.readFileSync(scrapedFilePath, 'utf-8')));
    }

    if (newIdeas.length === 0) {
        console.log('No new ideas to integrate.');
        return;
    }

    // Instead of parsing, let's just insert before the last bracket
    const updatedIdeasRaw = currentIdeasRaw.substring(0, arrayEnd).trim();
    const isCommaNeeded = updatedIdeasRaw.endsWith('{') || updatedIdeasRaw.endsWith(',') ? '' : ',';

    const formattedNewIdeas = newIdeas.map(idea => JSON.stringify(idea, null, 4)).join(',\n    ');

    const finalContent = `${updatedIdeasRaw}${isCommaNeeded}\n    ${formattedNewIdeas}\n];\n`;

    fs.writeFileSync(ideasFilePath, finalContent);
    console.log(`Successfully integrated ${newIdeas.length} ideas into data/ideas.ts`);

    // Cleanup: Remove the source files to prevent duplicate integration
    if (fs.existsSync(generatedFilePath)) fs.unlinkSync(generatedFilePath);
    if (fs.existsSync(scrapedFilePath)) fs.unlinkSync(scrapedFilePath);
    console.log('Cleaned up source JSON files.');
};

mergeIdeas();
