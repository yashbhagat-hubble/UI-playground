export const LISTING_EXTRACTION_PROMPT = `**Prompt: Extract listing card theme config from a screenshot or URL**
---
You are extracting a listing card theme config from a screenshot (or by visiting a URL) of a mobile app's brand/product listing section. The output is a single JSON object.
---
## The listing card component
Each card shows a brand image on top with text below:
\`\`\`tsx
<div style={{ width: "140px" }}>
  {/* Brand image */}
  <div style={{
    "border-radius": "var(--sdk-listing-image-radius, 16px)",
    // aspect-ratio 104:116
  }}>
    <img src={imageUrl} />
  </div>

  {/* Text */}
  <p style={{ color: "var(--text-normal-primary)" }}>{brandName}</p>
  <p style={{ color: "var(--text-normal-secondary)" }}>{tags}</p>

  {/* Offer label */}
  <div style={{ color: "var(--text-listing)" }}>
    SAVE {discount}%
  </div>
</div>
\`\`\`
---
## Decision guide — map every visual property to a variable

### Image
| Property | How to decide | Variable |
|---|---|---|
| Corner radius | Measure/estimate the brand image rounding. Pill → \`9999px\`. Slight rounding → e.g. \`12px\`. Square → \`0px\` | \`--sdk-listing-image-radius\` |

### Offer / discount label
| Property | How to decide | Variable |
|---|---|---|
| Color | The color used for the "SAVE X%" or discount text. Usually brand accent or green | \`--text-listing\` |

### Background & text colors (telescope variables)
Sample these from the page background and text visible in the screenshot:

| Property | Variable |
|---|---|
| Page background | \`--background-normal-primary\` |
| Card / surface background | \`--background-normal-secondary\` |
| Primary text (brand name) | \`--text-normal-primary\` |
| Secondary text (tags, subtitles) | \`--text-normal-secondary\` |
| Tertiary text (hints, labels) | \`--text-normal-tertiary\` |
| Brand accent color | \`--brand-tbd-base\` |
| Feature / interactive color | \`--feature-base\` |

**Always sample exact hex values. Do not estimate.**
---
## Output format
Return **only** the JSON object below, fully populated. No markdown fences, no explanation.

{
  "telescopeCssVariables": {
    "--background-normal-primary":   "<page background color>",
    "--background-normal-secondary": "<card/surface background>",
    "--text-normal-primary":   "<primary text color>",
    "--text-normal-secondary": "<secondary/dimmer text>",
    "--text-normal-tertiary":  "<hint/label text>",
    "--brand-tbd-base":  "<brand accent color, if identifiable>",
    "--feature-base":    "<interactive/highlight color>"
  },
  "sdkCssVariables": {
    "--sdk-listing-image-radius": "<image corner radius, e.g. 16px>",
    "--text-listing": "<offer/discount label color>"
  }
}

Omit any key you cannot determine. Do not leave placeholder strings.`;
