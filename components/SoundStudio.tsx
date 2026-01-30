"use client"

import { useState, useEffect } from "react"
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
        <div className="w-full rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden">
            {/* Header with Mode Tabs */}
            <div className="flex items-center border-b border-white/10">
                <button
                    onClick={() => setMode("music")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-all",
                        mode === "music"
                            ? "bg-primary/20 text-primary border-b-2 border-primary"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Music className="w-5 h-5" />
                    <span className="font-medium">AI Music</span>
                </button>
                <button
                    onClick={() => setMode("tts")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-all",
                        mode === "tts"
                            ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Mic className="w-5 h-5" />
                    <span className="font-medium">Text-to-Speech</span>
                </button>
                {/* History Button */}
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={cn(
                        "flex items-center justify-center gap-2 py-4 px-4 transition-all relative",
                        showHistory
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <History className="w-5 h-5" />
                    {audioHistory.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                            {audioHistory.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* History Panel */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Recent Generations ({audioHistory.length})
                                </p>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="text-xs text-white/40 hover:text-white"
                                >
                                    Close
                                </button>
                            </div>
                            {audioHistory.length === 0 ? (
                                <p className="text-xs text-white/40 text-center py-4">
                                    No audio history yet. Generate some music!
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {audioHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
                                        >
                                            <a
                                                href={item.audioUrl}
                                                target="_blank"
                                                className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/40"
                                            >
                                                <Play className="w-3 h-3 text-emerald-400" />
                                            </a>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">
                                                    {item.style || item.prompt.substring(0, 30) || "Generated Audio"}
                                                </p>
                                                <p className="text-[10px] text-white/40">
                                                    {item.mood && `${item.mood} • `}{item.duration}s • {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <a
                                                href={item.audioUrl}
                                                download
                                                className="p-1.5 rounded-lg hover:bg-white/10"
                                            >
                                                <Download className="w-3 h-3 text-white/40" />
                                            </a>
                                            <button
                                                onClick={() => deleteFromHistory(item.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/20"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {mode === "music" ? (
                        <motion.div
                            key="music"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            {/* Style Presets */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    🎵 Pick a Style
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {MUSIC_STYLES.map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                                            className={cn(
                                                "flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                                                selectedStyle === style.id
                                                    ? "bg-primary/20 border-primary text-primary"
                                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    🎭 Mood
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {MOOD_OPTIONS.map((mood) => (
                                        <button
                                            key={mood.id}
                                            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                                selectedMood === mood.id
                                                    ? "bg-purple-500/20 border-purple-500 text-purple-400"
                                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
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
                                        <p className="text-sm font-medium text-white">Add Lyrics</p>
                                        <p className="text-xs text-white/50">Create songs with AI-generated vocals</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={withLyrics}
                                    onCheckedChange={handleLyricsToggle}
                                />
                            </div>

                            {/* Lyrics Input (shown when enabled) */}
                            {withLyrics && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-white/70">
                                        📝 Lyrics (use [verse], [chorus], [bridge])
                                    </label>
                                    <Textarea
                                        value={lyrics}
                                        onChange={(e) => setLyrics(e.target.value)}
                                        placeholder={`[verse]
Walking down the street tonight
City lights are shining bright

[chorus]
This is where I belong
Singing my favorite song`}
                                        className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none font-mono text-sm"
                                    />
                                    <p className="text-xs text-white/40">
                                        Tip: Leave empty for instrumental, or use control tags like [verse], [chorus], [bridge]
                                    </p>
                                </motion.div>
                            )}

                            {/* Music Prompt */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    ✍️ Custom Details (optional)
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

                            {/* Model & Duration Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Model Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">
                                        Model
                                    </label>
                                    <Select value={musicModel} onValueChange={setMusicModel}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10">
                                            {MUSIC_MODELS.map((model) => (
                                                <SelectItem
                                                    key={model.id}
                                                    value={model.id}
                                                    className="text-white hover:bg-white/10"
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

                                {/* Duration */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Duration: {musicDuration}s
                                    </label>
                                    <Slider
                                        value={[musicDuration]}
                                        onValueChange={([v]) => setMusicDuration(v)}
                                        min={15}
                                        max={120}
                                        step={15}
                                        className="py-3"
                                    />
                                </div>
                            </div>

                            {/* Generated Audio Preview */}
                            {generatedMusicUrl && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-4"
                                >
                                    {/* Audio Player */}
                                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">Generated Music</p>
                                                <p className="text-xs text-white/50">{musicDuration} seconds</p>
                                            </div>
                                            <a
                                                href={generatedMusicUrl}
                                                download
                                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-white" />
                                            </a>
                                        </div>
                                        <audio
                                            src={generatedMusicUrl}
                                            className="hidden"
                                            ref={(el) => {
                                                if (el) {
                                                    isPlaying ? el.play() : el.pause()
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Quick Publish to YouTube/TikTok */}
                                    {showQuickPublish && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 via-purple-500/10 to-pink-500/10 border border-white/10"
                                        >
                                            <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                                <Video className="w-4 h-4" />
                                                Quick Publish Video
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`/studio?mode=video&audioUrl=${encodeURIComponent(generatedMusicUrl)}&aspect=16:9`}
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                                >
                                                    <Youtube className="w-5 h-5 text-red-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">YouTube</p>
                                                        <p className="text-xs text-white/50">16:9 Landscape</p>
                                                    </div>
                                                </a>
                                                <a
                                                    href={`/studio?mode=video&audioUrl=${encodeURIComponent(generatedMusicUrl)}&aspect=9:16`}
                                                    className="flex items-center gap-2 p-3 rounded-lg bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30 transition-colors"
                                                >
                                                    <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">TikTok</p>
                                                        <p className="text-xs text-white/50">9:16 Portrait</p>
                                                    </div>
                                                </a>
                                            </div>
                                            <p className="text-xs text-white/40 mt-2 text-center">
                                                Create a video with visualizer and your music
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
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
        </div>
    )
}
