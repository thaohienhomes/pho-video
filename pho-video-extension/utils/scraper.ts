/**
 * Enhanced Product Scraper
 * Scrapes product images from e-commerce pages (both PDP and category pages)
 */

import { detectCategory, type WardrobeCategory } from "~storage/wardrobe"

export interface ScrapedProduct {
    imageUrl: string
    thumbnailUrl: string
    name: string
    brand: string
    category: WardrobeCategory
    sourceUrl: string
    sourcePage: string
    confidence: number
}

interface DetectedImage {
    url: string
    element: HTMLImageElement | null
    source: "og:image" | "largest-img" | "site-specific"
    confidence: number
}

// ============================================================================
// Utility Functions
// ============================================================================

function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url) return false
    if (url.startsWith("data:image/gif")) return false
    if (url.startsWith("data:image/svg")) return false
    if (url.length < 100 && url.startsWith("data:")) return false
    return true
}

function getAbsoluteUrl(url: string): string {
    try {
        return new URL(url, document.baseURI).href
    } catch {
        return url
    }
}

function getBrandFromHostname(): string {
    const hostname = window.location.hostname.toLowerCase()

    if (hostname.includes("louisvuitton")) return "Louis Vuitton"
    if (hostname.includes("zara")) return "Zara"
    if (hostname.includes("hm.com") || hostname.includes("h&m")) return "H&M"
    if (hostname.includes("uniqlo")) return "Uniqlo"
    if (hostname.includes("nike")) return "Nike"
    if (hostname.includes("adidas")) return "Adidas"
    if (hostname.includes("gucci")) return "Gucci"
    if (hostname.includes("burberry")) return "Burberry"
    if (hostname.includes("prada")) return "Prada"
    if (hostname.includes("dior")) return "Dior"
    if (hostname.includes("hermes")) return "Hermès"
    if (hostname.includes("chanel")) return "Chanel"
    if (hostname.includes("mango")) return "Mango"
    if (hostname.includes("asos")) return "ASOS"
    if (hostname.includes("nordstrom")) return "Nordstrom"
    if (hostname.includes("shopee")) return "Shopee"
    if (hostname.includes("lazada")) return "Lazada"

    // Extract from hostname
    const parts = hostname.replace("www.", "").split(".")
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
}

function getPageTitle(): string {
    // Try to get a short page identifier
    const title = document.title || ""
    // Remove brand name and common suffixes
    return title
        .replace(/\s*[-|•]\s*.*/g, "")
        .replace(/official site/i, "")
        .trim()
        .substring(0, 50) || "Unknown Page"
}

// ============================================================================
// Single Product Detection (for PDP pages)
// ============================================================================

export function detectMainProductImage(): DetectedImage | null {
    console.log("[Phở Video] Scanning for product image...")

    const hostname = window.location.hostname.toLowerCase()

    // Louis Vuitton specific
    if (hostname.includes("louisvuitton")) {
        console.log("[Phở Video] Detected Louis Vuitton site")
        const lvSelectors = [
            ".lv-product-image img",
            ".pdp-main-image img",
            "[data-testid='product-image'] img",
            ".product-image img",
            ".pdp__image img",
            "picture.lv-product-image img",
            ".product-gallery img",
            "main img"
        ]

        for (const selector of lvSelectors) {
            const imgs = document.querySelectorAll(selector) as NodeListOf<HTMLImageElement>
            for (const img of Array.from(imgs)) {
                const candidateUrl = img.dataset.src || img.dataset.srcset || img.srcset || img.src
                const actualUrl = candidateUrl.split(" ")[0]

                if (isValidImageUrl(actualUrl) && img.width > 200 && img.height > 200) {
                    console.log("[Phở Video] Found LV image:", actualUrl.substring(0, 50))
                    return {
                        url: getAbsoluteUrl(actualUrl),
                        element: img,
                        source: "site-specific",
                        confidence: 0.95
                    }
                }
            }
        }
    }

    // Zara specific
    if (hostname.includes("zara")) {
        const zaraSelectors = [
            ".media-image__image",
            ".product-detail-image img",
            "[data-testid='product-image'] img"
        ]
        for (const selector of zaraSelectors) {
            const img = document.querySelector(selector) as HTMLImageElement
            if (img && isValidImageUrl(img.src)) {
                return {
                    url: getAbsoluteUrl(img.src),
                    element: img,
                    source: "site-specific",
                    confidence: 0.9
                }
            }
        }
    }

    // Check Open Graph meta tag
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
        const content = ogImage.getAttribute("content")
        if (isValidImageUrl(content)) {
            return {
                url: getAbsoluteUrl(content!),
                element: null,
                source: "og:image",
                confidence: 0.85
            }
        }
    }

    // Find the largest visible image
    const images = Array.from(document.querySelectorAll("img")) as HTMLImageElement[]
    let largestImage: HTMLImageElement | null = null
    let largestArea = 0

    for (const img of images) {
        const src = img.dataset.src || img.src
        if (!isValidImageUrl(src)) continue
        if (img.naturalWidth < 200 || img.naturalHeight < 200) {
            if (img.width < 200 || img.height < 200) continue
        }

        const srcLower = src.toLowerCase()
        if (srcLower.includes("logo") || srcLower.includes("icon") || srcLower.includes("sprite")) continue
        if (srcLower.includes("transparent") || srcLower.includes("placeholder")) continue

        const rect = img.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight * 2) continue

        const area = img.width * img.height
        if (area > largestArea) {
            largestArea = area
            largestImage = img
        }
    }

    if (largestImage && largestArea > 40000) {
        const finalUrl = largestImage.dataset.src || largestImage.src
        return {
            url: getAbsoluteUrl(finalUrl),
            element: largestImage,
            source: "largest-img",
            confidence: 0.7
        }
    }

    return null
}

