export const COLORS = {
    // Core Brand
    primary: "#F0421C",
    primaryHover: "#E53A15",
    primaryActive: "#D63310",
    primaryMuted: "rgba(240, 66, 28, 0.2)",
    primaryGlow: "rgba(240, 66, 28, 0.4)",

    // Background Layers
    background: "#050505", // bg-deepest
    surface: "#121212",    // bg-surface
    card: "#1A1A1A",       // bg-elevated
    interactive: "#242424",

    // Accents
    accent: {
        pink: "#EC4899",
        purple: "#8B5CF6",
        green: "#22C55E",
        yellow: "#EAB308",
        cyan: "#06B6D4",
    },

    // Text
    text: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.70)",
    textMuted: "rgba(255, 255, 255, 0.40)",
    textDisabled: "rgba(255, 255, 255, 0.25)",

    // Borders
    border: "rgba(255, 255, 255, 0.10)",
    borderStrong: "rgba(255, 255, 255, 0.15)",
    borderGlow: "rgba(240, 66, 28, 0.30)",

    // UI Effects
    glass: "rgba(255, 255, 255, 0.05)",
    overlay: "rgba(0,0,0,0.6)",

    // Gradients (Arrays for expo-linear-gradient)
    gradients: {
        primary: ["#F0421C", "#E0320C"] as const,
        success: ["#10B981", "#059669"] as const,
        failed: ["#EF4444", "#991B1B"] as const,
        overlay: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)'] as const,
        sunset: ["#FF5A5A", "#FF9E5A"] as const,
    }
};
