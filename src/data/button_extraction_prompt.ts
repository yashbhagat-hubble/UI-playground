export const BUTTON_EXTRACTION_PROMPT = `**Task: Extract button theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find the primary action button (the most prominent CTA — "Buy", "Continue", "Pay", etc.) and the surrounding page/screen colors.

---

## What to extract

### Button shape & text
| Property | How to identify | Key |
|---|---|---|
| Height | Estimated px height (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | Pill → \`9999px\`. Rounded → \`8–16px\`. Square → \`0px\` | \`borderRadius\` |
| Font size | Estimate label size. Common: 13px, 14px, 15px, 16px | \`fontSize\` |
| Font weight | Regular (400) · Medium (500) · Semibold (600) · Bold (700) | \`fontWeight\` |

### Brand colors (sample exact hex values from the screen)
| What | Key |
|---|---|
| Primary brand / button fill | \`--brand-tbd-base\` |
| Darker brand shade (hover state) | \`--brand-tbd-dark\` |
| Interactive / feature highlight | \`--feature-base\` |
| Very light brand tint (button tertiary bg) | \`--feature-lighter\` |
| Outline / stroke color | \`--stroke-solid\` |

### Background & text colors
| What | Key |
|---|---|
| Page / screen background | \`--background-normal-primary\` |
| Card / surface background | \`--background-normal-secondary\` |
| Inverted surface (neutral button fill) | \`--background-inverted-primary\` |
| Primary text color | \`--text-normal-primary\` |
| Secondary text | \`--text-normal-secondary\` |
| Tertiary / hint text | \`--text-normal-tertiary\` |
| Text on inverted / brand surfaces | \`--text-inverted-primary\` |

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "telescopeCssVariables": {
    "--background-normal-primary":   "<hex>",
    "--background-normal-secondary": "<hex>",
    "--background-inverted-primary": "<hex>",
    "--text-normal-primary":   "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary":  "<hex>",
    "--text-inverted-primary": "<hex>",
    "--brand-tbd-base": "<hex>",
    "--brand-tbd-dark": "<hex>",
    "--feature-base":   "<hex>",
    "--feature-lighter":"<rgba or hex>",
    "--stroke-solid":   "<hex>"
  },
  "buttonConfig": {
    "height":       "<e.g. 44px>",
    "borderRadius": "<e.g. 12px>",
    "fontSize":     "<e.g. 14px>",
    "fontWeight":   "<400 | 500 | 600 | 700>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate.`;
