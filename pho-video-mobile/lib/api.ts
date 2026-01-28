import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: ALWAYS use production URL for testing
// Local development should use Expo Go with tunneling or ngrok
const LOCAL_IP = "192.168.1.228"; // Not used currently

// Force production URL for reliable testing
// Set USE_LOCAL_API to true ONLY when testing with local Next.js server
const USE_LOCAL_API = false;

export const API_BASE_URL = USE_LOCAL_API
    ? `http://${LOCAL_IP}:3000/api`
    : "https://pho-video.vercel.app/api";

console.log("[API] Using base URL:", API_BASE_URL);

const STORAGE_KEYS = {
    AUTH_TOKEN: "pho_auth_token",
    USER_DATA: "pho_user_data",
};

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    credits: number;
    plan: string;
}

export interface Video {
    id: string;
    prompt: string;
    status: "pending" | "processing" | "ready" | "failed" | "success";
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    model: string;
    createdAt: string;
    taskId?: string; // ID để polling trạng thái
    imageUrl?: string; // For images
}

export interface GenerateVideoParams {
    prompt: string;
    model?: string;
    aspectRatio?: "16:9" | "9:16" | "1:1";
    image?: string;
    controlImage?: string;
    controlType?: 'pose' | 'depth';
    duration?: number;
    style?: string;
}

// Axios Instance with timeout
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Extended timeout client for AI-heavy operations (enhance, preview)
const aiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 45000, // 45 seconds for AI operations
    headers: {
        "Content-Type": "application/json",
    },
});

// Apply same interceptors to AI client
aiClient.interceptors.request.use(async (config) => {
    const token = "dev_bypass_token";
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[AI API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

aiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`[AI API Error] ${error.config?.url}:`, {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
        });
        return Promise.reject(error);
    }
);

// Interceptor để thêm token
apiClient.interceptors.request.use(async (config) => {
    // 👇 Dev bypass token for mobile testing
    const token = "dev_bypass_token";

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: !!config.headers.Authorization,
    });

    return config;
});

