const FAL_KEY = "76e91519-53db-4a56-92f7-34e9cc453192:38ec396b16fb3d47f1a7fd3a427a574a";
const FAL_API_BASE = "https://queue.fal.run";

async function testEnhance() {
    const prompt = "A cat sleeping";
    const systemPrompt = "Expand this prompt into a cinematic description.";

    try {
        const response = await fetch(`${FAL_API_BASE}/fal-ai/any-llm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${FAL_KEY}`,
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct",
                prompt: `Expand this video prompt: "${prompt}"`,
                system_prompt: systemPrompt,
            }),
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testEnhance();
