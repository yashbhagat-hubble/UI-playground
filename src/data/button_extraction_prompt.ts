export const BUTTON_EXTRACTION_PROMPT = `**Task: Extract button style from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find the primary action button — typically the most prominent call-to-action (e.g. "Buy", "Continue", "Pay", "Add to cart"). If multiple buttons exist, pick the most visually prominent one.

---

## What the button looks like

\`\`\`
┌────────────────────────────────┐
│         Get this card          │  ← text color, font size, weight
└────────────────────────────────┘
↑ height     ↑ corner radius     ↑ background color (+ optional border)
\`\`\`

---

## What to extract

### From the primary button
| Property | How to identify it | Output key |
|---|---|---|
| Background color | The fill color of the button | \`background\` |
| Text color | The label/text color on the button | \`color\` |
| Height | Estimated height in px (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | How rounded the corners are. Pill → \`9999px\`. Rounded → \`8px\`–\`16px\`. Square → \`0px\` | \`borderRadius\` |
| Border | Is there a visible stroke around the button? If yes → that color. If no → omit | \`borderColor\` |
| Font size | Estimate the label text size. Common: 14px, 15px, 16px | \`fontSize\` |
| Font weight | Regular (400) · Medium (500) · Semibold (600) · Bold (700) | \`fontWeight\` |

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "background": "<hex color>",
  "color": "<hex text color>",
  "height": "<e.g. 44px>",
  "borderRadius": "<e.g. 12px>",
  "borderColor": "<hex color, only if a border is visible>",
  "fontSize": "<e.g. 14px>",
  "fontWeight": "<400 | 500 | 600 | 700>"
}

Omit \`borderColor\` if no border is visible. Use exact sampled hex values — never approximate.`;
