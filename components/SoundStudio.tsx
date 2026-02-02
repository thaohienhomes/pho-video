"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import {
    Music,
    Mic,
    Volume2,
    Play,
    Pause,
    Loader2,
    Sparkles,
    Clock,
    ChevronDown,
    Download,
    Wand2,
    Video,
    Youtube,
    History,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { WaveformVisualizer } from "@/components/studio/WaveformVisualizer"

interface SoundStudioProps {
    videoUrl?: string  // Optional video to add audio to
    onMusicGenerated?: (audioUrl: string) => void
    onTTSGenerated?: (audioUrl: string) => void
}

// Audio history item
interface AudioHistoryItem {
    id: string
    audioUrl: string
    prompt: string
    style: string | null
    mood: string | null
    duration: number
    model: string
    hasLyrics: boolean
    createdAt: string
}

const HISTORY_KEY = "pho-audio-history"
const MAX_HISTORY = 20

// Music models configuration
const MUSIC_MODELS = [
    { id: "minimax", name: "MiniMax v2", description: "Full songs, versatile", cost: 30, supportsLyrics: false },
    { id: "elevenlabs", name: "ElevenLabs", description: "Premium quality", cost: 40, supportsLyrics: false },
    { id: "lyria2", name: "Lyria 2", description: "Google's music AI", cost: 35, supportsLyrics: false },
    { id: "ace-step", name: "ACE-Step", description: "Songs with lyrics!", cost: 25, supportsLyrics: true },
]

// Music style presets
const MUSIC_STYLES = [
    { id: "rock", label: "🎸 Rock", prompt: "rock music with electric guitars, powerful drums, and energetic rhythm" },
    { id: "rnb", label: "🎤 R&B", prompt: "smooth R&B music with soulful vocals, groovy bass, and modern beats" },
    { id: "jazz", label: "🎷 Jazz", prompt: "jazz music with saxophone, piano, double bass, and swing rhythm" },
    { id: "edm", label: "🎧 EDM", prompt: "electronic dance music with synthesizers, heavy bass drops, and upbeat tempo" },
    { id: "classical", label: "🎻 Orchestra", prompt: "orchestral classical music with strings, brass, and grand cinematic feel" },
    { id: "bolero", label: "🎹 Bolero", prompt: "Vietnamese bolero ballad with emotional vocals, guitar, and nostalgic melody" },
    { id: "lofi", label: "🌙 Lo-Fi", prompt: "lo-fi chill beats with warm vinyl crackle, soft piano, and relaxing vibes" },
    { id: "hiphop", label: "🔥 Hip-Hop", prompt: "hip-hop trap beats with 808 bass, hi-hats, and modern urban sound" },
    { id: "pop", label: "✨ Pop", prompt: "catchy pop music with upbeat melody, synthesizers, and radio-friendly hooks" },
]

// Mood options
const MOOD_OPTIONS = [
    { id: "happy", label: "😊 Happy", modifier: "uplifting, joyful, and positive" },
    { id: "sad", label: "😢 Sad", modifier: "melancholic, emotional, and heartfelt" },
    { id: "energetic", label: "⚡ Energetic", modifier: "powerful, dynamic, and high-energy" },
    { id: "calm", label: "🌙 Calm", modifier: "relaxing, peaceful, and soothing" },
    { id: "epic", label: "🏆 Epic", modifier: "cinematic, dramatic, and grandiose" },
]

// TTS models configuration
const TTS_MODELS = [
    { id: "elevenlabs", name: "ElevenLabs v3", description: "Premium voices", cost: 5 },
    { id: "minimax", name: "MiniMax Speech", description: "HD quality", cost: 4 },
    { id: "chatterbox", name: "Chatterbox", description: "Multi-language", cost: 3 },
]

type StudioMode = "music" | "tts"