// Response interceptor for error logging
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`[API Error] ${error.config?.url}:`, {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
        });
        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    async login(email: string, password: string) {
        const { data } = await apiClient.post("/auth/login", { email, password });
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        return data;
    },

    async logout() {
        await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    },

    // Videos
    async generateVideo(params: GenerateVideoParams): Promise<Video> {
        const { data } = await apiClient.post("/video/generate", params);
        return data;
    },

    async getVideos(): Promise<Video[]> {
        const { data } = await apiClient.get<Video[]>("/video/feed");
        return data;
    },

    async getVideoStatus(taskId: string): Promise<Video> {
        const { data } = await apiClient.get<any>(`/video/status/${taskId}`);
        return data;
    },

    async deleteVideo(id: string) {
        await apiClient.delete(`/videos/${id}`);
    },

    async getTrendingVideos(): Promise<Partial<Idea>[]> {
        const { data } = await apiClient.get<IdeasResponse>("/ideas?page=1&limit=10");
        // Transform to match VideoCard expected format
        return data.data.map((idea: Idea) => ({
            id: idea.id,
            prompt: idea.prompt,
            thumbnailUrl: idea.thumbnail || idea.videoUrl,
            videoUrl: idea.videoUrl,
            duration: 5,
            model: idea.modelId || 'kling',
            category: idea.category,
            tags: idea.tags,
            title: idea.title,
        }));
    },

    async getIdeasByCategory(category: string): Promise<Partial<Idea>[]> {
        const categoryParam = category === 'All' ? '' : `&category=${encodeURIComponent(category)}`;
        const { data } = await apiClient.get<IdeasResponse>(`/ideas?page=1&limit=20${categoryParam}`);
        return data.data.map((idea: Idea) => ({
            id: idea.id,
            prompt: idea.prompt,
            thumbnailUrl: idea.thumbnail || idea.videoUrl,
            videoUrl: idea.videoUrl,
            duration: 5,
            model: idea.modelId || 'kling',
            category: idea.category,
            tags: idea.tags,
            title: idea.title,
        }));
    },

    // Credits
    async getCredits() {
        const { data } = await apiClient.get("/user/me");
        return data;
    },

    // Config
    async getAppConfig() {
        const { data } = await apiClient.get("/config");
        return data;
    },

    // AI
    async enhancePrompt(prompt: string): Promise<{ enhancedPrompt: string }> {
        console.log("[Enhance] Starting prompt enhancement...");
        try {
            const { data } = await aiClient.post("/ai/enhance", { prompt });
            console.log("[Enhance] Response received:", data);

            if (!data?.enhancedPrompt) {
                console.warn("[Enhance] Invalid response structure:", data);
                throw new Error("Invalid response from enhance API");
            }

            return { enhancedPrompt: data.enhancedPrompt };
        } catch (error: any) {
            console.error("[Enhance] Error:", error.message);
            // Provide more specific error messages
            if (error.code === 'ECONNABORTED') {
                throw new Error("Enhancement timed out. Please try again.");
            }
            throw error;
        }
    },

    async instantPreview(prompt: string): Promise<{ imageUrl: string; rateLimitRemaining?: number }> {
        console.log("[Preview] Generating instant preview for:", prompt.substring(0, 30), "...");
        try {
            const { data, headers } = await aiClient.post("/preview/instant", { prompt });
            console.log("[Preview] Response received:", { hasImageUrl: !!data?.imageUrl, success: data?.success });

            if (!data?.imageUrl) {
                console.warn("[Preview] Missing imageUrl in response:", data);
                throw new Error("Preview generation failed - no image returned");
            }

            return {
                imageUrl: data.imageUrl,
                rateLimitRemaining: headers["x-ratelimit-remaining"]
                    ? parseInt(headers["x-ratelimit-remaining"])
                    : undefined
            };
        } catch (error: any) {
            console.error("[Preview] Error:", error.message);
            if (error.response?.status === 429) {
                throw new Error("Too many preview requests. Please wait.");
            }
            throw error;
        }
    },

    // Avatars
    async getAvatars(): Promise<Avatar[]> {
        const { data } = await apiClient.get<Avatar[]>("/avatar/train");
        return data;
    },

    async startAvatarTraining(params: { name: string; images: string[] }) {
        const { data } = await apiClient.post("/avatar/train", params);
        return data;
    },

    async getAvatarStatus(id: string): Promise<Avatar> {
        const { data } = await apiClient.get<Avatar>(`/avatar/status/${id}`);
        return data;
    },

    async registerPushToken(token: string) {
        await apiClient.post("/user/push-token", { token });
    }
};

export interface Avatar {
    id: string;
    name: string;
    imageUrl?: string;
    modelUrl?: string;
    status: "TRAINING" | "READY" | "FAILED";
    createdAt: string;
}

export interface AppConfig {
    models: { id: string; name: string; description: string; isPro: boolean; badge?: string }[];
    aspectRatios: { id: string; label: string; icon: string }[];
    features: { enableUpscale: boolean; enableAudio: boolean; enableMotionControl: boolean };
}

// Ideas API Types (from Web App /api/ideas)
export interface Idea {
    id: string;
    title: string;
    thumbnail: string;
    videoUrl: string;
    videoPreview: string;
    prompt: string;
    modelId: string;
    aspectRatio: string;
    stylePreset: string;
    category: string;
    views: number;
    likes: number;
    cost: number;
    tags: string[];
    source: string;
    posterUrl?: string;
    // Transformed fields for mobile
    thumbnailUrl?: string;
    duration?: number;
    model?: string;
}

export interface IdeasResponse {
    success: boolean;
    data: Idea[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    meta: {
        categories: string[];
        baseUrl: string;
    };
}
