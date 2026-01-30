/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./popup.tsx",
        "./contents/**/*.tsx"
    ],
    theme: {
        extend: {
            colors: {
                pho: {
                    primary: "#F0421C",
                    dark: "#0A0A0A",
                    card: "#111111"
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"]
            }
        }
    },
    plugins: []
}
