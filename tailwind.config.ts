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
        "label-regular": ["11px", { lineHeight: "16px", fontWeight: "400" }],
        "label-semi-bold": ["11px", { lineHeight: "16px", fontWeight: "600" }],
        "title-5-semi-bold": ["16px", { lineHeight: "22px", fontWeight: "600" }],
        "title-6-semi-bold": ["13px", { lineHeight: "18px", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
