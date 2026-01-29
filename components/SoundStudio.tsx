"use client"

import { useState } from "react"
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
    Download
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
import { cn } from "@/lib/utils"

interface SoundStudioProps {
    videoUrl?: string  // Optional video to add audio to
    onMusicGenerated?: (audioUrl: string) => void
    onTTSGenerated?: (audioUrl: string) => void
}

// Music models configuration
const MUSIC_MODELS = [
    { id: "minimax", name: "MiniMax v2", description: "Full songs, versatile", cost: 30 },
    { id: "elevenlabs", name: "ElevenLabs", description: "Premium quality", cost: 40 },
    { id: "lyria2", name: "Lyria 2", description: "Google's music AI", cost: 35 },
    { id: "ace-step", name: "ACE-Step", description: "EDM & beats", cost: 25 },
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
    const [isPlaying, setIsPlaying] = useState(false)

    // Music state
    const [musicPrompt, setMusicPrompt] = useState("")
    const [musicModel, setMusicModel] = useState("minimax")
    const [musicDuration, setMusicDuration] = useState(30)
    const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null)

    // TTS state
    const [ttsText, setTtsText] = useState("")
    const [ttsModel, setTtsModel] = useState("elevenlabs")
    const [generatedTTSUrl, setGeneratedTTSUrl] = useState<string | null>(null)

    const handleGenerateMusic = async () => {
        if (!musicPrompt.trim()) return

        setIsGenerating(true)
        try {
            const response = await fetch("/api/ai/music", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: musicPrompt,
                    duration: musicDuration,
                    model: musicModel,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Music generation failed")
            }

            const data = await response.json()
            setGeneratedMusicUrl(data.audioUrl)
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
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <AnimatePresence mode="wait">
                    {mode === "music" ? (
                        <motion.div
                            key="music"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            {/* Music Prompt */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">
                                    Describe your music
                                </label>
                                <Textarea
                                    value={musicPrompt}
                                    onChange={(e) => setMusicPrompt(e.target.value)}
                                    placeholder="Epic cinematic orchestral music with dramatic strings and powerful drums..."
                                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                                />
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
                                    className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                                >
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
