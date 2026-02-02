// Image Generation Templates - Phở Video
// Data source: Curated prompts with beautiful results
// Future: User submissions via API

export interface ImageTemplate {
    id: string;
    name: string;
    nameVi: string;
    thumbnail: string; // Will be generated/scraped
    prompt: string;
    negativePrompt?: string;
    category: 'portrait' | 'landscape' | 'anime' | 'abstract' | 'fantasy' | 'scifi';
    model?: string;
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
    usageCount: number;
    isTrending: boolean;
    tags: string[];
}

export const IMAGE_TEMPLATES: ImageTemplate[] = [
    // ===== PORTRAIT =====
    {
        id: 'cyberpunk-portrait-01',
        name: 'Cyberpunk Portrait',
        nameVi: 'Chân dung Cyberpunk',
        thumbnail: '/images/templates/cyberpunk-portrait.webp',
        prompt: 'Cinematic portrait of a cyberpunk woman with neon lights, rain reflections, futuristic city background, ultra detailed, 8k, dramatic lighting, blade runner style',
        negativePrompt: 'blurry, low quality, cartoon',
        category: 'portrait',
        aspectRatio: '9:16',
        usageCount: 2543,
        isTrending: true,
        tags: ['cyberpunk', 'neon', 'portrait', 'futuristic']
    },
    {
        id: 'elegant-fashion-01',
        name: 'Elegant Fashion',
        nameVi: 'Thời trang Sang trọng',
        thumbnail: '/images/templates/elegant-fashion.webp',
        prompt: 'High fashion editorial portrait, elegant woman in luxury dress, soft studio lighting, vogue magazine style, professional photography, shallow depth of field',
        category: 'portrait',
        aspectRatio: '9:16',
        usageCount: 1892,
        isTrending: true,
        tags: ['fashion', 'elegant', 'studio', 'editorial']
    },

    // ===== LANDSCAPE =====
    {
        id: 'sunset-landscape-01',
        name: 'Golden Sunset',
        nameVi: 'Hoàng hôn Vàng',
        thumbnail: '/images/templates/sunset-landscape.webp',
        prompt: 'Breathtaking sunset landscape, golden hour, dramatic clouds, mountain silhouette, reflection on calm lake, nature photography, ultra wide angle, 8k resolution',
        category: 'landscape',
        aspectRatio: '16:9',
        usageCount: 3201,
        isTrending: true,
        tags: ['sunset', 'nature', 'mountains', 'lake']
    },
    {
        id: 'winter-wonderland-01',
        name: 'Winter Wonderland',
        nameVi: 'Xứ sở Tuyết trắng',
        thumbnail: '/images/templates/winter-wonderland.webp',
        prompt: 'Magical winter forest, fresh snow on pine trees, soft morning light, misty atmosphere, fairy tale scene, cinematic composition, high detail',
        category: 'landscape',
        aspectRatio: '16:9',
        usageCount: 1756,
        isTrending: false,
        tags: ['winter', 'snow', 'forest', 'magical']
    },

    // ===== ANIME =====
    {
        id: 'anime-warrior-01',
        name: 'Anime Warrior',
        nameVi: 'Chiến binh Anime',
        thumbnail: '/images/templates/anime-warrior.webp',
        prompt: 'Epic anime warrior character, dynamic pose, glowing sword, flowing cape, detailed armor, dramatic backlight, studio ghibli meets demon slayer style, vibrant colors',
        category: 'anime',
        aspectRatio: '1:1',
        usageCount: 4521,
        isTrending: true,
        tags: ['anime', 'warrior', 'fantasy', 'action']
    },
    {
        id: 'anime-girl-sakura-01',
        name: 'Sakura Dreams',
        nameVi: 'Mộng Hoa Anh Đào',
        thumbnail: '/images/templates/anime-sakura.webp',
        prompt: 'Beautiful anime girl under cherry blossom tree, petals falling, soft pink sunset, school uniform, peaceful expression, high quality anime art, makoto shinkai style',
        category: 'anime',
        aspectRatio: '9:16',
        usageCount: 5102,
        isTrending: true,
        tags: ['anime', 'sakura', 'peaceful', 'romantic']
    },

    // ===== FANTASY =====
    {
        id: 'fantasy-creature-01',
        name: 'Mystical Dragon',
        nameVi: 'Rồng Huyền Bí',
        thumbnail: '/images/templates/fantasy-dragon.webp',
        prompt: 'Majestic dragon perched on ancient castle ruins, moonlit night, glowing eyes, scales reflecting starlight, epic fantasy scene, detailed digital painting, 8k',
        category: 'fantasy',
        aspectRatio: '16:9',
        usageCount: 2876,
        isTrending: true,
        tags: ['dragon', 'fantasy', 'epic', 'night']
    },
    {
        id: 'enchanted-forest-01',
        name: 'Enchanted Forest',
        nameVi: 'Rừng Phép thuật',
        thumbnail: '/images/templates/enchanted-forest.webp',
        prompt: 'Mystical enchanted forest, glowing mushrooms, fairy lights, ancient trees with luminescent leaves, magical atmosphere, fantasy concept art, ultra detailed',
        category: 'fantasy',
        aspectRatio: '1:1',
        usageCount: 1923,
        isTrending: false,
        tags: ['forest', 'magical', 'fairy', 'mystical']
    },

    // ===== SCI-FI =====
    {
        id: 'synthwave-city-01',
        name: 'Synthwave City',
        nameVi: 'Thành phố Synthwave',
        thumbnail: '/images/templates/synthwave-city.webp',
        prompt: 'Retro futuristic synthwave cityscape, neon purple and pink lights, chrome buildings, flying cars, 80s aesthetic, retrofuturism, vaporwave style, stunning detail',
        category: 'scifi',
        aspectRatio: '16:9',
        usageCount: 3654,
        isTrending: true,
        tags: ['synthwave', 'retro', 'neon', 'city']
    },
    {
        id: 'space-explorer-01',
        name: 'Space Explorer',
        nameVi: 'Nhà thám hiểm Vũ trụ',
        thumbnail: '/images/templates/space-explorer.webp',
        prompt: 'Astronaut standing on alien planet surface, massive ringed planet in sky, bioluminescent alien flora, epic sci-fi scene, cinematic lighting, NASA meets art',
        category: 'scifi',
        aspectRatio: '16:9',
        usageCount: 2198,
        isTrending: false,
        tags: ['space', 'astronaut', 'alien', 'exploration']
    },

    // ===== ABSTRACT =====
    {
        id: 'abstract-flow-01',
        name: 'Fluid Dreams',
        nameVi: 'Giấc mơ Chảy tràn',
        thumbnail: '/images/templates/abstract-flow.webp',
        prompt: 'Abstract fluid art, swirling colors of purple and gold, marble texture, liquid metal effect, mesmerizing patterns, high resolution, digital abstract art',
        category: 'abstract',
        aspectRatio: '1:1',
        usageCount: 1456,
        isTrending: false,
        tags: ['abstract', 'fluid', 'colorful', 'modern']
    },
    {
        id: 'geometric-neon-01',
        name: 'Neon Geometry',
        nameVi: 'Hình học Neon',
        thumbnail: '/images/templates/geometric-neon.webp',
        prompt: 'Abstract geometric composition, neon colored shapes, dark background, glowing edges, 3D render, futuristic design, clean lines, vibrant electric colors',
        category: 'abstract',
        aspectRatio: '1:1',
        usageCount: 1234,
        isTrending: false,
        tags: ['geometric', 'neon', 'abstract', '3d']
    }
];

// Category labels for UI
export const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All', labelVi: 'Tất cả' },
    { id: 'portrait', label: 'Portrait', labelVi: 'Chân dung' },
    { id: 'landscape', label: 'Landscape', labelVi: 'Phong cảnh' },
    { id: 'anime', label: 'Anime', labelVi: 'Anime' },
    { id: 'fantasy', label: 'Fantasy', labelVi: 'Kỳ ảo' },
    { id: 'scifi', label: 'Sci-Fi', labelVi: 'Khoa học viễn tưởng' },
    { id: 'abstract', label: 'Abstract', labelVi: 'Trừu tượng' },
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]['id'];
