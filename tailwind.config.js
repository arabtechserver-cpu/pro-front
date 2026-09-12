/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Enterprise Slate & Obsidian dark background palette */
        "surface-container-lowest": "#06090e",
        "surface-container-low":    "#0b0f17",
        "surface-container":        "#111622",
        "surface-container-high":   "#182032",
        "surface-container-highest":"#1e293b",
        "surface-dim":              "#080c14",
        "surface":                  "#0b0f17",
        "surface-bright":           "#1e293b",
        "surface-variant":          "#161d2d",
        "surface-tint":             "#2563eb",
        "background":               "#0b0f17",
        "on-background":            "#f8fafc",
        "on-surface":               "#f8fafc",
        "on-surface-variant":       "#cbd5e1",
        "inverse-surface":          "#f8fafc",
        "inverse-on-surface":       "#0b0f17",

        /* Primary: Royal Tech Blue */
        "primary":                  "#2563eb",
        "primary-container":        "#1d4ed8",
        "primary-fixed":            "#93c5fd",
        "primary-fixed-dim":        "#3b82f6",
        "on-primary":               "#ffffff",
        "on-primary-container":     "#eff6ff",
        "on-primary-fixed":         "#1e3a8a",
        "on-primary-fixed-variant": "#1d4ed8",
        "inverse-primary":          "#1d4ed8",

        /* Secondary: Refined Sky / Tech Cyan */
        "secondary":                "#0ea5e9",
        "secondary-container":      "#0284c7",
        "secondary-fixed":          "#bae6fd",
        "secondary-fixed-dim":      "#38bdf8",
        "on-secondary":             "#ffffff",
        "on-secondary-container":   "#f0f9ff",
        "on-secondary-fixed":       "#0c4a6e",
        "on-secondary-fixed-variant":"#0369a1",

        /* Tertiary: Emerald Green for speed & success */
        "tertiary":                 "#10b981",
        "tertiary-container":       "#059669",
        "tertiary-fixed":           "#a7f3d0",
        "tertiary-fixed-dim":       "#34d399",
        "on-tertiary":              "#ffffff",
        "on-tertiary-container":    "#ecfdf5",
        "on-tertiary-fixed":        "#064e3b",
        "on-tertiary-fixed-variant":"#047857",

        /* Outlines */
        "outline":                  "#334155",
        "outline-variant":          "#1e293b",

        /* Error */
        "error":                    "#ef4444",
        "error-container":          "#991b1b",
        "on-error":                 "#ffffff",
        "on-error-container":       "#fee2e2",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg":      "0.5rem",
        "xl":      "0.75rem",
        "2xl":     "1rem",
        "3xl":     "1.5rem",
        "full":    "9999px"
      },
      spacing: {
        "base":              "8px",
        "section-gap":       "64px",
        "container-padding": "24px",
        "card-padding":      "20px",
        "gutter":            "16px"
      },
      fontFamily: {
        "price-display":      ["JetBrains Mono", "monospace"],
        "display-lg":         ["Plus Jakarta Sans", "sans-serif"],
        "headline-md":        ["Plus Jakarta Sans", "sans-serif"],
        "body-lg":            ["Inter", "sans-serif"],
        "body-md":            ["Inter", "sans-serif"],
        "label-sm":           ["JetBrains Mono", "monospace"],
        "display-lg-mobile":  ["Plus Jakarta Sans", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
