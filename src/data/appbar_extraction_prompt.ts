export const APPBAR_EXTRACTION_PROMPT = `**Prompt: Extract appbar config from a screenshot or URL**
---
You will be given either a screenshot/image, or a URL to visit. Locate the appbar (top navigation bar) of a mobile app screen — the fixed header containing a back/menu icon and a page title. The output is a single JSON object used to configure the appbar component.

**Color rule: ALL colors must be exact hex values sampled from the screenshot or page. Never use CSS variable references or color names. If a surface is transparent → use \`"transparent"\`.**
---
## The appbar component
\`\`\`tsx
<div style={{
  background:   "var(--sdk-appbar-bg)",          // appbar fill
  "box-shadow": "inset 0 -1px 0 var(--sdk-appbar-bottom-border)", // bottom separator
  height:       "var(--sdk-appbar-height)",
}}>
  {/* Back button icon */}
  <div style={{
    "margin-right":  "var(--sdk-appbar-icon-gap)",
    background:      "var(--sdk-appbar-icon-bg)",
    "box-shadow":    "inset 0 0 0 1px var(--sdk-appbar-icon-border)",
    width:           "var(--sdk-appbar-icon-size)",
    height:          "var(--sdk-appbar-icon-size)",
    "border-radius": "var(--sdk-appbar-icon-radius)",
    color:           "var(--text-normal-primary)",
  }}>
    <svg style={{ width: "var(--sdk-appbar-icon-inner-size)", height: "var(--sdk-appbar-icon-inner-size)" }} />
  </div>

  {/* Page title */}
  <span style={{
    "font-size":      "var(--sdk-appbar-title-size)",
    "line-height":    "var(--sdk-appbar-title-line-height)",
    "font-weight":    "var(--sdk-appbar-title-weight)",
    "letter-spacing": "var(--sdk-appbar-title-tracking)",
    color:            "var(--text-normal-primary)",
  }} />
</div>
\`\`\`
---
## Decision guide

### Appbar shell
| Property | How to decide | CSS variable |
|---|---|---|
| Background | Sample the exact hex of the appbar's fill. If the appbar appears transparent/same as page → sample the page background hex. | \`--sdk-appbar-bg\` |
| Bottom border | Is there a visible 1px horizontal line at the bottom of the appbar? If yes → sample its exact hex (e.g. \`#ebebeb\`). If no → \`transparent\` | \`--sdk-appbar-bottom-border\` |
| Height | Estimate the appbar's pixel height. Typical values: \`44px\` (compact), \`52px\` (standard), \`60px\` (tall). Measure from bottom of status bar to bottom of appbar. | \`--sdk-appbar-height\` |

### Background & text context
These set the page background and text colors so the preview renders correctly. Sample all from the screenshot.
| Property | How to decide | CSS variable |
|---|---|---|
| Page bg primary | The main page/screen background color | \`--background-normal-primary\` |
| Page bg secondary | Card/surface background (e.g. input fields, bottom sheets) | \`--background-normal-secondary\` |
| Text primary | The darkest body text color | \`--text-normal-primary\` |
| Text secondary | Dimmer/secondary text color | \`--text-normal-secondary\` |
| Text tertiary | Hint/placeholder text color | \`--text-normal-tertiary\` |

### Title text
| Property | How to decide | CSS variable |
|---|---|---|
| Size | Match to the nearest type scale: **T3=18px**, **T4=16px**, **T5=15px**, **T6=14px** (most common), **P1=14px**, **P2=12px** | \`--sdk-appbar-title-size\` |
| Line height | T3→24px, T4→22px, T5→20px, T6→20px, P1→20px, P2→16px | \`--sdk-appbar-title-line-height\` |
| Weight | Thin/light strokes → \`400\`. Medium strokes → \`500\`. Bold strokes → \`600\` | \`--sdk-appbar-title-weight\` |
| Letter spacing | T3→-0.18px, T4→-0.16px, T5→-0.15px, T6→-0.14px, P1/P2→0px | \`--sdk-appbar-title-tracking\` |
| Alignment | Centered across full appbar width? → \`"center"\`. Left-aligned next to back button? → \`"left"\` | \`appbarConfig.titleAlign\` |

### Back button icon
| Property | How to decide | Field / CSS variable |
|---|---|---|
| Icon type | **Horizontal line with arrowhead** (← full arrow)? → \`"arrow"\`. **Chevron/angle bracket only** (‹) with no stem? → \`"caret"\` | \`appbarConfig.backIcon\` |
| Icon size | Rendered size of the SVG glyph itself (not the container). Typical: \`16px\`–\`24px\` | \`--sdk-appbar-icon-inner-size\` |
| Gap | Gap between icon/container and title text start. Typical: \`8px\`–\`16px\` | \`--sdk-appbar-icon-gap\` |

### Back button container
| Property | How to decide | CSS variable |
|---|---|---|
| Fill | Visible background behind the icon? → sample exact hex. No fill → \`transparent\` | \`--sdk-appbar-icon-bg\` |
| Border | Visible stroke/ring around the icon area? → sample exact hex. None → \`transparent\` | \`--sdk-appbar-icon-border\` |
| Size | Full tappable square size. Typical: \`28px\`–\`40px\`. If no visible container → match icon inner size | \`--sdk-appbar-icon-size\` |
| Radius | Circle → \`9999px\`. Rounded square → estimate px (e.g. \`8px\`, \`12px\`) | \`--sdk-appbar-icon-radius\` |
---
## Output format
Return **only** the JSON object below, fully populated. Do not include markdown fences, explanation, or any other text.

{
  "appbarCssVariables": {
    "--background-normal-primary":    "<exact hex of page background>",
    "--background-normal-secondary":  "<exact hex of card/surface background>",
    "--text-normal-primary":          "<exact hex of primary text>",
    "--text-normal-secondary":        "<exact hex of secondary text>",
    "--text-normal-tertiary":         "<exact hex of tertiary/hint text>",
    "--sdk-appbar-bg":                "<exact hex of appbar fill>",
    "--sdk-appbar-bottom-border":     "<exact hex of bottom separator or transparent>",
    "--sdk-appbar-height":            "<e.g. 44px>",
    "--sdk-appbar-title-size":        "<e.g. 14px>",
    "--sdk-appbar-title-line-height": "<e.g. 20px>",
    "--sdk-appbar-title-weight":      "<400 | 500 | 600>",
    "--sdk-appbar-title-tracking":    "<e.g. -0.14px or 0px>",
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

Omit any key you cannot determine from the screenshot. Do not leave placeholder strings — only include keys with real sampled values.`;
