export const EXTRACTION_PROMPT = `**Prompt: Extract brand theme config from a category card screenshot**
---
You are extracting a brand theme config from a screenshot of a mobile app's category card section. The output is a single JSON object that will be saved as a brand theme file.
---
## The category card component
The card has **two independently styled layers**:
\`\`\`tsx
// Outer button = the card tile
<button style={{
  "border-radius": "var(--sdk-roundness-card, 12px)",
  "background-color": "var(--sdk-category-card-bg, var(--background-normal-secondary))",
  "box-shadow": "inset 0 0 0 1px var(--sdk-category-card-border, transparent)",
}}>
  // Inner div = the icon container
  <div style={{
    background: "var(--sdk-category-card-icon-bg, transparent)",
    "box-shadow": "inset 0 0 0 1px var(--sdk-category-card-icon-border, transparent)",
    "border-radius": "var(--sdk-category-card-icon-container-radius, 9999px)",
    width: "var(--sdk-category-card-icon-container-size, 32px)",
    height: "var(--sdk-category-card-icon-container-size, 32px)",
    color: "var(--sdk-category-card-icon-color, var(--text-normal-primary))",
  }}>
    {icon}   // SVG icon or emoji — its size is set by the element passed in
  </div>
  <div>{title}</div>      // category name
  <div>{discount}</div>   // "Up to X%" subtitle
</button>
\`\`\`
---
## Decision guide — map every visual property to a CSS variable
### Card
| Property | How to decide | CSS variable |
|---|---|---|
| Background | Does the whole card (including text area) have a fill? If yes → that color. If the card is transparent and only the icon area has a tile → \`transparent\` | \`--sdk-category-card-bg\` |
| Corner radius | Measure/estimate the card's corner rounding | \`--sdk-roundness-card\` |
| Border | Is there a visible stroke around the card? If yes → that color. If no → \`transparent\` | \`--sdk-category-card-border\` |
### Icon
| Property | How to decide | Output field |
|---|---|---|
| Style | Multicolor product images / illustrations / emoji → \`"emoji"\`. Monochrome SVG glyphs → \`"icon"\` | \`defaultIconStyle\` (top-level) |
| Color | The color of the SVG glyph. Only relevant when \`defaultIconStyle\` is \`"icon"\` | \`--sdk-category-card-icon-color\` |
### Icon container
| Property | How to decide | CSS variable |
|---|---|---|
| Show | Is there a visible rounded tile around the icon? If yes → fill it in. If no → set bg to \`transparent\` | \`--sdk-category-card-icon-bg\` |
| Fill | The background color of the icon tile. If no tile exists → \`transparent\` | \`--sdk-category-card-icon-bg\` |
| Size | **If the container has a visible fill or border** → measure its rendered size (e.g. \`48px\`, \`64px\`). **If bg is transparent and no border** → set this to match the icon's own size (e.g. \`24px\`) — the container is not actually present and must not add padding | \`--sdk-category-card-icon-container-size\` |
| Corner radius | Measure the container tile's rounding. Pill/circle → \`9999px\`. Square with rounding → e.g. \`12px\` | \`--sdk-category-card-icon-container-radius\` |
| Border | Is there a visible stroke around the icon container? If yes → that color. If no → \`transparent\` | \`--sdk-category-card-icon-border\` |
**Colors: always sample exact hex values from the screenshot.** Do not estimate or approximate.
---
## Output format
Return **only** the JSON object below, fully populated. Do not include markdown fences, explanation, or any other text.
\`\`\`json
{
  "key": "<lowercase-slug>",
  "label": "<Brand Name>",
  "defaultIconStyle": "icon",
  "fontImportUrl": "<Google Fonts URL if a custom font is visible, otherwise omit>",
  "telescopeCssVariables": {
    "--brand-tbd-base":       "<primary brand accent color>",
    "--brand-tbd-dark":       "<darker shade of brand accent>",
    "--brand-tbd-light":      "<brand accent at ~30% opacity, as rgba()>",
    "--brand-tbd-lighter":    "<brand accent at ~10% opacity or a very subtle tinted bg>",
    "--feature-base":         "<interactive/highlight color, often same as brand>",
    "--feature-light":        "<feature at ~35% opacity>",
    "--feature-lighter":      "<feature darkest bg tint>",
    "--brand-button-primary-text": "<text on brand-colored buttons>",
    "--text-normal-primary":  "<primary body text color>",
    "--text-normal-secondary":"<secondary/dimmer text>",
    "--text-normal-tertiary": "<tertiary/hint text>",
    "--text-inverted-primary":"<text on brand-colored surfaces>",
    "--background-normal-primary":   "<page background>",
    "--background-normal-secondary": "<card/surface background>",
    "--background-normal-tertiary":  "<elevated surface>",
    "--background-inverted-primary": "<inverted surface bg>",
    "--background-mapping-elevation-1": "<elevation-1 surface>",
    "--stroke-1": "<subtle border/divider>",
    "--stroke-2": "<medium border>",
    "--stroke-3": "<strong border>",
    "--stroke-solid": "<solid opaque stroke>"
  },
  "sdkCssVariables": {
    "--font-family": "'FontName', system-ui, sans-serif",
    "--sdk-roundness-alpha": "<button corner radius, e.g. 8px>",
    "--sdk-roundness-card":  "<card corner radius, e.g. 12px>",
    "--sdk-category-card-bg":                    "<card fill or transparent>",
    "--sdk-category-card-border":                "<card stroke or transparent>",
    "--sdk-category-card-icon-color":            "<SVG icon color>",
    "--sdk-category-card-icon-bg":               "<icon container fill or transparent>",
    "--sdk-category-card-icon-border":           "<icon container stroke or transparent>",
    "--sdk-category-card-icon-container-size":   "<container size if visible; icon size if no fill and no border>",
    "--sdk-category-card-icon-container-radius": "<e.g. 12px or 9999px>",
    "--text-listing":      "<brand accent for price/offer labels>",
    "--text-listing-dark": "<darker shade for price labels>",
    "--search-bg":         "<search bar background>"
  }
}
\`\`\`
Omit any key you cannot determine from the screenshot. Do not leave placeholder strings — only include keys with real sampled values.`;
