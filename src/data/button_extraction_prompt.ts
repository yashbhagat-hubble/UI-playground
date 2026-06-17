export const BUTTON_EXTRACTION_PROMPT = `**Task: Extract button theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find the primary action button (the most prominent CTA — "Buy", "Continue", "Pay", etc.) and the surrounding page/screen colors.

---

## Component code being styled

This is the exact button variant set you are theming. Every CSS variable maps directly to something a variant reads:

\`\`\`tsx
const BRAND_BUTTONS = [
  { label: "Primary",   bg: "var(--sdk-btn-brand)",        text: "var(--sdk-btn-brand-on)" },
  { label: "Secondary", bg: "transparent",                  text: "var(--sdk-btn-brand)",    border: "var(--sdk-btn-brand)" },
  { label: "Tertiary",  bg: "var(--sdk-btn-feature-tint)", text: "var(--sdk-btn-feature)" },
  { label: "Ghost",     bg: "transparent",                  text: "var(--sdk-btn-feature)" },
];

const NEUTRAL_BUTTONS = [
  { label: "Primary",   bg: "var(--sdk-btn-neutral-bg)", text: "var(--sdk-btn-neutral-on)" },
  { label: "Secondary", bg: "transparent",                text: "var(--sdk-btn-text)",      border: "var(--sdk-btn-stroke)" },
];

function Button({ label, bg, text, border }) {
  return (
    <button style={{
      height:          "var(--btn-height)",      // ← buttonConfig.height
      "border-radius": "var(--btn-radius)",       // ← buttonConfig.borderRadius
      "font-size":     "var(--btn-font-size)",    // ← buttonConfig.fontSize
      "font-weight":   "var(--btn-font-weight)",  // ← buttonConfig.fontWeight
      background:      bg,
      color:           text,
      border:          border ? \`1px solid \${border}\` : "none",
    }}>
      {label}
    </button>
  );
}
\`\`\`

---

## What to extract

### Button shape & text
| Property | How to identify | Key |
|---|---|---|
| Height | Estimated px height (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | Pill → \`9999px\`. Rounded → \`8–16px\`. Square → \`0px\` | \`borderRadius\` |
| Font size | Estimate label size. Common: 13px, 14px, 15px, 16px | \`fontSize\` |
| Font weight | Regular (400) · Medium (500) · Semibold (600) · Bold (700) | \`fontWeight\` |

### Colors — sample exact hex values from the screen
| What | SDK variable |
|---|---|
| Page / screen background | \`--sdk-btn-page-bg\` |
| Primary brand / button fill | \`--sdk-btn-brand\` |
| Darker brand shade (hover) | \`--sdk-btn-brand-dark\` |
| Text on brand-filled buttons | \`--sdk-btn-brand-on\` |
| Interactive / feature highlight | \`--sdk-btn-feature\` |
| Very light brand tint (tertiary bg) | \`--sdk-btn-feature-tint\` |
| Neutral button background (dark/inverted fill) | \`--sdk-btn-neutral-bg\` |
| Text on neutral button | \`--sdk-btn-neutral-on\` |
| Outline / stroke border | \`--sdk-btn-stroke\` |
| Default text color | \`--sdk-btn-text\` |

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "sdkCssVariables": {
    "--sdk-btn-page-bg":      "<hex>",
    "--sdk-btn-brand":        "<hex>",
    "--sdk-btn-brand-dark":   "<hex>",
    "--sdk-btn-brand-on":     "<hex>",
    "--sdk-btn-feature":      "<hex>",
    "--sdk-btn-feature-tint": "<rgba or hex>",
    "--sdk-btn-neutral-bg":   "<hex>",
    "--sdk-btn-neutral-on":   "<hex>",
    "--sdk-btn-stroke":       "<hex>",
    "--sdk-btn-text":         "<hex>"
  },
  "buttonConfig": {
    "height":       "<e.g. 44px>",
    "borderRadius": "<e.g. 12px>",
    "fontSize":     "<e.g. 14px>",
    "fontWeight":   "<400 | 500 | 600 | 700>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate.`;
