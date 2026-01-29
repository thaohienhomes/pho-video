"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Palette, Wand2, Star, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplatesLibrary } from "@/components/TemplatesLibrary"
import { StylePresets } from "@/components/StylePresets"
import { PromptBuilder } from "@/components/PromptBuilder"
import { Template, StylePreset } from "@/data/templates"

export default function TemplatesPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("templates")

    const handleSelectTemplate = (template: Template) => {
        const encodedPrompt = encodeURIComponent(template.prompt)
        router.push(`/studio2?prompt=${encodedPrompt}`)
    }

    const handleApplyStyle = (styledPrompt: string, style: StylePreset) => {
        const encodedPrompt = encodeURIComponent(styledPrompt)
        router.push(`/studio2?prompt=${encodedPrompt}&style=${style.id}`)
    }

    const handlePromptGenerated = (prompt: string) => {
        const encodedPrompt = encodeURIComponent(prompt)
        router.push(`/studio2?prompt=${encodedPrompt}`)
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    Templates & Presets
                                </h1>
                                <p className="text-sm text-white/50">
                                    Quick-start with curated prompts and styles
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => router.push("/studio2")}
                            variant="outline"
                            className="border-white/20 text-white/70"
                        >
                            Open Studio
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Tab Navigation */}
                    <TabsList className="w-full justify-start gap-2 bg-white/5 p-1 rounded-xl mb-8">
                        <TabsTrigger
                            value="templates"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                            <Grid3X3 className="w-4 h-4" />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger
                            value="styles"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                            <Palette className="w-4 h-4" />
                            Style Presets
                        </TabsTrigger>
                        <TabsTrigger
                            value="builder"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                            <Wand2 className="w-4 h-4" />
                            Prompt Builder
                        </TabsTrigger>
                    </TabsList>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="mt-0">
                        <TemplatesLibrary onSelectTemplate={handleSelectTemplate} />
                    </TabsContent>

                    {/* Styles Tab */}
                    <TabsContent value="styles" className="mt-0">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-white/60">
                                    <Star className="w-4 h-4 inline mr-2 text-primary" />
                                    Enter your prompt in the Studio first, then apply a style to enhance it.
                                </p>
                            </div>
                            <StylePresets
                                currentPrompt="A beautiful landscape"
                                onApplyStyle={handleApplyStyle}
                                variant="grid"
                            />
                        </div>
                    </TabsContent>

                    {/* Builder Tab */}
                    <TabsContent value="builder" className="mt-0">
                        <div className="max-w-2xl mx-auto">
                            <PromptBuilder onPromptGenerated={handlePromptGenerated} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="py-16 text-center">
                <p className="text-sm text-white/30">
                    Can&apos;t find what you&apos;re looking for?{" "}
                    <button
                        onClick={() => router.push("/studio2")}
                        className="text-primary hover:underline"
                    >
                        Create from scratch
                    </button>
                </p>
            </div>
        </div>
    )
}
