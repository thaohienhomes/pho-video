import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// HƯỚNG DẪN LẤY IP LAN (Windows):
// 1. Mở Command Prompt (cmd)
// 2. Gõ 'ipconfig'
// 3. Tìm dòng 'IPv4 Address' (ví dụ: 192.168.1.15)
// 4. Thay thế vào biến LOCAL_IP bên dưới

const LOCAL_IP = "192.168.1.228"; // <-- THAY ĐỔI IP CỦA BẠN TẠI ĐÂY

export const API_BASE_URL = __DEV__
    ? `http://${LOCAL_IP}:3000/api`
    : "https://pho-video.vercel.app/api";

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

// Axios Instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để thêm token
apiClient.interceptors.request.use(async (config) => {
    // const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    // 👇 SỬA TẠM THÀNH DÒNG NÀY ĐỂ TEST:
    const token = "dev_bypass_token";

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        const { data } = await apiClient.post("/ai/enhance", { prompt });
        return data;
    },

    async instantPreview(prompt: string): Promise<{ imageUrl: string; rateLimitRemaining?: number }> {
        const { data, headers } = await apiClient.post("/preview/instant", { prompt });
        return {
            imageUrl: data.imageUrl,
            rateLimitRemaining: headers["x-ratelimit-remaining"]
                ? parseInt(headers["x-ratelimit-remaining"])
                : undefined
        };
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
