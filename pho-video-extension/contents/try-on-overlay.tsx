import { useState, useEffect, useCallback } from "react"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"

// IMPORTANT: Use relative imports instead of path aliases for content scripts
import { detectMainProductImage, scrapeAllProductImages } from "../utils/scraper"
import { addMultipleToWardrobe } from "../storage/wardrobe"

// ============================================================================
// Configuration
// ============================================================================

// API endpoint - change this to your deployed URL
const API_BASE = "http://localhost:3000"
const API_PATH = "/api/ext/try-on" // Extension-specific endpoint with CORS

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style")
    style.textContent = `
    * { box-sizing: border-box; font-family: Inter, system-ui, sans-serif; }
    .pho-btn { 
        display: flex; align-items: center; gap: 8px; padding: 14px 24px; 
        background: linear-gradient(135deg, #F0421C, #f97316); color: white; 
        font-size: 14px; font-weight: 700; border-radius: 16px; border: none; 
        cursor: pointer; box-shadow: 0 8px 32px rgba(240, 66, 28, 0.4); 
        transition: all 0.25s ease; backdrop-filter: blur(10px);
    }
    .pho-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 40px rgba(240, 66, 28, 0.5); }
    .pho-btn:active { transform: scale(0.98); }
    .pho-overlay { 
        background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(20px);
        display: flex; flex-direction: column; align-items: center; justify-content: center; 
        border-radius: 20px; border: 2px solid rgba(240, 66, 28, 0.4);
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
    }
    .pho-spinner { 
        width: 56px; height: 56px; border: 4px solid rgba(240, 66, 28, 0.3); 
        border-top-color: #F0421C; border-radius: 50%; 
        animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin-bottom: 20px; 
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .pho-progress { display: flex; gap: 6px; margin-top: 16px; }
    .pho-progress span { width: 8px; height: 8px; background: rgba(240, 66, 28, 0.3); border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
    .pho-progress span:nth-child(2) { animation-delay: 0.2s; }
    .pho-progress span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; background: #F0421C; } }
    .pho-result { 
        border-radius: 20px; overflow: hidden; 
        border: 3px solid #F0421C; box-shadow: 0 30px 60px rgba(0,0,0,0.6); 
        position: relative; animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .pho-result img { width: 100%; height: 100%; object-fit: cover; }
    .pho-result-badge { 
        position: absolute; top: 12px; left: 12px; 
        background: linear-gradient(135deg, #F0421C, #f97316); 
        color: white; font-size: 11px; font-weight: 700; padding: 6px 12px; 
        border-radius: 20px; display: flex; align-items: center; gap: 5px;
        box-shadow: 0 4px 15px rgba(240, 66, 28, 0.4);
    }
    .pho-actions { 
        position: absolute; bottom: 0; left: 0; right: 0; 
        background: linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.8) 60%, transparent); 
        padding: 24px 16px 16px; display: flex; gap: 10px; 
    }
    .pho-actions button { 
        flex: 1; padding: 14px; font-size: 14px; font-weight: 600; 
        border-radius: 12px; border: none; cursor: pointer; transition: all 0.2s;
    }
    .pho-actions .primary { background: linear-gradient(135deg, #F0421C, #f97316); color: white; }
    .pho-actions .primary:hover { transform: scale(1.03); }
    .pho-actions .secondary { background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.2); }
    .pho-actions .secondary:hover { background: rgba(255,255,255,0.2); }
    .pho-error { 
        max-width: 320px; background: linear-gradient(135deg, #991B1B, #7F1D1D); 
        color: white; padding: 24px; border-radius: 20px; 
        box-shadow: 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
    }
  `
    return style
}

// ============================================================================
// Component
// ============================================================================

type ViewState = "idle" | "loading" | "result" | "error"

