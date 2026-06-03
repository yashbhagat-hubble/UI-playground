import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Telescope color tokens — resolved at runtime via CSS variables
        "text-normal-primary": "var(--text-normal-primary)",
        "text-normal-secondary": "var(--text-normal-secondary)",
        "text-normal-tertiary": "var(--text-normal-tertiary)",
        "text-inverted-primary": "var(--text-inverted-primary)",
        "background-normal-primary": "var(--background-normal-primary)",
        "background-normal-secondary": "var(--background-normal-secondary)",
        "background-normal-tertiary": "var(--background-normal-tertiary)",
        "background-inverted-primary": "var(--background-inverted-primary)",
        "stroke-1": "var(--stroke-1)",
        "stroke-2": "var(--stroke-2)",
        "stroke-3": "var(--stroke-3)",
        "stroke-solid": "var(--stroke-solid)",
        "feature-base": "var(--feature-base)",
        "feature-light": "var(--feature-light)",
        "feature-lighter": "var(--feature-lighter)",
        "brand-tbd-base": "var(--brand-tbd-base)",
      },
      fontSize: {
        // Telescope typography tokens
        "display-4-semi-bold": ["48px", { lineHeight: "54px", fontWeight: "600" }],
        "title-1-semi-bold":   ["36px", { lineHeight: "42px", fontWeight: "600" }],
        "title-2-semi-bold":   ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "title-3-semi-bold":   ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-4-semi-bold":   ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "title-5-semi-bold":   ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "title-6-semi-bold":   ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "para-2-regular":      ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "para-2-semi-bold":    ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "para-3-regular":      ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-regular":       ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-semi-bold":     ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "caption-regular":     ["10px", { lineHeight: "12px", fontWeight: "400" }],
        "caption-semi-bold":   ["10px", { lineHeight: "12px", fontWeight: "600" }],
      },
      colors: {
        "error-base": "var(--error-base, #ef4444)",
        "brand-tbd-dark": "var(--brand-tbd-dark)",
      },
    },
  },
  plugins: [],
} satisfies Config;
