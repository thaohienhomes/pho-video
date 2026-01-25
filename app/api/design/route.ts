import { NextResponse } from "next/server"

/**
 * GET /api/design
 * 
 * Returns design tokens for React Native mobile app theme synchronization.
 * Based on DESIGN.md specifications.
 */

// Design Tokens from DESIGN.md
const DESIGN_TOKENS = {
    // Brand Colors
    colors: {
        primary: {
            hex: "#F0421C",
            hsl: "9 89% 53%",
            rgb: "240, 66, 28",
        },
        primaryForeground: "#FFFFFF",

        // Neutral Palette
        background: "#0A0A0A",
        foreground: "#FAFAFA",
        card: "#0A0A0A",
        cardForeground: "#FAFAFA",

        // Muted
        muted: "#262626",
        mutedForeground: "#A3A3A3",

        // Borders & Input
        border: "#262626",
        input: "#262626",

        // Semantic
        success: "#22C55E",
        warning: "#EAB308",
        destructive: "#EF4444",

        // Accent Colors (for special features)
        vermilion: "#F0421C",
        vermilionGlow: "rgba(240, 66, 28, 0.4)",
    },

    // Spacing Scale (4px base)
    spacing: {
        "0": 0,
        "1": 4,
        "2": 8,
        "3": 12,
        "4": 16,
        "5": 20,
        "6": 24,
        "8": 32,
        "10": 40,
        "12": 48,
        "16": 64,
        "20": 80,
        "24": 96,
    },

    // Typography Scale (1.2 ratio)
    typography: {
        fontFamily: {
            sans: "Inter, system-ui, sans-serif",
            heading: "Outfit, system-ui, sans-serif",
        },
        fontSize: {
            xs: { size: 12, lineHeight: 18 },
            sm: { size: 14, lineHeight: 21 },
            base: { size: 16, lineHeight: 26 },
            lg: { size: 18, lineHeight: 29 },
            xl: { size: 20, lineHeight: 30 },
            "2xl": { size: 24, lineHeight: 34 },
            "3xl": { size: 30, lineHeight: 39 },
            "4xl": { size: 36, lineHeight: 43 },
            "5xl": { size: 48, lineHeight: 53 },
            "6xl": { size: 60, lineHeight: 66 },
            "7xl": { size: 72, lineHeight: 72 },
        },
        fontWeight: {
            light: "300",
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
            black: "900",
        },
    },

    // Border Radii
    borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        "2xl": 24,
        "3xl": 32,
        full: 9999,
    },

    // Shadows (for elevation)
    shadows: {
        sm: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
        },
        lg: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 8,
        },
        glow: {
            shadowColor: "#F0421C",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
        },
    },

    // Component Standards (from DESIGN.md)
    components: {
        input: {
            height: 40,
            paddingHorizontal: 12,
            borderRadius: 8,
            fontSize: 14,
        },
        button: {
            height: 40,
            paddingHorizontal: 16,
            borderRadius: 8,
            fontSize: 14,
        },
        buttonLarge: {
            height: 48,
            paddingHorizontal: 24,
            borderRadius: 12,
            fontSize: 16,
        },
    },

    // Animation Durations (ms)
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
}

export async function GET() {
    return NextResponse.json({
        success: true,
        version: "1.0.0",
        theme: "dark",
        tokens: DESIGN_TOKENS,
        // Quick access to most used values
        quick: {
            primaryColor: DESIGN_TOKENS.colors.primary.hex,
            backgroundColor: DESIGN_TOKENS.colors.background,
            textColor: DESIGN_TOKENS.colors.foreground,
            borderRadius: DESIGN_TOKENS.borderRadius.md,
            spacing: DESIGN_TOKENS.spacing["4"],
        },
    })
}
