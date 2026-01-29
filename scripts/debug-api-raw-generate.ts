import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

async function testGeneration() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        console.error("❌ GOOGLE_API_KEY not found")
        return
    }

    const modelName = "gemini-2.5-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

    try {
        console.log(`📡 Testing generation with ${modelName}...`)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Say 'Success!'" }]
                }]
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error(`❌ HTTP Error ${response.status}:`, JSON.stringify(data, null, 2))
            return
        }

        console.log("✅ Generation successful!")
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            console.log(`Response: ${data.candidates[0].content.parts[0].text.trim()}`)
        } else {
            console.log("Unusual response format:", JSON.stringify(data, null, 2))
        }
    } catch (error: any) {
        console.error("❌ Exception:", error.message)
    }
}

testGeneration()
