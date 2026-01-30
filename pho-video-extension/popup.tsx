import { useState, useEffect, useCallback } from "react"
import { Storage } from "@plasmohq/storage"
import { Shirt, Camera, Sparkles, Check, Plus, X, User, ChevronRight } from "lucide-react"

import "~/style.css"

import {
    getWardrobe,
    removeFromWardrobe,
    getWardrobeStats,
    type WardrobeItem,
    type WardrobeCategory
} from "~storage/wardrobe"

const storage = new Storage({ area: "local" })

type QualityMode = "standard" | "hd" | "ultra"

const QUALITY_SETTINGS: Record<QualityMode, { maxSize: number; quality: number; label: string }> = {
    standard: { maxSize: 512, quality: 0.7, label: "Std" },
    hd: { maxSize: 800, quality: 0.85, label: "HD" },
    ultra: { maxSize: 1200, quality: 0.92, label: "Ultra" }
}

const CATEGORIES: { id: WardrobeCategory; icon: JSX.Element; label: string }[] = [
    { id: "tops", icon: <Shirt size={16} fill="currentColor" />, label: "Tops" },
    { id: "bottoms", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 2L4 22H20L18 2H6ZM8 12H16" /></svg>, label: "Bottoms" },
    { id: "accessories", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2 12C2 8 5 4 12 4S22 8 22 12V16C22 18 20 20 18 20H6C4 20 2 18 2 16V12Z" /></svg>, label: "Hats" }
]

async function compressImage(file: File, mode: QualityMode): Promise<string> {
    const { maxSize, quality } = QUALITY_SETTINGS[mode]
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                let { width, height } = img
                if (width > height) {
                    if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize }
                } else {
                    if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize }
                }
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height)
                    resolve(canvas.toDataURL("image/jpeg", quality))
                } else reject(new Error("Canvas error"))
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    })
}

