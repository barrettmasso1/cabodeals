import type { Config } from "tailwindcss"

/**
 * Tokens are lifted from the live cabodeals.mx card design so the rebuild keeps the
 * existing look: navy card bed, gold featured tag, sand button, Playfair headings.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827", // card bed + discount badge
        gold: "#CFB230", // FEATURED tag, savings figures
        sand: "#ECECE8", // card button
        "sand-dark": "#E0E0DC",
        charcoal: "#1A1A1A", // section headings
        slate: "#333333", // button label
      },
      fontFamily: {
        sans: ["var(--font-raleway)", "Raleway", "sans-serif"],
        heading: ["var(--font-playfair)", "Playfair Display", "serif"],
        badge: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      maxWidth: {
        grid: "1400px",
      },
      keyframes: {
        "savings-pop": {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "savings-pop": "savings-pop 420ms ease-out",
        "slide-up": "slide-up 260ms ease-out",
        "fade-in": "fade-in 180ms ease-out",
      },
    },
  },
  plugins: [],
}
export default config
