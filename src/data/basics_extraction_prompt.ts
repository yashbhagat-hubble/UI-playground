export const BASICS_EXTRACTION_PROMPT = `**Task: Extract brand color palette and typeface from a screenshot or URL**

You will be given either a screenshot/image, or a URL to visit. Extract the brand's core visual identity — background surfaces, text colors, border colors, primary brand accent, and typeface.

---

## Component code being themed

These are the exact UI elements that consume the variables you are extracting. Sample colors directly from what you see on screen and map them to the variable each element reads:

\`\`\`tsx
// Card on page background — uses bg-primary as fill, stroke-1 as border
<div style={{
  background: "var(--background-normal-primary)",    // page / outermost fill
  boxShadow: "inset 0 0 0 1px var(--stroke-1)",      // hairline card border
  borderRadius: "12px", padding: "20px",
}}>
  <p style={{ color: "var(--text-normal-primary)",   fontSize: 15, fontWeight: 600 }}>Gift Cards</p>
  <p style={{ color: "var(--text-normal-secondary)", fontSize: 13 }}>Save on your favourite brands</p>
  <p style={{ color: "var(--text-normal-tertiary)",  fontSize: 11 }}>400+ brands · Instant delivery</p>
</div>

// Card on surface — uses bg-secondary as fill, no border
<div style={{
  background: "var(--background-normal-secondary)",  // card / sheet surface
  borderRadius: "12px", padding: "20px",
}}>
  <p style={{ color: "var(--text-normal-primary)" }}>Popular right now</p>
  <p style={{ color: "var(--text-normal-secondary)" }}>Amazon, Flipkart, Zomato and more</p>
  <p style={{ color: "var(--text-normal-tertiary)" }}>Up to 10% off · Use points or cash</p>
</div>

// Input / tag — uses bg-tertiary as muted fill, stroke-2 as idle border
<input style={{
  background: "var(--background-normal-tertiary)",   // muted fill for inputs, tags, disabled
  border: "1px solid var(--stroke-2)",               // idle / medium border
}} />

// Brand accent — button fill, links, active states
<button style={{ background: "var(--brand-tbd-base)", color: "#fff" }}>Continue</button>

// Font family applied globally
<div style={{ fontFamily: "var(--font-family)" }}>…</div>
\`\`\`

---

## What to extract

### Typeface
Look at headings, body text, and labels across the page.
- If the brand uses a **custom or Google Font** (not system-ui / San Francisco / Roboto):
  - Identify the font family name
  - Construct a Google Fonts URL: \`https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700&display=swap\`
  - Include \`fontImportUrl\` and set \`--font-family\` in \`sdkCssVariables\`
- If it uses a **system font** → omit both \`fontImportUrl\` and \`sdkCssVariables\`

### Colors — sample exact hex values from the screen

| What to look at | CSS variable |
|---|---|
| Outermost page / screen fill | \`--background-normal-primary\` |
| Card, bottom sheet, or surface background | \`--background-normal-secondary\` |
| Muted fill — inputs, tags, disabled states | \`--background-normal-tertiary\` |
| Main headings and body copy | \`--text-normal-primary\` |
| Subtitles, descriptions, secondary labels | \`--text-normal-secondary\` |
| Hints, placeholders, captions | \`--text-normal-tertiary\` |
| Faintest divider / hairline separator | \`--stroke-1\` |
| Input outline / card border (idle) | \`--stroke-2\` |
| Primary brand accent — button fill, links, active states | \`--brand-tbd-base\` |

---

## Output

Return ONLY this JSON — no markdown fences, no explanation:

{
  "fontImportUrl": "<Google Fonts URL — omit if system font>",
  "telescopeCssVariables": {
    "--background-normal-primary":   "<hex>",
    "--background-normal-secondary": "<hex>",
    "--background-normal-tertiary":  "<hex>",
    "--text-normal-primary":   "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary":  "<hex>",
    "--stroke-1":       "<hex or rgba>",
    "--stroke-2":       "<hex or rgba>",
    "--brand-tbd-base": "<hex>"
  },
  "sdkCssVariables": {
    "--font-family": "'FontName', system-ui, sans-serif"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate or invent. Omit \`fontImportUrl\` and \`sdkCssVariables\` entirely if the brand uses a system font.`;
