export const EXTRACTION_PROMPT = `**Prompt: Extract brand theme config from a category card screenshot or URL**
---
You will be given either a screenshot/image, or a URL to visit. Locate a mobile app's category card section (a row/grid of tappable tiles, each with an icon and a category name, often with a discount subtitle). The output is a single JSON object that will be saved as a brand theme file.
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
  <div style={{ color: "var(--sdk-category-card-title-color, var(--text-normal-primary))" }}>{title}</div>
  <div style={{ color: "var(--sdk-category-card-subtitle-color, var(--text-normal-secondary))" }}>{discount}</div>
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
### Card text
| Property | How to decide | CSS variable |
|---|---|---|
| Title color | Color of the category name label. Default is \`--text-normal-primary\` — only include if sampled color differs | \`--sdk-category-card-title-color\` |
| Subtitle color | Color of the discount/subtitle label. Default is \`--text-normal-secondary\` — only include if sampled color differs | \`--sdk-category-card-subtitle-color\` |
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
  "defaultIconStyle": "icon",
  "sdkCssVariables": {
    "--sdk-roundness-card":  "<card corner radius, e.g. 12px>",
    "--sdk-category-card-bg":                    "<card fill or transparent>",
    "--sdk-category-card-border":                "<card stroke or transparent>",
    "--sdk-category-card-title-color":           "<title text color — omit if same as --text-normal-primary>",
    "--sdk-category-card-subtitle-color":        "<subtitle text color — omit if same as --text-normal-secondary>",
    "--sdk-category-card-icon-color":            "<SVG icon color>",
    "--sdk-category-card-icon-bg":               "<icon container fill or transparent>",
    "--sdk-category-card-icon-border":           "<icon container stroke or transparent>",
    "--sdk-category-card-icon-container-size":   "<container size if visible; icon size if no fill and no border>",
    "--sdk-category-card-icon-container-radius": "<e.g. 12px or 9999px>"
  }
}
\`\`\`
Omit any key you cannot determine from the screenshot. Do not leave placeholder strings — only include keys with real sampled values.`;
