export const BASICS_EXTRACTION_PROMPT = `**Task: Extract brand color palette and typeface from a screenshot or URL**

You will be given either a screenshot/image, or a URL to visit. Identify the brand's core visual identity — their color system and primary typeface. This is used to configure the base design token layer.

---

## What to extract

### 1. Typeface
Look at headings, body text, and labels. If the brand uses a custom or Google Font (not system-ui/sans-serif):
- Identify the font family name
- Construct a Google Fonts import URL: \`https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700&display=swap\`
- Set \`fontImportUrl\` and \`--font-family\` in the output

If the brand uses a system font (San Francisco, Roboto, etc.) → omit both.

### 2. Color palette — sample exact hex values

#### Brand / accent
| What | How to identify | Variable |
|---|---|---|
| Primary brand color | The dominant accent — button fills, active states, links, highlights | \`--brand-tbd-base\` |
| Dark brand shade | Hover/pressed state of the primary brand color, or a darker variant | \`--brand-tbd-dark\` |
| Feature / interactive | Color used for interactive elements (often same as brand) | \`--feature-base\` |
| Feature lighter | Very light tint of the accent (10–15% opacity or a pale bg) | \`--feature-lighter\` |

#### Background
| What | How to identify | Variable |
|---|---|---|
| Page background | The outermost screen/page fill | \`--background-normal-primary\` |
| Card / surface | Card, sheet, or elevated container background | \`--background-normal-secondary\` |
| Subtle surface | Muted/tertiary surface (input fills, disabled states) | \`--background-normal-tertiary\` |
| Inverted surface | Dark surface used for high-contrast elements (e.g. dark header, bottom bar) | \`--background-inverted-primary\` |

#### Text
| What | How to identify | Variable |
|---|---|---|
| Primary text | Main headings and body copy | \`--text-normal-primary\` |
| Secondary text | Subtitles, descriptions, dimmer labels | \`--text-normal-secondary\` |
| Tertiary text | Hint text, placeholders, captions | \`--text-normal-tertiary\` |
| Inverted text | Text on brand-colored or dark inverted surfaces | \`--text-inverted-primary\` |

#### Stroke
| What | How to identify | Variable |
|---|---|---|
| Subtle divider | The faintest visible line (hairline dividers, row separators) | \`--stroke-1\` |
| Medium border | Input outlines, card borders (idle state) | \`--stroke-2\` |
| Strong border | Focused/active input border, emphasized outlines | \`--stroke-3\` |
| Solid stroke | Fully opaque, high-contrast border or outline | \`--stroke-solid\` |

---

## Output

Return ONLY this JSON — no markdown fences, no explanation:

{
  "key": "<lowercase-slug>",
  "label": "<Brand Name>",
  "fontImportUrl": "<Google Fonts URL or omit if system font>",
  "telescopeCssVariables": {
    "--brand-tbd-base":  "<hex>",
    "--brand-tbd-dark":  "<hex>",
    "--feature-base":    "<hex>",
    "--feature-lighter": "<rgba or hex>",
    "--background-normal-primary":   "<hex>",
    "--background-normal-secondary": "<hex>",
    "--background-normal-tertiary":  "<hex>",
    "--background-inverted-primary": "<hex>",
    "--text-normal-primary":   "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary":  "<hex>",
    "--text-inverted-primary": "<hex>",
    "--stroke-1":     "<hex or rgba>",
    "--stroke-2":     "<hex or rgba>",
    "--stroke-3":     "<hex or rgba>",
    "--stroke-solid": "<hex>"
  },
  "sdkCssVariables": {
    "--font-family": "'FontName', system-ui, sans-serif"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate or invent. Omit \`fontImportUrl\` and \`sdkCssVariables\` entirely if the brand uses a system font.`;
