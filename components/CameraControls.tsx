"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Video, MoveLeft, MoveRight, ZoomIn, ZoomOut, RotateCcw, Circle } from "lucide-react"

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
    disabled?: boolean
}

// Camera movement presets with icons and prompt suffixes
const CAMERA_PRESETS: {
    id: CameraMovement
    icon: React.ElementType
    promptSuffix: string
}[] = [
        {
            id: 'static',
            icon: Circle,
            promptSuffix: '', // No suffix for static
        },
        {
            id: 'pan_left',
            icon: MoveLeft,
            promptSuffix: ', camera panning left smoothly, cinematic motion',
        },
        {
            id: 'pan_right',
            icon: MoveRight,
            promptSuffix: ', camera panning right smoothly, cinematic motion',
        },
        {
            id: 'zoom_in',
            icon: ZoomIn,
            promptSuffix: ', slow zoom in, dramatic close-up, cinematic camera movement',
        },
        {
            id: 'zoom_out',
            icon: ZoomOut,
            promptSuffix: ', slow zoom out, revealing wide shot, cinematic camera movement',
        },
        {
            id: 'orbit',
            icon: RotateCcw,
            promptSuffix: ', camera orbiting around subject, 360 rotation, cinematic dolly shot',
        },
    ]

// Export for use in ControlPanel
export const getCameraPromptSuffix = (movement: CameraMovement): string => {
    const preset = CAMERA_PRESETS.find(p => p.id === movement)
    return preset?.promptSuffix || ''
}

export function CameraControls({ value, onValueChange, disabled }: CameraControlsProps) {
    const t = useTranslations("studio.camera")

    return (
        <div className="space-y-3">
            {/* Section Label */}
            <label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                {t("title")}
                <span className="text-xs text-muted-foreground">({t("optional")})</span>
            </label>

            {/* Pill Buttons Grid */}
            <div className="flex flex-wrap gap-2">
                {CAMERA_PRESETS.map((preset) => {
                    const Icon = preset.icon
                    const isSelected = value === preset.id

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onValueChange(preset.id)}
                            disabled={disabled}
                            className={cn(
                                // Base styles
                                "flex items-center gap-2 px-4 py-2.5 rounded-full",
                                "text-sm font-medium transition-all duration-200",
                                "border backdrop-blur-sm",
                                // Disabled state
                                disabled && "opacity-50 cursor-not-allowed",
                                // Selected state with Vermilion glow
                                isSelected ? [
                                    "bg-primary/20 border-primary text-primary",
                                    "shadow-[0_0_20px_rgba(240,66,28,0.4)]",
                                    "ring-2 ring-primary/30",
                                ] : [
                                    // Default state
                                    "bg-white/5 border-white/10 text-white/70",
                                    "hover:bg-white/10 hover:border-white/20 hover:text-white",
                                ]
                            )}
                            title={t(`${preset.id}_tooltip`)}
                        >
                            <Icon className={cn(
                                "w-4 h-4 transition-all",
                                isSelected && "text-primary drop-shadow-[0_0_8px_rgba(240,66,28,0.8)]"
                            )} />
                            <span>{t(preset.id)}</span>
                        </button>
                    )
                })}
            </div>

            {/* Hint text */}
            <p className="text-xs text-muted-foreground">
                {t("hint")}
            </p>
        </div>
    )
}
