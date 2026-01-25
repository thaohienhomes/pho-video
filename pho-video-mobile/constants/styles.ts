export interface StylePreset {
    id: string;
    labelKey: string; // Translation key
    category: 'cinematic' | 'animation' | 'art' | 'mood';
    promptModifier: string;
    descriptionKey: string;
}

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: 'none',
        labelKey: 'style_none',
        category: 'cinematic',
        promptModifier: '',
        descriptionKey: 'style_none_desc'
    },
    {
        id: 'cinematic_film',
        labelKey: 'style_cinematic',
        category: 'cinematic',
        promptModifier: 'cinematic film still, high dynamic range, detailed textures, professional color grading, anamorphic lens flares, 8k resolution',
        descriptionKey: 'style_cinematic_desc'
    },
    {
        id: 'studio_ghibli',
        labelKey: 'style_ghibli',
        category: 'animation',
        promptModifier: 'studio ghibli style, hand-drawn animation, lush landscapes, soft lighting, whimsical atmosphere, vibrant cel shaded colors',
        descriptionKey: 'style_ghibli_desc'
    },
    {
        id: 'cyberpunk_neon',
        labelKey: 'style_cyberpunk',
        category: 'cinematic',
        promptModifier: 'cyberpunk aesthetic, futuristic city, neon lights, rainy night, synthwave colors, volumetric fog, blade runner inspired',
        descriptionKey: 'style_cyberpunk_desc'
    },
    {
        id: 'pixar_3d',
        labelKey: 'style_pixar',
        category: 'animation',
        promptModifier: '3d animation style, pixar inspired, cute characters, ray traced lighting, subsurface scattering, toy story aesthetic',
        descriptionKey: 'style_pixar_desc'
    },
    {
        id: 'vintage_16mm',
        labelKey: 'style_vintage',
        category: 'mood',
        promptModifier: 'vintage 16mm film, grainy texture, light leaks, nostalgic atmosphere, desaturated colors, retro vibes',
        descriptionKey: 'style_vintage_desc'
    },
    {
        id: 'noir_bw',
        labelKey: 'style_noir',
        category: 'mood',
        promptModifier: 'film noir style, black and white, dramatic shadows, high contrast, moody lighting, smoke and mirrors',
        descriptionKey: 'style_noir_desc'
    },
    {
        id: 'oil_painting',
        labelKey: 'style_oil',
        category: 'art',
        promptModifier: 'oil painting style, visible brushstrokes, rich textures, van gogh inspired, artistic expression, masterpiece',
        descriptionKey: 'style_oil_desc'
    },
    {
        id: 'unreal_engine_5',
        labelKey: 'style_ue5',
        category: 'cinematic',
        promptModifier: 'hyper-realistic, unreal engine 5, octane render, photorealistic, cinematic lighting, ultra-detailed, 8k',
        descriptionKey: 'style_ue5_desc'
    }
];

export type StyleCategory = 'all' | 'cinematic' | 'animation' | 'art' | 'mood';
