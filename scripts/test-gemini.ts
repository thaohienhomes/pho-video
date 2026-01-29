/**
 * Test script to verify Google Gemini API key
 * Run: npx tsx scripts/test-gemini.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import * as dotenv from "dotenv"
import path from "path"

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") })

async function testGeminiAPI() {
    console.log("🔍 Testing Google Gemini API...")
    console.log("-----------------------------------")

    const apiKey = process.env.GOOGLE_API_KEY

    // Check 1: API Key exists
    if (!apiKey) {
        console.error("❌ GOOGLE_API_KEY is NOT set in .env.local")
        console.log("\n📌 Fix: Add this to your .env.local file:")
        console.log('   GOOGLE_API_KEY="your_api_key_here"')
        console.log("\n🔗 Get API key from: https://makersuite.google.com/app/apikey")
        process.exit(1)
    }

    // Check 2: API Key is not placeholder
    if (apiKey === "your_gemini_api_key_here" || apiKey.length < 20) {
        console.error("❌ GOOGLE_API_KEY appears to be a placeholder or invalid")
        console.log(`   Current value: "${apiKey.substring(0, 10)}..."`)
        process.exit(1)
    }

    console.log(`✅ API Key found: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`)

    // Check 3: Test actual API call
    try {
        console.log("\n📡 Testing API call with gemini-1.5-flash...")

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const result = await model.generateContent([
            { text: "Say 'Hello Pho Video!' in exactly 3 words." }
        ])

        const response = await result.response
        const text = response.text().trim()

        console.log(`✅ API Response: "${text}"`)
        console.log("\n🎉 SUCCESS! Google Gemini API is working correctly.")

    } catch (error: any) {
        console.error("\n❌ API Error:", error.message)

        if (error.message?.includes("API_KEY_INVALID")) {
            console.log("\n📌 Your API key is invalid. Please:")
            console.log("   1. Go to https://makersuite.google.com/app/apikey")
            console.log("   2. Create a new API key")
            console.log("   3. Update GOOGLE_API_KEY in .env.local")
        } else if (error.message?.includes("quota")) {
            console.log("\n📌 API quota exceeded. Please check your Google AI Studio quota.")
        } else if (error.message?.includes("not found") || error.message?.includes("model")) {
            console.log("\n📌 Model not found. Try using 'gemini-pro' instead of 'gemini-1.5-flash'")
        }

        process.exit(1)
    }
}

testGeminiAPI()
