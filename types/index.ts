// Video generation types
export interface GenerateRequest {
    prompt: string;
    imageBase64?: string;  // Base64 encoded image for Image-to-Video mode
    duration: number;      // seconds (1-10)
    resolution: string;    // "480p" | "720p" | "1080p"
    aspectRatio?: string;  // "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9"
    seed?: number;
    model: string;         // Model ID
    includeAudio?: boolean; // New: optional audio generation
    motion?: number;       // New: motion intensity (1-10)
}

export interface GenerateResponse {
    videoUrl?: string;
    imageUrl?: string;
    imageUrls?: string[];
    status: "completed" | "processing" | "failed";
    requestId?: string;
    creditsUsed?: number;
    generationId?: string;
}

// Model providers (Updated with all Fal.AI tiers)
export type ModelProvider =
    | "wavespeed"
    | "fal"
    // Legacy
    | "pho-engine-cinematic"
    | "pho-engine-realistic"
    | "pho-engine-instant"
    // Fal.AI Standard Tier
    | "Kling 2.5 Pro via Fal.AI"
    | "Minimax Hailuo via Fal.AI"
    | "LTX-2 19B via Fal.AI"
    // Fal.AI Premium Tier (NEW)
    | "Google Veo 3.1 via Fal.AI"
    | "OpenAI Sora 2 via Fal.AI"
    // Fal.AI Fast Tier (NEW)
    | "ByteDance Seedance via Fal.AI";
export type CostTier = "low" | "medium" | "high";

export interface VideoModel {
    id: string;
    name: string;
    description: string;
    isAvailable: boolean;
    provider: ModelProvider;
    tag: string;           // Translated tag
    tagKey?: string;       // Original tag key for styling
    costTier: CostTier;
    creditCostPerSecond: number;
}

// Pricing types
export interface CreditPack {
    id: string;
    name: string;
    credits: number;
    price: number;
    priceDisplay: string;
    isPopular?: boolean;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    monthlyCredits: number;
    price: number;
    priceDisplay: string;
    features: string[];
    isPopular?: boolean;
}
