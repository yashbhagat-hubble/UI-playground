export const INPUT_EXTRACTION_PROMPT = `**Task: Extract input field theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find a text input field — typically a search bar, form field, phone number input, or amount entry. If multiple inputs exist, pick the most prominent one.

---

## Component code being styled

This is the exact InputField component you are theming. Every CSS variable and config key maps directly to something it reads:

\`\`\`tsx
function InputField({ label, placeholder, helperText, state, height, radius }) {
  const borderColor =
    state === "error"    ? "var(--error-base)"       :   // red error ring
    state === "disabled" ? "transparent"             :   // no border
    isFocused            ? "var(--stroke-solid)"     :   // strong focus ring
                           "var(--stroke-2)";            // idle border

  const bg =
    state === "disabled"
      ? "var(--background-normal-tertiary)"                      // muted fill when disabled
      : "var(--sdk-input-bg, var(--background-normal-primary))"; // normal fill — sdk-input-bg overrides

  return (
    <div>
      <label style="color: var(--text-normal-primary)">{label}</label>

      <div style={{
        height:        \`\${height}px\`,          // ← inputConfig.height
        borderRadius:  \`\${radius}px\`,          // ← inputConfig.borderRadius
        background:    bg,
        border:        \`1px solid \${borderColor}\`,
        padding:       "0 12px",
      }}>
        <input
          placeholder={placeholder}
          style="color: var(--text-normal-primary)"
          // placeholder color comes from --text-normal-tertiary via CSS
        />
      </div>

      <span style="color: var(--text-normal-secondary)">{helperText}</span>
      {/* error helper uses var(--error-base) instead */}
    </div>
  );
}
\`\`\`

The input sits on a page surface whose background maps to \`--background-normal-secondary\`.

---

## What to extract

### Shape
| Property | How to identify | Key |
|---|---|---|
| Height | Estimated px height of the input box (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | Pill → \`9999px\` · Rounded → \`8–16px\` · Square → \`0px\` | \`borderRadius\` |

### Colors — sample exact hex values from the UI
| What to look at | CSS variable |
|---|---|
| Input box fill (idle/focused) | \`--sdk-input-bg\` (hex — this is the direct input background) |
| Input box fill when disabled | \`--background-normal-tertiary\` |
| Overall page background (behind everything) | \`--background-normal-primary\` |
| Card / surface background the input sits on (often a sheet or section bg, distinct from the page) | \`--background-normal-secondary\` |
| Idle border color | \`--stroke-2\` |
| Hover border color | \`--stroke-3\` |
| Focus / active border color | \`--stroke-solid\` |
| Error state border color | \`--error-base\` |
| Label + typed-value text | \`--text-normal-primary\` |
| Helper / subtitle text | \`--text-normal-secondary\` |
| Placeholder text | \`--text-normal-tertiary\` |

### Border visibility
Does the input have a visible border/outline in its idle (non-focused) state?
- Yes → \`strokeOn: true\`
- No (borderless / filled-only style like Google Search) → \`strokeOn: false\`

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "telescopeCssVariables": {
    "--sdk-input-bg":                "<hex>",
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
    "borderRadius": "<e.g. 12px>",
    "strokeOn":     true,
    "inputBg":      "<same hex as --sdk-input-bg>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate.`;
