export const LISTING_EXTRACTION_PROMPT = `**Task: Extract listing card theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find the section that most closely resembles a brand/product listing — a vertically stacked card with a brand image on top and text (brand name, category tags, offer/discount) below. If multiple sections exist, pick the one that best matches this pattern.

---

## Component code being styled

This is the exact SdkListingCard component you are theming:

\`\`\`tsx
function SdkListingCard({ title, tags, discountPercent, imageUrl }) {
  return (
    <div class="flex flex-col gap-2">
      {/* Brand image */}
      <div style={{
        "border-radius": "var(--sdk-listing-image-radius, 16px)", // ← image corner radius
      }}>
        <img src={imageUrl} alt={title} class="size-full object-cover" />
      </div>

      {/* Content */}
      <div class="flex flex-col">
        <p style={{ color: "var(--text-normal-primary)" }}>{title}</p>
        <p style={{ color: "var(--text-normal-secondary)" }}>{tags.join(" · ")}</p>

        {/* Discount badge — only shown when discountPercent > 0 */}
        <div style={{ color: "var(--sdk-listing-color, var(--text-listing, var(--feature-base)))" }}>
          SAVE {discountPercent}%
        </div>
      </div>
    </div>
  );
}
\`\`\`

---

## What to extract

Only two SDK variables are needed:

| What | How to find it | Variable |
|---|---|---|
| Image corner radius | Measure/estimate the rounding on the brand image. Pill → \`9999px\`. Moderate → \`12px\`–\`20px\`. Square → \`0px\` | \`--sdk-listing-image-radius\` |
| Offer / discount color | The color of the "SAVE X%" or "X% off" label. Often green, brand accent, or a highlight color | \`--sdk-listing-color\` |

### Guardrails — verify before outputting
- **Discount color must be visible**: \`--sdk-listing-color\` is displayed on a white/light card surface. Ensure it has sufficient contrast (≥3:1) against the card background. If the sampled color is too light, darken it slightly.
- **Image radius must match the card**: If the brand image has no visible rounding, use \`0px\` or \`4px\` — do not invent rounding that isn't there.

---

## Output

Return ONLY this JSON — no markdown, no explanation:

{
  "sdkCssVariables": {
    "--sdk-listing-image-radius": "<e.g. 16px>",
    "--sdk-listing-color": "<hex>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate or invent.`;