function TryOnOverlay() {
    const [modelImageUrl, setModelImageUrl] = useState<string>("")
    const [garmentUrl, setGarmentUrl] = useState<string | null>(null)
    const [garmentElement, setGarmentElement] = useState<HTMLImageElement | null>(null)
    const [position, setPosition] = useState<DOMRect | null>(null)
    const [viewState, setViewState] = useState<ViewState>("idle")
    const [resultImage, setResultImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log("[Pho Video] Content script loaded!")
        try {
            chrome.storage.local.get(["modelImageUrl"], (result) => {
                if (result.modelImageUrl) {
                    console.log("[Pho Video] Model image loaded")
                    setModelImageUrl(result.modelImageUrl)
                }
            })
        } catch (e) {
            console.log("[Pho Video] Storage error:", e)
        }

        // Listen for messages from popup
        const messageListener = (message: { action: string; items?: string[] }, sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => {
            console.log("[Pho Video] Received message:", message.action)

            if (message.action === "scrapeProducts") {
                console.log("[Pho Video] Starting scrape process...")

                // FIXED: Use static imports instead of dynamic imports
                try {
                    const products = scrapeAllProductImages()
                    console.log("[Pho Video] Scraped products:", products.length)

                    // Add to wardrobe storage
                    addMultipleToWardrobe(products)
                        .then((added) => {
                            console.log("[Pho Video] Added to wardrobe:", added.length)
                            sendResponse({ products: added, success: true })
                        })
                        .catch((err) => {
                            console.error("[Pho Video] Error adding to wardrobe:", err)
                            sendResponse({ error: String(err), success: false })
                        })
                } catch (err) {
                    console.error("[Pho Video] Error in scrape:", err)
                    sendResponse({ error: String(err), success: false })
                }

                return true // Keep channel open for async response
            }

            if (message.action === "tryOnItems" && message.items) {
                // Use first item for now (multi-item coming later)
                const firstItem = message.items[0]
                if (firstItem) {
                    setGarmentUrl(firstItem)
                    // Trigger try-on
                    handleTryOn()
                }
            }

            return false
        }

        chrome.runtime.onMessage.addListener(messageListener)
        return () => chrome.runtime.onMessage.removeListener(messageListener)
    }, [])

    useEffect(() => {
        const detect = () => {
            const detected = detectMainProductImage()
            if (detected) {
                console.log("[Pho Video] Garment detected")
                setGarmentUrl(detected.url)
                setGarmentElement(detected.element)
                if (detected.element) {
                    setPosition(detected.element.getBoundingClientRect())
                }
            }
        }
        setTimeout(detect, 1500)
        window.addEventListener("scroll", detect, { passive: true })
        window.addEventListener("resize", detect, { passive: true })
        return () => {
            window.removeEventListener("scroll", detect)
            window.removeEventListener("resize", detect)
        }
    }, [])

    const handleTryOn = useCallback(async () => {
        console.log("[Pho Video] Try-on clicked!")

        // Get model image
        let currentModelUrl = modelImageUrl
        if (!currentModelUrl) {
            try {
                const result = await chrome.storage.local.get(["modelImageUrl"])
                if (!result.modelImageUrl) {
                    setError("Please upload a body photo in the extension popup first!")
                    setViewState("error")
                    return
                }
                currentModelUrl = result.modelImageUrl
                setModelImageUrl(currentModelUrl)
            } catch {
                setError("Storage error!")
                setViewState("error")
                return
            }
        }

        if (!garmentUrl) {
            setError("No product image found!")
            setViewState("error")
            return
        }

        setViewState("loading")
        setError(null)

        try {
            console.log("[Pho Video] Calling Try-on API...")

            // Task 1: Normalize URL
            const absoluteGarmentUrl = new URL(garmentUrl, document.baseURI).href

            // Convert garment image to base64 on client to bypass anti-hotlinking
            console.log("[Pho Video] Fetching garment image...")
            let garmentBase64: string
            try {
                const imgResponse = await fetch(absoluteGarmentUrl)
                if (!imgResponse.ok) throw new Error("Failed to fetch garment image")
                const blob = await imgResponse.blob()
                garmentBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                })
                console.log("[Pho Video] Garment image converted to base64")
            } catch (fetchErr) {
                console.error("[Pho Video] Failed to fetch garment, using URL:", fetchErr)
                garmentBase64 = absoluteGarmentUrl // Fallback to URL
            }

            // Task 2: Debug Log
            console.log('Payload:', {
                modelImage: currentModelUrl ? currentModelUrl.substring(0, 50) + "..." : null,
                garmentImage: garmentBase64.substring(0, 80) + "..."
            })

            const response = await fetch(`${API_BASE}${API_PATH}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelImageUrl: currentModelUrl,
                    garmentImageUrl: garmentBase64,
                    garmentType: "auto"
                })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `Server error: ${response.status}`)
            }

            const data = await response.json()
            console.log("[Pho Video] API Response:", data)

            const resultUrl = data.imageUrl || data.imageUrls?.[0] || data.result?.imageUrl
            if (resultUrl) {
                setResultImage(resultUrl)
                setViewState("result")
            } else {
                throw new Error("No result from API")
            }
        } catch (err) {
            console.error("[Pho Video] API Error:", err)
            setError(err instanceof Error ? err.message : "Unknown error")
            setViewState("error")
        }
    }, [modelImageUrl, garmentUrl])

    const handleReset = () => {
        setViewState("idle")
        setResultImage(null)
        setError(null)
    }

    if (!garmentUrl) return null

    const btnStyle: React.CSSProperties = garmentElement && position ? {
        position: "fixed",
        top: Math.max(20, position.top + 15),
        left: Math.max(20, position.left + 15),
        zIndex: 2147483647
    } : {
        position: "fixed",
        bottom: 100,
        right: 30,
        zIndex: 2147483647
    }

    const overlayStyle: React.CSSProperties = position ? {
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        zIndex: 2147483646
    } : {}

    return (
        <>
            {viewState === "idle" && (
                <button onClick={handleTryOn} style={btnStyle} className="pho-btn">
                    Try On Free
                </button>
            )}

            {viewState === "loading" && position && (
                <div style={overlayStyle} className="pho-overlay">
                    <div className="pho-spinner" />
                    <p style={{ color: "white", fontWeight: 600, margin: 0, fontSize: 17 }}>Processing AI...</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 8 }}>Pho Video Virtual Try-on</p>
                    <div className="pho-progress">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            )}

            {viewState === "result" && resultImage && position && (
                <div style={overlayStyle} className="pho-result">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultImage} alt="Try-on result" />
                    <div className="pho-result-badge">
                        Pho Video AI
                    </div>
                    <div className="pho-actions">
                        <button className="primary" onClick={() => window.open(resultImage, "_blank")}>Download</button>
                        <button className="secondary" onClick={handleReset}>Try Again</button>
                    </div>
                </div>
            )}

            {viewState === "error" && (
                <div style={btnStyle} className="pho-error">
                    <p style={{ fontWeight: 700, margin: "0 0 12px 0", fontSize: 16 }}>Error</p>
                    <p style={{ fontSize: 13, margin: "0 0 16px 0", opacity: 0.85, lineHeight: 1.5 }}>{error}</p>
                    <button onClick={handleReset} style={{
                        width: "100%", padding: 12, background: "white", color: "#991B1B",
                        border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer",
                        transition: "transform 0.2s"
                    }}>Close</button>
                </div>
            )}
        </>
    )
}

export default TryOnOverlay
