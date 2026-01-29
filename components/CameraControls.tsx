"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Video, MoveLeft, MoveRight, ZoomIn, ZoomOut, RotateCcw, Circle } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export type CameraMovement =
    | 'static'
    | 'pan_left'
    | 'pan_right'
    | 'zoom_in'
    | 'zoom_out'
    | 'orbit'

interface CameraControlsProps {
    value: CameraMovement
    onValueChange: (value: CameraMovement) => void
    intensity?: number
    onIntensityChange?: (value: number) => void
    disabled?: boolean
    showIntensity?: boolean
}

// Camera movement presets with icons and prompt suffixes
const CAMERA_PRESETS: {
    id: CameraMovement
    icon: React.ElementType
    promptSuffix: string
    color: string
}[] = [
        {
            id: 'static',
            icon: Circle,
            promptSuffix: '',
            color: 'text-white/60',
        },
        {
            id: 'pan_left',
            icon: MoveLeft,
            promptSuffix: ', camera panning left smoothly, cinematic motion',
            color: 'text-blue-400',
        },
        {
            id: 'pan_right',
            icon: MoveRight,
            promptSuffix: ', camera panning right smoothly, cinematic motion',
            color: 'text-blue-400',
        },
        {
            id: 'zoom_in',
            icon: ZoomIn,
            promptSuffix: ', slow zoom in, dramatic close-up, cinematic camera movement',
            color: 'text-green-400',
        },
        {
            id: 'zoom_out',
            icon: ZoomOut,
            promptSuffix: ', slow zoom out, revealing wide shot, cinematic camera movement',
            color: 'text-green-400',
        },
        {
            id: 'orbit',
            icon: RotateCcw,
            promptSuffix: ', camera orbiting around subject, 360 rotation, cinematic dolly shot',
            color: 'text-purple-400',
        },
    ]

// Export for use in ControlPanel and API
export const getCameraPromptSuffix = (movement: CameraMovement, intensity: number = 0.5): string => {
    const preset = CAMERA_PRESETS.find(p => p.id === movement)
    if (!preset?.promptSuffix) return ''

    // Adjust prompt based on intensity
    const intensityWord = intensity < 0.3 ? 'subtle' : intensity > 0.7 ? 'dramatic' : 'smooth'
    return preset.promptSuffix.replace('smoothly', intensityWord)
}

export function CameraControls({
    value,
    onValueChange,
    intensity = 0.5,
    onIntensityChange,
    disabled,
    showIntensity = true
}: CameraControlsProps) {
    const t = useTranslations("studio.camera")
    const [hoveredId, setHoveredId] = useState<CameraMovement | null>(null)

    return (
        <div className="space-y-4">
            {/* Camera Grid */}
            <div className="grid grid-cols-3 gap-2">
                {CAMERA_PRESETS.map((preset) => {
                    const Icon = preset.icon
                    const isSelected = value === preset.id
                    const isHovered = hoveredId === preset.id

                    return (
                        <motion.button
                            key={preset.id}
                            type="button"
                            onClick={() => onValueChange(preset.id)}
                            onMouseEnter={() => setHoveredId(preset.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            disabled={disabled}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                                disabled && "opacity-50 cursor-not-allowed",
                                isSelected
                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(240,66,28,0.3)]"
                                    : "bg-white/5 border-white/10 hover:border-white/30"
                            )}
                        >
                            {/* Animated icon container */}
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <Icon className={cn(
                                    "w-5 h-5 transition-all duration-300",
                                    isSelected ? "text-primary" : preset.color,
                                    // Hover animations
                                    isHovered && preset.id === "pan_left" && "animate-[bounce-left_0.5s_ease-in-out_infinite]",
                                    isHovered && preset.id === "pan_right" && "animate-[bounce-right_0.5s_ease-in-out_infinite]",
                                    isHovered && preset.id === "zoom_in" && "animate-[pulse_0.5s_ease-in-out_infinite] scale-110",
                                    isHovered && preset.id === "zoom_out" && "animate-[pulse_0.5s_ease-in-out_infinite] scale-90",
                                    isHovered && preset.id === "orbit" && "animate-spin"
                                )} />
                            </div>

                            <span className={cn(
                                "text-xs font-medium mt-1.5 transition-colors",
                                isSelected ? "text-white" : "text-white/60"
                            )}>
                                {t(preset.id)}
                            </span>

                            {/* Selection ring */}
                            {isSelected && (
                                <motion.div
                                    layoutId="cameraSelection"
                                    className="absolute inset-0 rounded-xl ring-2 ring-primary/50 pointer-events-none"
                                    transition={{ type: "spring", duration: 0.3 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Intensity Slider */}
            <AnimatePresence>
                {showIntensity && value !== 'static' && onIntensityChange && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2 overflow-hidden"
                    >
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-white/50">
                                Motion Intensity
                            </label>
                            <span className="text-xs font-semibold text-primary">
                                {Math.round(intensity * 100)}%
                            </span>
                        </div>
                        <Slider
                            value={[intensity * 100]}
                            onValueChange={([v]) => onIntensityChange(v / 100)}
                            min={10}
                            max={100}
                            step={10}
                            disabled={disabled}
                            className="py-2"
                        />
                        <div className="flex justify-between text-[10px] text-white/30">
                            <span>Subtle</span>
                            <span>Moderate</span>
                            <span>Dramatic</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Compact horizontal version
export function CameraControlsCompact({
    value,
    onValueChange,
    disabled,
}: Pick<CameraControlsProps, 'value' | 'onValueChange' | 'disabled'>) {
    return (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
            {CAMERA_PRESETS.map((preset) => {
                const Icon = preset.icon
                const isSelected = value === preset.id

                return (
                    <button
                        key={preset.id}
                        onClick={() => onValueChange(preset.id)}
                        disabled={disabled}
                        title={preset.id}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            disabled && "opacity-50 cursor-not-allowed",
                            isSelected
                                ? "bg-primary/20 text-primary"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                )
            })}
        </div>
    )
}
