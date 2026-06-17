export const APPBAR_EXTRACTION_PROMPT = `**Prompt: Extract appbar config from a screenshot or URL**
---
You will be given either a screenshot/image, or a URL to visit. Locate the appbar (top navigation bar) of a mobile app screen — the fixed header containing a back/menu icon and a page title. The output is a single JSON object used to configure the appbar component.

**Color rule: ALL colors must be exact hex values sampled from the screenshot or page. Never use CSS variable references or color names. If a surface is transparent → use \`"transparent"\`.**
---
## The appbar component
\`\`\`tsx
<div style={{
  background:   "var(--sdk-appbar-bg, var(--background-normal-primary))",
  "box-shadow": "inset 0 -1px 0 var(--sdk-appbar-bottom-border, transparent)",
  height:       "var(--sdk-appbar-height, 56px)",
}}>
  {/* Back button icon */}
  <div style={{
    "margin-right":  "var(--sdk-appbar-icon-gap, 12px)",
    background:      "var(--sdk-appbar-icon-bg, transparent)",
    "box-shadow":    "inset 0 0 0 1px var(--sdk-appbar-icon-border, transparent)",
    width:           "var(--sdk-appbar-icon-size, 32px)",
    height:          "var(--sdk-appbar-icon-size, 32px)",
    "border-radius": "var(--sdk-appbar-icon-radius, 9999px)",
    color:           "var(--sdk-appbar-icon-color, var(--text-normal-primary))",
  }}>
    <svg style={{ width: "var(--sdk-appbar-icon-inner-size, 20px)", height: "var(--sdk-appbar-icon-inner-size, 20px)" }} />
  </div>

  {/* Page title */}
  <span style={{
    color:            "var(--sdk-appbar-title-color, var(--text-normal-primary))",
    "font-size":      "var(--sdk-appbar-title-size, 14px)",
    "line-height":    "var(--sdk-appbar-title-line-height, 20px)",
    "font-weight":    "var(--sdk-appbar-title-weight, 500)",
    "letter-spacing": "var(--sdk-appbar-title-tracking, -0.14px)",
  }} />
</div>
\`\`\`
---
## Decision guide

### Appbar shell
| Property | How to decide | CSS variable |
|---|---|---|
| Background | Sample the exact hex of the appbar's fill. If transparent/same as page → sample the page bg hex. | \`--sdk-appbar-bg\` |
| Bottom border | Visible 1px line at bottom? → sample hex (e.g. \`#ebebeb\`). None → \`transparent\` | \`--sdk-appbar-bottom-border\` |
| Height | Estimated px height: \`44px\` (compact), \`52px\` (standard), \`60px\` (tall) | \`--sdk-appbar-height\` |

### Colors
| Property | How to decide | CSS variable |
|---|---|---|
| Title text color | Sample the exact hex of the page title text | \`--sdk-appbar-title-color\` |
| Icon color | Sample the exact hex of the back arrow/chevron glyph | \`--sdk-appbar-icon-color\` |

### Guardrails — verify before outputting
- **title-color must be legible on appbar-bg**: Contrast ratio ≥4.5:1. If the sampled title appears low-contrast, darken or lighten it until readable.
- **icon-color must be legible on appbar-bg**: Same rule — the back arrow must be clearly visible against the appbar background.
- **appbar-bg must look like the appbar**: Do not sample the status bar, the page body, or a card. Only the appbar strip itself.

### Title text
| Property | How to decide | CSS variable |
|---|---|---|
| Size | **T3=18px**, **T4=16px**, **T5=15px**, **T6=14px** (most common), **P2=12px** | \`--sdk-appbar-title-size\` |
| Line height | T3→24px, T4→22px, T5→20px, T6→20px, P2→16px | \`--sdk-appbar-title-line-height\` |
| Weight | Light → \`400\`. Medium → \`500\`. Bold → \`600\` | \`--sdk-appbar-title-weight\` |
| Letter spacing | T3→-0.18px, T4→-0.16px, T5→-0.15px, T6→-0.14px, P2→0px | \`--sdk-appbar-title-tracking\` |
| Alignment | Centered across full width? → \`"center"\`. Left-aligned next to icon? → \`"left"\` | \`appbarConfig.titleAlign\` |

### Back button icon
| Property | How to decide | Field / CSS variable |
|---|---|---|
| Icon type | Full arrow with stem (←) → \`"arrow"\`. Chevron/bracket only (‹) → \`"caret"\` | \`appbarConfig.backIcon\` |
| Icon size | Rendered size of the SVG glyph. Typical: \`16px\`–\`24px\` | \`--sdk-appbar-icon-inner-size\` |
| Gap | Space between icon/container and title. Typical: \`8px\`–\`16px\` | \`--sdk-appbar-icon-gap\` |

### Back button container
| Property | How to decide | CSS variable |
|---|---|---|
| Fill | Visible background behind the icon? → hex. None → \`transparent\` | \`--sdk-appbar-icon-bg\` |
| Border | Visible stroke/ring around icon area? → hex. None → \`transparent\` | \`--sdk-appbar-icon-border\` |
| Size | Full tappable area size. If no visible container → match icon inner size | \`--sdk-appbar-icon-size\` |
| Radius | Circle → \`9999px\`. Rounded square → estimate px (e.g. \`8px\`) | \`--sdk-appbar-icon-radius\` |
---
## Output format
Return **only** the JSON object below. Do not include markdown fences, explanation, or any other text.

{
  "sdkCssVariables": {
    "--sdk-appbar-bg":                "<exact hex of appbar fill>",
    "--sdk-appbar-bottom-border":     "<exact hex of bottom separator or transparent>",
    "--sdk-appbar-height":            "<e.g. 44px>",
    "--sdk-appbar-title-color":       "<exact hex of title text>",
    "--sdk-appbar-title-size":        "<e.g. 14px>",
    "--sdk-appbar-title-line-height": "<e.g. 20px>",
    "--sdk-appbar-title-weight":      "<400 | 500 | 600>",
    "--sdk-appbar-title-tracking":    "<e.g. -0.14px or 0px>",
    "--sdk-appbar-icon-color":        "<exact hex of icon glyph>",
    "--sdk-appbar-icon-gap":          "<e.g. 12px>",
    "--sdk-appbar-icon-inner-size":   "<e.g. 20px>",
    "--sdk-appbar-icon-bg":           "<exact hex or transparent>",
    "--sdk-appbar-icon-border":       "<exact hex or transparent>",
    "--sdk-appbar-icon-size":         "<e.g. 32px>",
    "--sdk-appbar-icon-radius":       "<e.g. 9999px or 8px>"
  },
  "appbarConfig": {
    "backIcon":   "arrow | caret",
    "titleAlign": "left | center"
  }
}

Omit any key you cannot determine. Do not leave placeholder strings — only include keys with real sampled values.`;
