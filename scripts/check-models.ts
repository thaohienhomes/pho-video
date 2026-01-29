import { GoogleGenerativeAI } from "@google/generative-ai"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

async function checkModels() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        console.error("❌ GOOGLE_API_KEY not found")
        return
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    try {
        console.log("🔍 Checking available models...")
        // Note: The SDK doesn't have a direct listModels, we usually check documentation
        // But we can try a few known names
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]

        for (const modelName of models) {
            try {
                console.log(`📡 Testing ${modelName}...`)
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent("Hi")
                const response = await result.response
                console.log(`✅ ${modelName} works! Response: ${response.text().trim()}`)
                return // Stop at first working model
            } catch (e: any) {
                console.log(`❌ ${modelName} failed: ${e.message.substring(0, 50)}...`)
            }
        }
    } catch (error: any) {
        console.error("❌ Global Error:", error.message)
    }
}

checkModels()