function Popup() {
    const [modelImageUrl, setModelImageUrl] = useState<string>("")
    const [activeCategory, setActiveCategory] = useState<WardrobeCategory>("tops")
    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [qualityMode, setQualityMode] = useState<QualityMode>("hd")
    const [isSaving, setIsSaving] = useState(false)
    const [showModelUpload, setShowModelUpload] = useState(false)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        const wardrobe = await getWardrobe()
        setWardrobeItems(wardrobe.items)
        setModelImageUrl(wardrobe.modelImageUrl || "")
        setQualityMode(wardrobe.qualityMode)
    }

    const categoryItems = wardrobeItems.filter(i => i.category === activeCategory)
    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedItems)
        newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id)
        setSelectedItems(newSelected)
    }

    const handleRemove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await removeFromWardrobe(id)
        selectedItems.has(id) && toggleSelect(id)
        await loadData()
    }

    const handleBrowsePage = async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
            const tab = tabs[0]
            if (!tab?.id) {
                console.error("[Phở Video] No active tab found")
                return
            }

            console.log("[Phở Video] Sending scrape message to content script...")

            // Send message and wait for response
            chrome.tabs.sendMessage(tab.id, { action: "scrapeProducts" }, (response) => {
                console.log("[Phở Video] Scrape response:", response)

                // Reload data after a short delay to ensure storage is updated
                setTimeout(async () => {
                    await loadData()
                    console.log("[Phở Video] Wardrobe data reloaded")
                }, 500)
            })
        } catch (error) {
            console.error("[Phở Video] Browse error:", error)
        }
    }

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) return
        setIsSaving(true)
        const dataUrl = await compressImage(file, qualityMode)
        await storage.set("modelImageUrl", dataUrl)
        setModelImageUrl(dataUrl)
        setShowModelUpload(false)
        setIsSaving(false)
    }, [qualityMode])

    const handleTryOn = () => {
        const items = wardrobeItems.filter(i => selectedItems.has(i.id))
        if (items.length === 0) return
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "tryOnItems", items: items.map(i => i.imageUrl) })
            }
        })
        window.close()
    }

    const selectedList = wardrobeItems.filter(i => selectedItems.has(i.id))

    if (showModelUpload) {
        return (
            <div className="w-full h-full bg-[#050505] flex flex-col p-6 text-white animate-enter z-50">
                <button onClick={() => setShowModelUpload(false)} className="self-start text-white/50 hover:text-white mb-6 flex items-center gap-2">
                    <ChevronRight className="rotate-180" size={20} /> Back
                </button>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <label className="w-full aspect-[3/4] border-2 border-dashed border-white/10 hover:border-[#F0421C] rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 hover:bg-[#F0421C]/5">
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                        {isSaving ? <div className="w-8 h-8 border-2 border-[#F0421C] border-t-transparent rounded-full animate-spin" /> : (
                            <>
                                <Camera size={32} className="text-white/30 mb-3" />
                                <span className="font-semibold text-base">Upload Photo</span>
                            </>
                        )}
                    </label>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-[600px] flex flex-col text-white overflow-hidden">

            {/* Header: Compact */}
            <div className="pt-5 pb-3 flex flex-col items-center flex-shrink-0">
                <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-[#FF9500] to-[#F0421C] flex items-center justify-center shadow-lg shadow-orange-500/30 mb-2">
                    <Shirt size={32} fill="white" className="text-white drop-shadow-md" />
                </div>
                <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-bold tracking-tight">Phở Video</h1>
                    <span className="bg-[#F0421C] text-[9px] font-bold px-1 py-0.5 rounded text-white">Beta</span>
                </div>
                <p className="text-xs text-white/40 font-medium">Digital Wardrobe</p>
            </div>

            {/* Model Capsule */}
            <div className="px-5 mb-4 flex-shrink-0">
                <div className="glass-surface rounded-full p-1 pl-1.5 pr-1.5 flex items-center justify-between h-[46px]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5 relative">
                            {modelImageUrl ? <img src={modelImageUrl} className="w-full h-full object-cover" alt="" /> : <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={16} />}
                        </div>
                        <div className="flex flex-col justify-center gap-0.5">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${modelImageUrl ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,1)]' : 'bg-yellow-500'}`}></div>
                                <span className="text-xs font-semibold text-white/90">{modelImageUrl ? 'Ready' : 'No Model'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowModelUpload(true)} className="px-3 py-1 rounded-full border border-[#F0421C]/50 text-[#F0421C] hover:bg-[#F0421C]/10 text-[10px] font-bold transition-colors">
                        Change
                    </button>
                </div>
            </div>

            {/* Category Pills */}
            <div className="px-5 flex gap-2 mb-3 overflow-x-auto no-scrollbar flex-shrink-0">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${activeCategory === cat.id
                            ? "bg-primary border-transparent text-white shadow-lg shadow-orange-500/20"
                            : "glass-clean text-white/50 hover:bg-white/5 border-white/5"
                            }`}
                    >
                        <div className={`${activeCategory === cat.id ? 'text-white' : 'opacity-50'}`}>{cat.icon}</div>
                        <span className="text-xs font-semibold">{cat.label}</span>
                        <span className="text-[9px] opacity-60 bg-black/20 px-1.5 rounded-full">{wardrobeItems.filter(i => i.category === cat.id).length}</span>
                    </button>
                ))}
            </div>

            {/* Content Area - Scrollable grid */}
            <div className="flex-1 min-h-0 px-5 overflow-y-auto custom-scroll">
                <div className="glass-surface rounded-xl p-3 min-h-[140px] mb-36">
                    <div className="grid grid-cols-3 gap-2.5">
                        {categoryItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelect(item.id)}
                                className={`card-item rounded-lg overflow-hidden relative aspect-[3/4] group cursor-pointer ${selectedItems.has(item.id) ? 'ring-1.5 ring-[#F0421C]' : ''}`}
                            >
                                <button onClick={(e) => handleRemove(item.id, e)} className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500">
                                    <X size={10} strokeWidth={3} />
                                </button>
                                {selectedItems.has(item.id) && (
                                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm z-20 animate-enter">
                                        <Check size={8} strokeWidth={4} className="text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-[#151515]">
                                    <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 h-5 bg-black/60 backdrop-blur-[2px] flex items-center justify-center border-t border-white/5">
                                    <span className="text-[8px] font-bold text-white/80 uppercase truncate px-1">{item.brand}</span>
                                </div>
                            </div>
                        ))}
                        {categoryItems.length === 0 && (
                            <div className="col-span-3 py-8 flex flex-col items-center justify-center text-white/20">
                                <span className="text-2xl mb-1 opacity-20">📦</span>
                                <span className="text-[10px] font-medium">Empty</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions - Fixed at bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-10 pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={handleBrowsePage} className="dashed-area w-full py-3 mb-2.5 rounded-xl text-xs font-bold text-[#F0421C] hover:bg-[#F0421C]/5 transition-colors flex items-center justify-center gap-1.5 bg-[#050505]/80 backdrop-blur">
                        <Plus size={14} strokeWidth={3} /> Browse current page
                    </button>

                    {/* Outfit Preview */}
                    {selectedList.length > 0 && (
                        <div className="glass-surface border border-white/10 rounded-full px-1.5 py-1.5 flex justify-center gap-1.5 mb-2.5 animate-enter mx-auto w-max max-w-full bg-[#050505]/90">
                            {selectedList.map(item => (
                                <div key={item.id} className="w-7 h-7 rounded-full ring-1 ring-white/20 overflow-hidden relative shadow-md">
                                    <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleTryOn}
                        // Show button if items selected OR if browsing (as a main action anchor)
                        // Actually let's make it always visible but disabled if invalid
                        // But user said it's missing. So maybe it was hidden by condition logic mismatch?
                        // No, just visual cutoff. Layout fixed now.
                        disabled={selectedItems.size === 0 || !modelImageUrl}
                        className="btn-cta w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(240,66,28,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={16} className="fill-white/40" /> Try Complete Outfit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Popup
