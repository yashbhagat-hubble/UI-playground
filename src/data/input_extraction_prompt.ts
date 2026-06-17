export const INPUT_EXTRACTION_PROMPT = `**Task: Extract input field theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find a text input field — typically a search bar, form field, phone number input, or amount entry. If multiple inputs exist, pick the most prominent one.

---

## Component code being styled

This is the exact InputField component you are theming. Every CSS variable maps directly to something it reads:

\`\`\`tsx
function InputField({ label, placeholder, helperText, state, height, radius }) {
  const borderColor =
    state === "error"    ? "var(--sdk-input-border-error, var(--error-base, #ef4444))"  :
    state === "disabled" ? "transparent"                                                 :
    isFocused            ? "var(--sdk-input-border-focus, var(--stroke-solid))"         :
                           "var(--sdk-input-border, var(--stroke-2))";

  const bg =
    state === "disabled"
      ? "var(--sdk-input-disabled-bg, var(--background-normal-tertiary))"
      : "var(--sdk-input-bg, var(--background-normal-primary))";

  return (
    <div>
      <label style={{ color: "var(--sdk-input-text, var(--text-normal-primary))" }}>{label}</label>

      <div style={{
        height:       \`\${height}px\`,   // ← inputConfig.height
        borderRadius: \`\${radius}px\`,   // ← inputConfig.borderRadius
        background:   bg,
        border:       \`1px solid \${borderColor}\`,
        padding:      "0 12px",
      }}>
        <input
          placeholder={placeholder}
          style={{ color: "var(--sdk-input-text, var(--text-normal-primary))" }}
        />
      </div>

      <span style={{ color: "var(--sdk-input-helper-text, var(--text-normal-secondary))" }}>
        {helperText}
      </span>
      {/* error helper uses --sdk-input-border-error */}
    </div>
  );
}
\`\`\`

---

## What to extract

### Shape
| Property | How to identify | Key |
|---|---|---|
| Height | Estimated px height of the input box (common: 44px, 48px, 52px) | \`height\` |
| Corner radius | Pill → \`9999px\` · Rounded → \`8–16px\` · Square → \`0px\` | \`borderRadius\` |

### Border visibility
Does the input have a visible border/outline in its idle (non-focused) state?
- Yes → \`strokeOn: true\`
- No (borderless / filled-only like Google Search) → \`strokeOn: false\`

### Colors — sample exact hex values from the UI
| What to look at | SDK variable |
|---|---|
| Input box fill (idle/focused) | \`--sdk-input-bg\` |
| Input box fill when disabled | \`--sdk-input-disabled-bg\` |
| Idle border color | \`--sdk-input-border\` |
| Focus / active border color | \`--sdk-input-border-focus\` |
| Error state border color | \`--sdk-input-border-error\` |
| Label + typed-value text | \`--sdk-input-text\` |
| Helper / subtitle text | \`--sdk-input-helper-text\` |

### Guardrails — verify before outputting
- **input-bg must differ from the page background**: The input fill should be visually distinct from the surface it sits on. If they appear identical, look for a subtle elevation or border — if truly the same, shift input-bg slightly (±5% lightness).
- **border-focus must be stronger than border**: The focus ring should be noticeably more prominent than the idle border. If the brand uses no idle border (\`strokeOn: false\`), border-focus should still be a clear ring color.
- **border-error must be red-ish**: Error states universally use red or a high-attention color. If you cannot find a red in the UI, use \`#ef4444\` as the default.
- **input-text must be legible on input-bg**: Ensure contrast ≥4.5:1. If sampled text appears low-contrast, darken it.
- **disabled-bg must be more muted than input-bg**: Disabled inputs should look visually subdued — typically a lighter/greyer fill.

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "sdkCssVariables": {
    "--sdk-input-bg":           "<hex>",
    "--sdk-input-disabled-bg":  "<hex>",
    "--sdk-input-border":       "<hex>",
    "--sdk-input-border-focus": "<hex>",
    "--sdk-input-border-error": "<hex>",
    "--sdk-input-text":         "<hex>",
    "--sdk-input-helper-text":  "<hex>"
  },
  "inputConfig": {
    "height":       "<e.g. 44px>",
    "borderRadius": "<e.g. 12px>",
    "strokeOn":     true
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate.`;
