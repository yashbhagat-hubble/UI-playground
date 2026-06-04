export const INPUT_EXTRACTION_PROMPT = `**Task: Extract input field theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find a text input field — typically a search bar, form field, phone number input, or amount entry. If multiple inputs exist, pick the most prominent one.

---

## What an input field looks like

\`\`\`
Label text                          ← --text-normal-primary
┌────────────────────────────────┐  ← border: --stroke-2 (default)
│ Placeholder or typed value     │  ← bg: --background-normal-primary
└────────────────────────────────┘  ← radius, height
Helper text / error message         ← --text-normal-secondary / --error-base
\`\`\`

States:
- **Default**: border = default stroke color
- **Focused**: border thicker/brighter = focus stroke color
- **Error**: border = error color (usually red)
- **Disabled**: background = muted/grey surface, text = muted

---

## What to extract

### Shape
| Property | How to identify | Key |
|---|---|---|
| Height | Estimated px height (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | Pill → \`9999px\`. Rounded → \`8–16px\`. Square → \`0px\` | \`borderRadius\` |

### Colors — sample exact hex values
| What | Key |
|---|---|
| Input background | \`--background-normal-primary\` |
| Disabled input background | \`--background-normal-tertiary\` |
| Page background | \`--background-normal-secondary\` (the surface behind the input) |
| Default / idle border | \`--stroke-2\` |
| Hover border | \`--stroke-3\` |
| Focus border / highlight | \`--stroke-solid\` |
| Error border | \`--error-base\` |
| Label text color | \`--text-normal-primary\` |
| Input text color | \`--text-normal-primary\` |
| Placeholder text | \`--text-normal-tertiary\` |
| Helper / subtitle text | \`--text-normal-secondary\` |

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "telescopeCssVariables": {
    "--background-normal-primary":   "<hex>",
    "--background-normal-tertiary":  "<hex>",
    "--background-normal-secondary": "<hex>",
    "--stroke-2":     "<hex>",
    "--stroke-3":     "<hex>",
    "--stroke-solid": "<hex>",
    "--error-base":   "<hex>",
    "--text-normal-primary":   "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary":  "<hex>"
  },
  "inputConfig": {
    "height":       "<e.g. 44px>",
    "borderRadius": "<e.g. 12px>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate.`;
