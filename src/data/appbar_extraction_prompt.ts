export const APPBAR_EXTRACTION_PROMPT = `**Prompt: Extract appbar config from a screenshot**
---
You are extracting an appbar (top navigation bar) config from a screenshot of a mobile app screen. The output is a single JSON object used to configure the appbar component.
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
    // text-align driven by appbarConfig.titleAlign
  }} />
</div>
\`\`\`
---
## Decision guide

### Appbar shell
| Property | How to decide | CSS variable |
|---|---|---|
| Background | Sample the appbar's fill. If it's the same as the page background → \`var(--background-normal-primary)\`. If it's a card-like surface → \`var(--background-normal-secondary)\`. If it's a solid brand color → that hex. | \`--sdk-appbar-bg\` |
| Bottom border | Is there a visible 1px horizontal line at the bottom of the appbar? If yes → sample its color (often a light gray like \`#ebebeb\`). If no → \`transparent\` | \`--sdk-appbar-bottom-border\` |
| Height | Estimate the appbar's pixel height. Typical values: \`44px\` (compact), \`52px\` (standard), \`60px\` (tall). Measure from bottom of status bar to bottom of appbar. | \`--sdk-appbar-height\` |

### Title text
| Property | How to decide | CSS variable |
|---|---|---|
| Size | Match to the nearest type scale size: **T3=18px**, **T4=16px**, **T5=15px**, **T6=14px** (most common), **P1=14px**, **P2=12px** | \`--sdk-appbar-title-size\` |
| Line height | T3→24px, T4→22px, T5→20px, T6→20px, P1→20px, P2→16px | \`--sdk-appbar-title-line-height\` |
| Weight | Thin/light strokes → \`400\`. Medium strokes → \`500\`. Bold strokes → \`600\` | \`--sdk-appbar-title-weight\` |
| Letter spacing | T3→-0.18px, T4→-0.16px, T5→-0.15px, T6→-0.14px, P1/P2→0px | \`--sdk-appbar-title-tracking\` |
| Alignment | Is the title horizontally centered across the full appbar width? → \`"center"\`. Is it left-aligned next to the back button? → \`"left"\` | \`appbarConfig.titleAlign\` |

### Back button icon
| Property | How to decide | Field / CSS variable |
|---|---|---|
| Icon type | Does the back icon have a **horizontal line with an arrowhead** (← full arrow)? → \`"arrow"\`. Does it have only a **chevron/angle bracket** (‹) with no stem? → \`"caret"\` | \`appbarConfig.backIcon\` |
| Icon size | Estimate the rendered size of the SVG icon glyph itself (not the container). Typical: \`16px\`–\`24px\` | \`--sdk-appbar-icon-inner-size\` |
| Gap | Estimate the gap between the icon/container and the start of the title text. Typical: \`8px\`–\`16px\` | \`--sdk-appbar-icon-gap\` |

### Back button container (the tappable area around the icon)
| Property | How to decide | CSS variable |
|---|---|---|
| Visible? | Is there a distinct background fill or visible border around the back icon, separate from the appbar itself? If no visible container → set bg and border to \`transparent\` | — |
| Fill | If visible: sample the container background. Common: \`var(--background-normal-secondary)\` (card-like), \`var(--stroke-1)\` (ghost), a solid brand color. If not visible → \`transparent\` | \`--sdk-appbar-icon-bg\` |
| Border | Is there a visible stroke/ring around the icon container? → sample its color (e.g. \`var(--stroke-2)\`). If no → \`transparent\` | \`--sdk-appbar-icon-border\` |
| Size | The full tappable hit area square. Typical: \`28px\`–\`40px\`. If container is not visible → set to match icon inner size | \`--sdk-appbar-icon-size\` |
| Radius | Circle → \`9999px\`. Rounded square → estimate \`px\` (e.g. \`8px\`, \`12px\`) | \`--sdk-appbar-icon-radius\` |

**Colors: always sample exact hex values from the screenshot.** For semantic values (grays matching the page bg, surface bg, etc.) use the appropriate \`var()\` reference from the table above.
---
## Output format
Return **only** the JSON object below, fully populated. Do not include markdown fences, explanation, or any other text.

{
  "appbarCssVariables": {
    "--sdk-appbar-bg":               "<appbar fill, e.g. var(--background-normal-primary) or #hex>",
    "--sdk-appbar-bottom-border":    "<1px separator color or transparent>",
    "--sdk-appbar-height":           "<e.g. 44px>",
    "--sdk-appbar-title-size":       "<e.g. 14px>",
    "--sdk-appbar-title-line-height":"<e.g. 20px>",
    "--sdk-appbar-title-weight":     "<400 | 500 | 600>",
    "--sdk-appbar-title-tracking":   "<e.g. -0.14px or 0px>",
    "--sdk-appbar-icon-gap":         "<e.g. 12px>",
    "--sdk-appbar-icon-inner-size":  "<e.g. 20px>",
    "--sdk-appbar-icon-bg":          "<container fill or transparent>",
    "--sdk-appbar-icon-border":      "<container stroke or transparent>",
    "--sdk-appbar-icon-size":        "<container hit area size, e.g. 32px>",
    "--sdk-appbar-icon-radius":      "<e.g. 9999px or 8px>"
  },
  "appbarConfig": {
    "backIcon":   "arrow | caret",
    "titleAlign": "left | center"
  }
}

Omit any key you cannot determine from the screenshot. Do not leave placeholder strings — only include keys with real sampled or inferred values.`;
