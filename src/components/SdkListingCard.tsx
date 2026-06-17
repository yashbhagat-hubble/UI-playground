import { JSX, Show } from "solid-js";

// Right-arrow SVG (matches SDK's RightArrowIcon, stroke-based)
function RightArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ "flex-shrink": "0" }}
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

type SdkListingCardProps = {
  title: string;
  tags?: string[];
  discountPercent?: number;
  imageUrl?: string;
  class?: string;
  style?: JSX.CSSProperties;
};

/**
 * Replica of LargeProductCardTelescope from the Hubble SDK.
 * CSS variables consumed:
 *   --sdk-listing-image-radius  → brand image corner radius (default 16px)
 *   --text-listing              → discount percentage + "% off" + arrow color
 *   --text-normal-primary       → brand title
 *   --text-normal-secondary     → display tags
 */
export function SdkListingCard(props: SdkListingCardProps) {
  const pct = () => props.discountPercent ?? 0;

  return (
    <div
      class={`flex flex-col gap-2 p-1 ${props.class ?? ""}`}
      style={{
        width: "140px",
        ...props.style
      }}
    >
      {/* Brand image */}
      <div
        class="aspect-[104/116] w-full shrink-0 overflow-clip relative"
        style={{
          "border-radius": "var(--sdk-listing-image-radius, 16px)",
        }}
      >
        <img
          src={props.imageUrl}
          alt={props.title}
          loading="eager"
          class="absolute inset-0 size-full object-cover"
        />
      </div>

      {/* Content */}
      <div class="flex w-full min-w-0 flex-col items-start px-1">
        <div class="flex w-full min-w-0 flex-col gap-0.5">
          <p
            class="w-full overflow-hidden text-ellipsis whitespace-nowrap text-title-6-semi-bold"
            style={{ color: "var(--text-normal-primary)" }}
          >
            {props.title}
          </p>
          <p
            class="w-full text-label-regular"
            style={{ color: "var(--text-normal-secondary)" }}
          >
            {(props.tags ?? []).join(" · ")}
          </p>
        </div>

        {/* Discount */}
        <Show when={pct() > 0}>
          <div
            class="flex items-baseline gap-0.5"
            style={{ color: "var(--sdk-listing-color, var(--text-listing, var(--feature-base)))" }}
          >
            <span class="pb-0.5 text-label-semi-bold">SAVE</span>
            <span class="text-title-4-semi-bold">{pct()}</span>
            <span class="text-label-semi-bold">%</span>
          </div>
        </Show>
      </div>
    </div>
  );
}
