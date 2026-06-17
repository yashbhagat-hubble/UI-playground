export const BASICS_EXTRACTION_PROMPT = `**Task: Extract brand color palette and typeface from a screenshot or URL**

You will be given either a screenshot/image, or a URL to visit. Identify the brand's core visual identity — their background colors, text colors, stroke colors, and primary typeface.

---

## What to extract

### Typeface
Look at headings, body text, and labels. If the brand uses a custom or Google Font (not system-ui/sans-serif):
- Identify the font family name
- Construct a Google Fonts import URL: \`https://fonts.googleapis.com/css2?family=FontName:wght@400;500;600;700&display=swap\`
- Include \`fontImportUrl\` in the output

If the brand uses a system font (San Francisco, Roboto, Inter, etc.) → omit \`fontImportUrl\`.

### Color palette — sample exact hex values

#### Background surfaces
| What | How to identify | Variable |
|---|---|---|
| Page background | The outermost screen / page fill | \`--background-normal-primary\` |
| Card / surface | Card, sheet, or elevated container background | \`--background-normal-secondary\` |
| Subtle surface | Muted fill for inputs, tags, disabled states | \`--background-normal-tertiary\` |

#### Text
| What | How to identify | Variable |
|---|---|---|
| Primary text | Main headings and body copy | \`--text-normal-primary\` |
| Secondary text | Subtitles, descriptions, dimmer labels | \`--text-normal-secondary\` |
| Tertiary text | Hint text, placeholders, captions | \`--text-normal-tertiary\` |

#### Stroke / border
| What | How to identify | Variable |
|---|---|---|
| Subtle divider | The faintest visible line (hairline dividers, row separators) | \`--stroke-1\` |
| Medium border | Input outlines, card borders (idle state) | \`--stroke-2\` |
| Solid stroke | Fully opaque, high-contrast border or outline | \`--stroke-solid\` |

---

## Output

Return ONLY this JSON — no markdown fences, no explanation:

{
  "key": "<lowercase-slug>",
  "label": "<Brand Name>",
  "fontImportUrl": "<Google Fonts URL — omit if system font>",
  "telescopeCssVariables": {
    "--background-normal-primary":   "<hex>",
    "--background-normal-secondary": "<hex>",
    "--background-normal-tertiary":  "<hex>",
    "--text-normal-primary":   "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary":  "<hex>",
    "--stroke-1":     "<hex or rgba>",
    "--stroke-2":     "<hex or rgba>",
    "--stroke-solid": "<hex>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate or invent. Omit \`fontImportUrl\` if the brand uses a system font.`;