export function SoundStudio({ videoUrl, onMusicGenerated, onTTSGenerated }: SoundStudioProps) {
    const t = useTranslations("soundStudio")
    const tCommon = useTranslations("common")

    const [mode, setMode] = useState<StudioMode>("music")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    // Music state
    const [musicPrompt, setMusicPrompt] = useState("")
    const [musicModel, setMusicModel] = useState("minimax")
    const [musicDuration, setMusicDuration] = useState(30)
    const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null)
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
    const [selectedMood, setSelectedMood] = useState<string | null>(null)
    const [withLyrics, setWithLyrics] = useState(false)
    const [lyrics, setLyrics] = useState("")

    // Auto-select ACE-Step when lyrics mode is enabled
    const handleLyricsToggle = (enabled: boolean) => {
        setWithLyrics(enabled)
        if (enabled) {
            setMusicModel("ace-step")
        }
    }

    // TTS state
    const [ttsText, setTtsText] = useState("")
    const [ttsModel, setTtsModel] = useState("elevenlabs")
    const [generatedTTSUrl, setGeneratedTTSUrl] = useState<string | null>(null)

    // History state
    const [audioHistory, setAudioHistory] = useState<AudioHistoryItem[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [showQuickPublish, setShowQuickPublish] = useState(false)

    // Load history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(HISTORY_KEY)
        if (saved) {
            try {
                setAudioHistory(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load audio history:", e)
            }
        }
    }, [])

    // Save to history
    const saveToHistory = (audioUrl: string) => {
        const styleObj = MUSIC_STYLES.find(s => s.id === selectedStyle)
        const moodObj = MOOD_OPTIONS.find(m => m.id === selectedMood)

        const newItem: AudioHistoryItem = {
            id: Date.now().toString(),
            audioUrl,
            prompt: musicPrompt,
            style: styleObj?.label || null,
            mood: moodObj?.label || null,
            duration: musicDuration,
            model: musicModel,
            hasLyrics: withLyrics,
            createdAt: new Date().toISOString(),
        }

        const updated = [newItem, ...audioHistory].slice(0, MAX_HISTORY)
        setAudioHistory(updated)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    }

    // Delete from history
    const deleteFromHistory = (id: string) => {
        const updated = audioHistory.filter(item => item.id !== id)
        setAudioHistory(updated)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    }

    const handleGenerateMusic = async () => {
        // Build enhanced prompt from style + mood + user input
        let finalPrompt = musicPrompt.trim()
        const styleObj = MUSIC_STYLES.find(s => s.id === selectedStyle)
        const moodObj = MOOD_OPTIONS.find(m => m.id === selectedMood)

        if (styleObj && !finalPrompt) {
            finalPrompt = styleObj.prompt
        } else if (styleObj && finalPrompt) {
            finalPrompt = `${styleObj.prompt}, ${finalPrompt}`
        }

        if (moodObj) {
            finalPrompt = `${finalPrompt}, ${moodObj.modifier}`
        }

        if (!finalPrompt) return

        setIsGenerating(true)
        try {
            const response = await fetch("/api/ai/music", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    duration: musicDuration,
                    model: musicModel,
                    lyrics: withLyrics ? (lyrics.trim() || "[inst]") : undefined,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Music generation failed")
            }

            const data = await response.json()
            setGeneratedMusicUrl(data.audioUrl)
            saveToHistory(data.audioUrl)  // Save to history
            setShowQuickPublish(true)  // Show quick publish options
            onMusicGenerated?.(data.audioUrl)
        } catch (error) {
            console.error("Music generation error:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateTTS = async () => {
        if (!ttsText.trim()) return

        setIsGenerating(true)
        try {
            const response = await fetch("/api/ai/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: ttsText,
                    model: ttsModel,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "TTS generation failed")
            }

            const data = await response.json()
            setGeneratedTTSUrl(data.audioUrl)
            onTTSGenerated?.(data.audioUrl)
        } catch (error) {
            console.error("TTS generation error:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const selectedMusicModel = MUSIC_MODELS.find(m => m.id === musicModel)
    const selectedTTSModel = TTS_MODELS.find(m => m.id === ttsModel)
    const estimatedCost = mode === "music"
        ? Math.ceil(musicDuration / 30) * (selectedMusicModel?.cost || 30) * 1000
        : Math.max(5000, Math.ceil(ttsText.length / 1000) * (selectedTTSModel?.cost || 5) * 1000)

    return (
        <div className="w-full h-full flex flex-col rounded-[var(--pho-radius-xl)] bg-[#0D0D10] backdrop-blur-[var(--pho-blur-lg)] border border-[#8B5CF6]/20 overflow-hidden">
            {/* Header - Sound Studio X with Purple Theme */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#8B5CF6]/10 via-transparent to-[#8B5CF6]/5 border-b border-[#8B5CF6]/20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-[#8B5CF6]">♪</span>
                    SOUND STUDIO X
                    <span className="text-xs text-white/50 font-normal ml-2">AI Music Generation</span>
                </h2>
            </div>

            {/* 3-Column Layout: Left Controls + Center Content + Right History */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT SIDEBAR: Model Selection & Controls (Liquid Glass Style) */}
                <aside className="w-[200px] min-w-[200px] border-r border-[#8B5CF6]/30 bg-gradient-to-b from-[#0D0D15]/95 to-[#0A0A0F]/95 backdrop-blur-xl p-4 space-y-5 overflow-y-auto shadow-[inset_0_0_30px_rgba(139,92,246,0.05)]">
                    {/* Sound Studio X Label with Icon */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                        <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                            <Music className="w-5 h-5 text-[#8B5CF6]" />
                        </div>
                        <span className="text-sm font-bold text-white">Sound Studio X</span>
                    </div>

                    {/* MODEL SELECTION with Glowing Border */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            Model Selection
                        </label>
                        <Select value={musicModel} onValueChange={setMusicModel}>
                            <SelectTrigger className="bg-[#15151A]/80 backdrop-blur-sm border-white/10 hover:border-[#8B5CF6]/40 text-white text-sm transition-colors shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#15151A] border-white/10 backdrop-blur-xl">
                                {MUSIC_MODELS.map((model) => (
                                    <SelectItem
                                        key={model.id}
                                        value={model.id}
                                        className="text-white hover:bg-[#8B5CF6]/20 focus:bg-[#8B5CF6]/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{model.name}</span>
                                            <span className="text-xs text-white/40">
                                                {model.cost}K/30s
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DURATION with Red/Vermilion Slider Track (Matching Mockup) */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            Duration
                        </label>
                        <Slider
                            value={[musicDuration]}
                            onValueChange={([v]) => setMusicDuration(v)}
                            min={30}
                            max={180}
                            step={30}
                            className="py-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.range]:bg-gradient-to-r [&_.range]:from-primary [&_.range]:to-orange-500"
                        />
                        <div className="flex justify-between text-[10px] text-white/50">
                            <span className={cn(musicDuration >= 30 && "text-primary font-medium")}>30s</span>
                            <span className={cn(musicDuration >= 60 && "text-primary font-medium")}>60s</span>
                            <span className={cn(musicDuration >= 120 && "text-primary font-medium")}>120s</span>
                            <span className={cn(musicDuration >= 180 && "text-primary font-medium")}>180s</span>
                        </div>
                    </div>

                    {/* INSTRUMENTAL Toggle with Glowing Effect */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#15151A]/80 backdrop-blur-sm border border-white/10 hover:border-[#8B5CF6]/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <span className="text-sm font-medium text-white">Instrumental</span>
                            <span className="text-[10px] text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded">🎹</span>
                        </div>
                        <Switch
                            checked={!withLyrics}
                            onCheckedChange={(checked) => setWithLyrics(!checked)}
                            className="data-[state=checked]:bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        />
                    </div>
                </aside>

                {/* CENTER: Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Mode Tabs: AI Music / Text-to-Speech */}
                    <div className="flex items-center border-b border-white/10">
                        <button
                            onClick={() => setMode("music")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 transition-all duration-[var(--pho-duration-normal)]",
                                mode === "music"
                                    ? "bg-[#8B5CF6]/20 text-[#8B5CF6] border-b-2 border-[#8B5CF6]"
                                    : "text-[var(--pho-text-muted)] hover:text-[var(--pho-text-primary)] hover:bg-[var(--pho-glass-light)]"
                            )}
                        >
                            <Music className="w-4 h-4" />
                            <span className="font-medium text-sm">{t("tabs.music")}</span>
                        </button>
                        <button
                            onClick={() => setMode("tts")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 transition-all duration-[var(--pho-duration-normal)]",
                                mode === "tts"
                                    ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-400"
                                    : "text-[var(--pho-text-muted)] hover:text-[var(--pho-text-primary)] hover:bg-[var(--pho-glass-light)]"
                            )}
                        >
                            <Mic className="w-4 h-4" />
                            <span className="font-medium text-sm">{t("tabs.tts")}</span>
                        </button>
                    </div>

                    {/* Main Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {/* History Panel - Now in Right Sidebar */}

                        <AnimatePresence mode="wait">
                            {mode === "music" ? (
                                <motion.div
                                    key="music"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    {/* Genre/Style Presets - Horizontal Scrolling Pills */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                            Genre
                                        </label>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#8B5CF6]/20 scrollbar-track-transparent">
                                            {MUSIC_STYLES.map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                                                    className={cn(
                                                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        selectedStyle === style.id
                                                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                                                    )}
                                                >
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mood Selector - Horizontal Pills */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                                            Mood Selector
                                        </label>
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {MOOD_OPTIONS.map((mood) => (
                                                <button
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                                                    className={cn(
                                                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        selectedMood === mood.id
                                                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                                                    )}
                                                >
                                                    {mood.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lyrics Toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🎤</span>
                                            <div>
                                                <p className="text-sm font-medium text-white">{t("music.add_lyrics")}</p>
                                                <p className="text-xs text-white/50">{t("music.lyrics_desc")}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={withLyrics}
                                            onCheckedChange={handleLyricsToggle}
                                        />
                                    </div>

                                    {/* Lyrics Section - Purple Highlighted Tags Matching Mockup */}
                                    {withLyrics && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="text-[#8B5CF6]">♪</span> LYRICS SECTION
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-white/40">Enable Vocals</span>
                                                    <div className="w-8 h-4 bg-[#8B5CF6] rounded-full relative">
                                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Textarea
                                                    value={lyrics}
                                                    onChange={(e) => setLyrics(e.target.value)}
                                                    placeholder={`[verse]
In shadows we rise, a new dawn in sight
Through the darkest of times, we'll ignite the light.

[chorus]
Together we stand, forces combined
A symphony of courage, for all humankind.

[bridge]
The drums of war beat, a hero's call
We'll break every chain, and never fall.`}
                                                    className="min-h-[180px] bg-[#0D0D10] border-[#8B5CF6]/30 text-white placeholder:text-[#8B5CF6]/40 resize-none font-mono text-sm leading-relaxed rounded-xl"
                                                    style={{ caretColor: '#8B5CF6' }}
                                                />
                                                {/* Purple highlight overlay effect for structural tags */}
                                                <div className="absolute top-3 left-3 pointer-events-none text-xs text-[#8B5CF6]/60 font-mono">
                                                    {/* Visual hint for tag syntax */}
                                                </div>
                                            </div>
                                            <p className="text-xs text-[#8B5CF6]/60">
                                                Use structural tags like <span className="text-[#8B5CF6] font-semibold">[verse]</span>, <span className="text-[#8B5CF6] font-semibold">[chorus]</span>, <span className="text-[#8B5CF6] font-semibold">[bridge]</span> for song structure
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Music Prompt */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">
                                            {t("music.custom_details")}
                                        </label>
                                        <div className="relative">
                                            <Textarea
                                                value={musicPrompt}
                                                onChange={(e) => setMusicPrompt(e.target.value)}
                                                placeholder={selectedStyle ? "Add more details like instruments, tempo, or specific requests..." : "Describe your music or pick a style above..."}
                                                className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none pr-12"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!musicPrompt.trim() || isEnhancing) return
                                                    setIsEnhancing(true)
                                                    try {
                                                        const res = await fetch("/api/ai/enhance", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ prompt: musicPrompt })
                                                        })
                                                        const data = await res.json()
                                                        if (data.enhancedPrompt) setMusicPrompt(data.enhancedPrompt)
                                                    } catch (err) {
                                                        console.error("Enhance failed:", err)
                                                    } finally {
                                                        setIsEnhancing(false)
                                                    }
                                                }}
                                                disabled={!musicPrompt.trim() || isEnhancing}
                                                className={cn(
                                                    "absolute top-2 right-2 p-2 rounded-lg transition-all",
                                                    "bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
                                                    "border border-purple-500/30 hover:border-purple-500/50",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                )}
                                                title="Enhance Prompt with AI"
                                            >
                                                {isEnhancing ? (
                                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                                ) : (
                                                    <Wand2 className="w-4 h-4 text-purple-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>


                                    {/* Model & Duration - Now in Left Sidebar */}

                                    {/* RESULT/PLAYER Section - Always Visible (Matching Mockup) */}
                                    <div className="space-y-4">
                                        {/* RESULT/PLAYER Header */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Result / Player</span>
                                            {generatedMusicUrl && (
                                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Ready</span>
                                            )}
                                        </div>

                                        {/* Audio Player Card with Gradient Waveform */}
                                        <div className="rounded-2xl bg-gradient-to-b from-[#15151A] to-[#0D0D12] border border-[#8B5CF6]/20 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                                            {/* Large Waveform Area with Centered Play Button */}
                                            <div className="h-36 bg-gradient-to-b from-[#0D0D12] to-black/40 relative flex items-center justify-center px-6">
                                                {/* Gradient Waveform (Pink-Purple-Orange like mockup) */}
                                                <div className="absolute inset-0 flex items-center justify-center px-4">
                                                    <div className="flex items-center gap-0.5 h-full w-full py-6">
                                                        {Array.from({ length: 80 }).map((_, i) => {
                                                            const normalized = i / 80;
                                                            const height = 25 + Math.sin(i * 0.3) * 20 + Math.sin(i * 0.7) * 15 + Math.random() * 10;
                                                            // Gradient: Pink (#EC4899) -> Purple (#8B5CF6) -> Orange (#F97316)
                                                            let color;
                                                            if (normalized < 0.4) {
                                                                color = `hsl(${330 - normalized * 50}, 80%, 60%)`; // Pink to magenta
                                                            } else if (normalized < 0.7) {
                                                                color = `hsl(${265 + (normalized - 0.4) * 100}, 75%, 55%)`; // Magenta to purple  
                                                            } else {
                                                                color = `hsl(${25 - (normalized - 0.7) * 40}, 90%, 55%)`; // Purple to orange
                                                            }
                                                            return (
                                                                <motion.div
                                                                    key={i}
                                                                    className="flex-1 rounded-full"
                                                                    style={{ background: color }}
                                                                    initial={{ height: "30%" }}
                                                                    animate={{
                                                                        height: isPlaying ? [`${height}%`, `${height + 15}%`, `${height}%`] : `${height}%`
                                                                    }}
                                                                    transition={{
                                                                        duration: isPlaying ? 0.5 + Math.random() * 0.3 : 0,
                                                                        repeat: isPlaying ? Infinity : 0,
                                                                        ease: "easeInOut"
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Centered Play Button */}
                                                <button
                                                    onClick={() => generatedMusicUrl && setIsPlaying(!isPlaying)}
                                                    disabled={!generatedMusicUrl}
                                                    className={cn(
                                                        "relative z-20 w-16 h-16 rounded-full flex items-center justify-center transition-all",
                                                        generatedMusicUrl
                                                            ? "bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] hover:scale-105 cursor-pointer"
                                                            : "bg-white/10 cursor-not-allowed opacity-50"
                                                    )}
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="w-7 h-7 text-white" />
                                                    ) : (
                                                        <Play className="w-7 h-7 text-white ml-1" />
                                                    )}
                                                </button>

                                                {/* Vermilion Progress Bar at Bottom */}
                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
                                                    <div className="absolute left-0 h-full w-1/4 bg-gradient-to-r from-primary to-orange-500 rounded-r" />
                                                    <div
                                                        className="absolute w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"
                                                        style={{ left: "25%", top: "-3px" }}
                                                    />
                                                    {isPlaying && (
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-primary to-orange-500"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: "100%" }}
                                                            transition={{ duration: musicDuration, ease: "linear" }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Time Display */}
                                            <div className="px-5 py-2.5 flex items-center justify-end text-xs text-white/50 bg-black/30 border-t border-white/5">
                                                <span className="font-mono">0:00 / {Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, '0')}</span>
                                            </div>

                                            {generatedMusicUrl && (
                                                <audio
                                                    src={generatedMusicUrl}
                                                    className="hidden"
                                                    ref={(el) => {
                                                        if (el) {
                                                            isPlaying ? el.play() : el.pause()
                                                            el.onended = () => setIsPlaying(false)
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Quick Publish Row (Matching Mockup) */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {/* Download MP3 */}
                                            <a
                                                href={generatedMusicUrl || "#"}
                                                download={!!generatedMusicUrl}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all",
                                                    generatedMusicUrl
                                                        ? "bg-[#15151A]/80 border-white/10 hover:bg-white/10 hover:border-white/20"
                                                        : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <Download className="w-4 h-4 text-white/70" />
                                                <span className="text-sm font-medium text-white">Download MP3</span>
                                            </a>

                                            {/* Quick Publish Label */}
                                            <span className="text-xs text-white/40 font-medium">Quick Publish</span>

                                            {/* YouTube Button */}
                                            <a
                                                href={generatedMusicUrl ? `/studio?mode=video&audioUrl=${encodeURIComponent(generatedMusicUrl)}&aspect=16:9` : "#"}
                                                className={cn(
                                                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all",
                                                    generatedMusicUrl
                                                        ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                                                        : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                                                    <Youtube className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-xs font-medium text-white">YouTube</span>
                                                <span className="text-[10px] text-white/40">16:9</span>
                                            </a>

                                            {/* TikTok Button */}
                                            <a
                                                href={generatedMusicUrl ? `/studio?mode=video&audioUrl=${encodeURIComponent(generatedMusicUrl)}&aspect=9:16` : "#"}
                                                className={cn(
                                                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all",
                                                    generatedMusicUrl
                                                        ? "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20"
                                                        : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-cyan-400 flex items-center justify-center shadow-sm">
                                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-white">TikTok</span>
                                                <span className="text-[10px] text-white/40">9:16</span>
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="tts"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    {/* TTS Text Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">
                                            Enter text to speak
                                        </label>
                                        <Textarea
                                            value={ttsText}
                                            onChange={(e) => setTtsText(e.target.value)}
                                            placeholder="Enter the text you want to convert to speech..."
                                            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                                        />
                                        <p className="text-xs text-white/40">
                                            {ttsText.length} characters
                                        </p>
                                    </div>

                                    {/* Voice Model Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">
                                            Voice Model
                                        </label>
                                        <Select value={ttsModel} onValueChange={setTtsModel}>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10">
                                                {TTS_MODELS.map((model) => (
                                                    <SelectItem
                                                        key={model.id}
                                                        value={model.id}
                                                        className="text-white hover:bg-white/10"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{model.name}</span>
                                                            <span className="text-xs text-white/40">
                                                                {model.description}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Generated TTS Preview */}
                                    {generatedTTSUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setIsPlaying(!isPlaying)}
                                                    className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center"
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <Play className="w-5 h-5 text-white ml-0.5" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white">Generated Speech</p>
                                                    <p className="text-xs text-white/50">{ttsText.length} characters</p>
                                                </div>
                                                <a
                                                    href={generatedTTSUrl}
                                                    download
                                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                >
                                                    <Download className="w-4 h-4 text-white" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Generate Button */}
                        <Button
                            onClick={mode === "music" ? handleGenerateMusic : handleGenerateTTS}
                            disabled={isGenerating || (mode === "music" ? !musicPrompt.trim() : !ttsText.trim())}
                            className={cn(
                                "w-full h-12 font-semibold transition-all",
                                mode === "music"
                                    ? "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            )}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate {mode === "music" ? "Music" : "Speech"}
                                    <span className="ml-2 text-sm opacity-70">
                                        (~{(estimatedCost / 1000).toFixed(0)}K Phở)
                                    </span>
                                </>
                            )}
                        </Button>
                    </div>
                </main>

                {/* RIGHT SIDEBAR: History Panel (Liquid Glass Style) */}
                <aside className="w-[240px] min-w-[240px] border-l border-[#8B5CF6]/20 bg-gradient-to-b from-[#0D0D15]/95 to-[#0A0A0F]/95 backdrop-blur-xl flex flex-col overflow-hidden shadow-[inset_0_0_30px_rgba(139,92,246,0.03)]">
                    {/* History Header with Glow */}
                    <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0D0D15]/50">
                        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">History Panel</span>
                        <span className="w-6 h-6 bg-[#8B5CF6] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                            {audioHistory.length}
                        </span>
                    </div>

                    {/* History Items with Gradient Waveform Previews */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {audioHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="w-14 h-14 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-3">
                                    <History className="w-7 h-7 text-[#8B5CF6]/40" />
                                </div>
                                <p className="text-xs text-white/50 font-medium">No audio history yet</p>
                                <p className="text-[10px] text-white/30 mt-1">Generated audio will appear here</p>
                            </div>
                        ) : (
                            audioHistory.slice(0, 5).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 rounded-xl bg-[#15151A]/80 backdrop-blur-sm border border-white/10 hover:border-[#8B5CF6]/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all cursor-pointer group"
                                >
                                    {/* Play Button + Title */}
                                    <div className="flex items-center gap-3 mb-2.5">
                                        <button
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-shadow"
                                        >
                                            <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {item.style || "Generated Audio"}
                                            </p>
                                            <p className="text-[10px] text-white/40">
                                                {item.mood && `${item.mood} • `}{item.duration}s
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gradient Waveform Preview (Pink to Purple like mockup) */}
                                    <div className="h-10 bg-gradient-to-r from-[#0A0A0F] to-[#0D0D15] rounded-lg overflow-hidden flex items-center justify-center px-2 border border-white/5">
                                        <div className="flex items-end gap-0.5 h-full py-1.5">
                                            {Array.from({ length: 35 }).map((_, i) => {
                                                const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
                                                const hue = 280 + (i / 35) * 40; // Purple to pink gradient
                                                return (
                                                    <div
                                                        key={i}
                                                        className="w-1 rounded-full transition-all"
                                                        style={{
                                                            height: `${height}%`,
                                                            background: `linear-gradient(to top, hsl(${hue}, 80%, 50%), hsl(${hue}, 90%, 70%))`,
                                                            opacity: 0.8
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Duration Label */}
                                    <p className="text-[10px] text-white/30 mt-2 text-right">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}
