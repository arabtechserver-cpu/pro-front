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
        /* Deep space dark background palette */
        "surface-container-lowest": "#03040d",
        "surface-container-low":    "#090b1a",
        "surface-container":        "#0d0f22",
        "surface-container-high":   "#13152c",
        "surface-container-highest":"#1a1c36",
        "surface-dim":              "#050814",
        "surface":                  "#080b1c",
        "surface-bright":           "#1e2145",
        "surface-variant":          "#1a1d3a",
        "surface-tint":             "#7c3aed",
        "background":               "#050814",
        "on-background":            "#e8e6ff",
        "on-surface":               "#e8e6ff",
        "on-surface-variant":       "#cbd5e1",
        "inverse-surface":          "#e8e6ff",
        "inverse-on-surface":       "#0d0f22",

        /* Primary: Electric Purple / Violet */
        "primary":                  "#8b5cf6",
        "primary-container":        "#5b21b6",
        "primary-fixed":            "#c4b5fd",
        "primary-fixed-dim":        "#7c3aed",
        "on-primary":               "#ffffff",
        "on-primary-container":     "#ede9fe",
        "on-primary-fixed":         "#1a0050",
        "on-primary-fixed-variant": "#4c1d95",
        "inverse-primary":          "#4c1d95",

        /* Secondary: Neon Cyan / Electric Blue */
        "secondary":                "#22d3ee",
        "secondary-container":      "#0e7490",
        "secondary-fixed":          "#cffafe",
        "secondary-fixed-dim":      "#06b6d4",
        "on-secondary":             "#ffffff",
        "on-secondary-container":   "#a5f3fc",
        "on-secondary-fixed":       "#042f3d",
        "on-secondary-fixed-variant":"#164e63",

        /* Tertiary: Hot Pink / Magenta accent */
        "tertiary":                 "#e879f9",
        "tertiary-container":       "#86198f",
        "tertiary-fixed":           "#fae8ff",
        "tertiary-fixed-dim":       "#d946ef",
        "on-tertiary":              "#ffffff",
        "on-tertiary-container":    "#fae8ff",
        "on-tertiary-fixed":        "#2e0338",
        "on-tertiary-fixed-variant":"#6b21a8",

        /* Outlines */
        "outline":                  "#3d3a6b",
        "outline-variant":          "#2a2754",

        /* Error */
        "error":                    "#ffb4ab",
        "error-container":          "#93000a",
        "on-error":                 "#690005",
        "on-error-container":       "#ffdad6",
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
