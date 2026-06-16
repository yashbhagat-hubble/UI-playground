export const LISTING_EXTRACTION_PROMPT = `**Task: Extract listing card theme from a screenshot or URL**

Look at the screenshot or visit the URL provided. Find the section that most closely resembles a brand/product listing — a vertically stacked card with a brand image on top and text (brand name, category tags, offer/discount) below. If multiple sections exist, pick the one that best matches this pattern.

---

## Component code being styled

This is the exact SdkListingCard component you are theming. Every CSS variable maps directly to something it reads:

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
        <p style={{ color: "var(--text-normal-secondary)" }}>
          {tags.join(" · ")}
        </p>

        {/* Discount badge — only shown when discountPercent > 0 */}
        <div style={{ color: "var(--text-listing)" }}>
          SAVE {discountPercent}%
        </div>
      </div>
    </div>
  );
}
\`\`\`

The card sits on a page surface whose background maps to \`--background-normal-secondary\` (or \`--background-normal-primary\` for the outer screen).

---

## What to extract

Go through each property below, sample it from the screenshot, and output the exact hex value.

### From the listing card itself
| What | How to find it | Variable |
|---|---|---|
| Image corner radius | Measure/estimate the rounding on the brand image. Pill → \`9999px\`. Moderate → \`12px\`–\`20px\`. Square → \`0px\` | \`--sdk-listing-image-radius\` |
| Offer / discount color | The color of the "SAVE X%" or "X% off" label. Often green, brand accent, or a highlight color | \`--text-listing\` |

### From the page background and text
Sample these from the overall screen, not just the card:

| What | Variable |
|---|---|
| Page / screen background | \`--background-normal-primary\` |
| Card or surface background | \`--background-normal-secondary\` |
| Primary text (headings, brand name) | \`--text-normal-primary\` |
| Secondary text (tags, subtitles) | \`--text-normal-secondary\` |
| Tertiary text (hints, labels) | \`--text-normal-tertiary\` |
| Brand accent / primary action color | \`--brand-tbd-base\` |
| Feature / interactive highlight color | \`--feature-base\` |

---

## Output

Return ONLY this JSON — no markdown, no explanation, no extra keys:

{
  "telescopeCssVariables": {
    "--background-normal-primary": "<hex>",
    "--background-normal-secondary": "<hex>",
    "--text-normal-primary": "<hex>",
    "--text-normal-secondary": "<hex>",
    "--text-normal-tertiary": "<hex>",
    "--brand-tbd-base": "<hex>",
    "--feature-base": "<hex>"
  },
  "sdkCssVariables": {
    "--sdk-listing-image-radius": "<e.g. 16px>",
    "--text-listing": "<hex>"
  }
}

Omit any key you cannot confidently determine. Use exact sampled hex values — never approximate or invent.`;
