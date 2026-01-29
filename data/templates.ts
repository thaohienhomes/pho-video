// Curated Templates & Style Presets for Phở Video

export interface Template {
    id: string
    title: string
    prompt: string
    category: TemplateCategory
    thumbnail?: string
    creditCost: number
    duration: string
    tags: string[]
    featured?: boolean
    popularity?: number
}

export interface StylePreset {
    id: string
    name: string
    keywords: string[]
    description: string
    thumbnail?: string
    category: "cinematic" | "artistic" | "minimal" | "vibrant"
}

export type TemplateCategory =
    | "cinematic"
    | "anime"
    | "nature"
    | "product"
    | "abstract"
    | "portrait"
    | "scifi"
    | "fantasy"

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
    { id: "cinematic", label: "Cinematic", icon: "🎬" },
    { id: "anime", label: "Anime", icon: "✨" },
    { id: "nature", label: "Nature", icon: "🌿" },
    { id: "product", label: "Product", icon: "📦" },
    { id: "abstract", label: "Abstract", icon: "🎨" },
    { id: "portrait", label: "Portrait", icon: "👤" },
    { id: "scifi", label: "Sci-Fi", icon: "🚀" },
    { id: "fantasy", label: "Fantasy", icon: "🐉" },
]

export const TEMPLATES: Template[] = [
    // Cinematic
    {
        id: "cin-001",
        title: "Cyberpunk City Night",
        prompt: "A bustling cyberpunk city at night, neon lights reflecting off wet streets, flying cars passing by, cinematic aerial shot, moody atmosphere, 8K quality",
        category: "cinematic",
        creditCost: 500,
        duration: "5s",
        tags: ["cyberpunk", "city", "night", "neon"],
        featured: true,
        popularity: 98,
    },
    {
        id: "cin-002",
        title: "Epic Desert Sunset",
        prompt: "Dramatic desert landscape at golden hour, massive sand dunes, warm orange and purple sky, drone shot slowly rising, cinematic color grading",
        category: "cinematic",
        creditCost: 500,
        duration: "5s",
        tags: ["desert", "sunset", "landscape"],
        popularity: 85,
    },
    {
        id: "cin-003",
        title: "Underwater Dance",
        prompt: "Elegant dancer floating underwater, flowing silk dress, rays of light from above, slow motion, ethereal and dreamy atmosphere",
        category: "cinematic",
        creditCost: 750,
        duration: "5s",
        tags: ["underwater", "dance", "ethereal"],
        popularity: 92,
    },

    // Anime
    {
        id: "ani-001",
        title: "Cherry Blossom Walk",
        prompt: "Anime girl walking under cherry blossom trees, petals falling gently, soft pink lighting, Studio Ghibli style, peaceful spring day",
        category: "anime",
        creditCost: 500,
        duration: "5s",
        tags: ["anime", "sakura", "ghibli"],
        featured: true,
        popularity: 96,
    },
    {
        id: "ani-002",
        title: "Mecha Battle",
        prompt: "Giant mecha robot in epic battle, explosions and energy beams, dynamic camera angles, anime style, detailed mechanical design",
        category: "anime",
        creditCost: 750,
        duration: "5s",
        tags: ["mecha", "action", "battle"],
        popularity: 88,
    },
    {
        id: "ani-003",
        title: "Magical Girl Transform",
        prompt: "Magical girl transformation sequence, sparkling effects, flowing ribbons, colorful energy burst, anime style, dynamic motion",
        category: "anime",
        creditCost: 500,
        duration: "5s",
        tags: ["magical", "transform", "sparkle"],
        popularity: 90,
    },

    // Nature
    {
        id: "nat-001",
        title: "Ocean Waves Sunrise",
        prompt: "Crystal clear ocean waves crashing on beach at sunrise, golden light, spray particles, slow motion, peaceful and serene",
        category: "nature",
        creditCost: 500,
        duration: "5s",
        tags: ["ocean", "waves", "sunrise"],
        featured: true,
        popularity: 94,
    },
    {
        id: "nat-002",
        title: "Forest Morning Mist",
        prompt: "Ancient forest with morning mist, rays of sunlight through trees, moss-covered ground, birds flying, mystical atmosphere",
        category: "nature",
        creditCost: 500,
        duration: "5s",
        tags: ["forest", "mist", "morning"],
        popularity: 87,
    },
    {
        id: "nat-003",
        title: "Northern Lights Dance",
        prompt: "Aurora borealis dancing in night sky, vibrant green and purple colors, snow-covered mountains below, timelapse style",
        category: "nature",
        creditCost: 750,
        duration: "5s",
        tags: ["aurora", "night", "arctic"],
        popularity: 91,
    },

    // Product
    {
        id: "pro-001",
        title: "Luxury Watch Reveal",
        prompt: "Premium luxury watch spinning slowly, studio lighting, reflective surface, particles of light, elegant reveal animation",
        category: "product",
        creditCost: 500,
        duration: "5s",
        tags: ["product", "luxury", "watch"],
        featured: true,
        popularity: 89,
    },
    {
        id: "pro-002",
        title: "Smartphone Showcase",
        prompt: "Modern smartphone floating and rotating, gradient background, sleek reflections, feature highlights appearing, tech advertisement style",
        category: "product",
        creditCost: 500,
        duration: "5s",
        tags: ["phone", "tech", "showcase"],
        popularity: 84,
    },

    // Abstract
    {
        id: "abs-001",
        title: "Liquid Metal Flow",
        prompt: "Liquid chrome metal flowing and morphing, iridescent colors, smooth organic motion, abstract art, satisfying loop",
        category: "abstract",
        creditCost: 500,
        duration: "5s",
        tags: ["abstract", "liquid", "chrome"],
        featured: true,
        popularity: 93,
    },
    {
        id: "abs-002",
        title: "Geometric Patterns",
        prompt: "Mesmerizing geometric patterns transforming, sacred geometry, rainbow gradients, hypnotic motion, seamless loop",
        category: "abstract",
        creditCost: 500,
        duration: "5s",
        tags: ["geometric", "patterns", "hypnotic"],
        popularity: 86,
    },

    // Sci-Fi
    {
        id: "sci-001",
        title: "Space Station Orbit",
        prompt: "Massive space station orbiting Earth, stars twinkling in background, shuttle approaching, cinematic sci-fi, realistic lighting",
        category: "scifi",
        creditCost: 750,
        duration: "5s",
        tags: ["space", "station", "orbit"],
        featured: true,
        popularity: 95,
    },
    {
        id: "sci-002",
        title: "Robot Factory",
        prompt: "Futuristic robot assembly line, sparks flying, mechanical arms moving, sci-fi industrial, blue and orange lighting",
        category: "scifi",
        creditCost: 500,
        duration: "5s",
        tags: ["robot", "factory", "industrial"],
        popularity: 83,
    },

    // Fantasy
    {
        id: "fan-001",
        title: "Dragon Flight",
        prompt: "Majestic dragon soaring through clouds, scales catching sunlight, powerful wings, epic fantasy, dynamic camera following",
        category: "fantasy",
        creditCost: 750,
        duration: "5s",
        tags: ["dragon", "fantasy", "epic"],
        featured: true,
        popularity: 97,
    },
    {
        id: "fan-002",
        title: "Enchanted Castle",
        prompt: "Magical castle floating in sky, waterfalls cascading, glowing crystals, fantasy landscape, ethereal lighting",
        category: "fantasy",
        creditCost: 500,
        duration: "5s",
        tags: ["castle", "magic", "floating"],
        popularity: 88,
    },
]

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: "style-noir",
        name: "Film Noir",
        keywords: ["high contrast", "black and white", "dramatic shadows", "cinematic noir"],
        description: "Classic black & white with dramatic shadows",
        category: "cinematic",
    },
    {
        id: "style-vibrant",
        name: "Vibrant Pop",
        keywords: ["vibrant colors", "saturated", "bold", "pop art style"],
        description: "Bold, saturated colors that pop",
        category: "vibrant",
    },
    {
        id: "style-pastel",
        name: "Soft Pastel",
        keywords: ["soft pastel colors", "dreamy", "ethereal", "gentle lighting"],
        description: "Soft, dreamy pastel tones",
        category: "artistic",
    },
    {
        id: "style-cinematic",
        name: "Hollywood Epic",
        keywords: ["cinematic", "anamorphic lens flares", "epic scale", "movie quality"],
        description: "Blockbuster movie aesthetic",
        category: "cinematic",
    },
    {
        id: "style-anime",
        name: "Anime Style",
        keywords: ["anime style", "cel shading", "Japanese animation", "vibrant"],
        description: "Classic Japanese anime look",
        category: "artistic",
    },
    {
        id: "style-retro",
        name: "Retro VHS",
        keywords: ["VHS grain", "retro", "80s aesthetic", "scan lines", "vintage"],
        description: "Nostalgic 80s VHS effect",
        category: "artistic",
    },
    {
        id: "style-minimal",
        name: "Clean Minimal",
        keywords: ["clean", "minimal", "white background", "simple", "elegant"],
        description: "Simple and clean aesthetic",
        category: "minimal",
    },
    {
        id: "style-neon",
        name: "Neon Glow",
        keywords: ["neon lights", "glowing", "cyberpunk", "pink and blue neon"],
        description: "Vibrant neon light effects",
        category: "vibrant",
    },
]

// Helper functions
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
    return TEMPLATES.filter(t => t.category === category)
}

export function getFeaturedTemplates(): Template[] {
    return TEMPLATES.filter(t => t.featured).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
}

export function getPopularTemplates(limit = 8): Template[] {
    return [...TEMPLATES].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, limit)
}

export function applyStyleToPrompt(prompt: string, style: StylePreset): string {
    const styleModifier = style.keywords.join(", ")
    return `${prompt}, ${styleModifier}`
}