// ============================================================================
// Category Page Scraping (NEW - for Digital Wardrobe)
// ============================================================================

/**
 * Scrape ALL product images from a category/listing page
 */
export function scrapeAllProductImages(): ScrapedProduct[] {
    console.log("[Phở Video] Scraping all products from page...")

    const hostname = window.location.hostname.toLowerCase()
    const brand = getBrandFromHostname()
    const sourcePage = getPageTitle()
    const sourceUrl = window.location.href

    const products: ScrapedProduct[] = []
    const seenUrls = new Set<string>()

    // Site-specific selectors for product cards
    const productCardSelectors = getProductCardSelectors(hostname)

    for (const selector of productCardSelectors) {
        const cards = document.querySelectorAll(selector)
        console.log(`[Phở Video] Found ${cards.length} cards with selector: ${selector}`)

        cards.forEach((card) => {
            const product = extractProductFromCard(card as HTMLElement, brand, sourcePage, sourceUrl)
            if (product && !seenUrls.has(product.imageUrl)) {
                seenUrls.add(product.imageUrl)
                products.push(product)
            }
        })

        if (products.length > 0) break // Use first working selector
    }

    // Fallback: find all large product-like images
    if (products.length === 0) {
        console.log("[Phở Video] Using fallback image detection...")
        const images = findAllProductImages()
        images.forEach((img) => {
            if (!seenUrls.has(img.url)) {
                seenUrls.add(img.url)
                products.push({
                    imageUrl: img.url,
                    thumbnailUrl: img.url,
                    name: img.alt || "Product",
                    brand,
                    category: detectCategory(img.alt || "", img.url),
                    sourceUrl,
                    sourcePage,
                    confidence: 0.6
                })
            }
        })
    }

    console.log(`[Phở Video] Scraped ${products.length} products`)
    return products
}

function getProductCardSelectors(hostname: string): string[] {
    // Site-specific product card selectors
    if (hostname.includes("louisvuitton")) {
        return [
            "[data-testid='product-card']",
            ".lv-product-card",
            ".product-item",
            "article[class*='product']"
        ]
    }

    if (hostname.includes("zara")) {
        return [
            ".product-link",
            "[data-productid]",
            ".product-grid-product"
        ]
    }

    if (hostname.includes("hm.com")) {
        return [
            ".product-item",
            "[data-productid]",
            ".hm-product-item"
        ]
    }

    if (hostname.includes("uniqlo")) {
        return [
            ".product-tile",
            "[data-product-id]",
            ".pl-product"
        ]
    }

    if (hostname.includes("nike")) {
        return [
            ".product-card",
            "[data-testid='product-card']",
            ".product-grid__item"
        ]
    }

    // Generic selectors
    return [
        "[data-product]",
        "[data-productid]",
        ".product-card",
        ".product-item",
        ".product-tile",
        "article.product",
        ".product-grid-item",
        "[class*='ProductCard']",
        "[class*='product-card']"
    ]
}

function extractProductFromCard(card: HTMLElement, brand: string, sourcePage: string, sourceUrl: string): ScrapedProduct | null {
    // Find image
    const img = card.querySelector("img") as HTMLImageElement
    if (!img) return null

    const imageUrl = img.dataset.src || img.dataset.lazySrc || img.srcset?.split(" ")[0] || img.src
    if (!isValidImageUrl(imageUrl)) return null

    // Find product name
    const nameEl = card.querySelector("[class*='name'], [class*='title'], h2, h3, h4, .product-name, .product-title")
    const name = nameEl?.textContent?.trim() || img.alt || "Product"

    // Get absolute URL
    const absoluteUrl = getAbsoluteUrl(imageUrl)

    return {
        imageUrl: absoluteUrl,
        thumbnailUrl: absoluteUrl,
        name: name.substring(0, 100),
        brand,
        category: detectCategory(name, absoluteUrl),
        sourceUrl,
        sourcePage,
        confidence: 0.85
    }
}

function findAllProductImages(): { url: string; alt: string }[] {
    const results: { url: string; alt: string }[] = []
    const images = document.querySelectorAll("img") as NodeListOf<HTMLImageElement>

    images.forEach((img) => {
        const src = img.dataset.src || img.src
        if (!isValidImageUrl(src)) return

        // Filter out small images, icons, logos
        if (img.width < 100 || img.height < 100) return

        const srcLower = src.toLowerCase()
        if (srcLower.includes("logo") || srcLower.includes("icon")) return
        if (srcLower.includes("banner") || srcLower.includes("hero")) return
        if (srcLower.includes("sprite") || srcLower.includes("placeholder")) return

        // Check if in viewport or near
        const rect = img.getBoundingClientRect()
        if (rect.top > window.innerHeight * 3) return

        results.push({
            url: getAbsoluteUrl(src),
            alt: img.alt || ""
        })
    })

    return results
}

export function getImagePosition(element: HTMLImageElement | null): DOMRect | null {
    if (!element) return null
    return element.getBoundingClientRect()
}
