import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

async function debugAPI() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        console.error("❌ GOOGLE_API_KEY not found")
        return
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`

    try {
        console.log(`🔍 Fetching models from: ${url.substring(0, 60)}...`)
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
            console.error(`❌ HTTP Error ${response.status}:`, JSON.stringify(data, null, 2))
            return
        }

        console.log("✅ Successfully listed models!")
        if (data.models) {
            console.log("Available models (first 5):")
            data.models.slice(0, 5).forEach((m: any) => console.log(` - ${m.name} (${m.displayName})`))
        } else {
            console.log("No models returned in response.")
        }
    } catch (error: any) {
        console.error("❌ Exception during fetch:", error.message)
    }
}

debugAPI()
