import { JSX, Show } from "solid-js";

type SdkCategoryCardProps = {
  title: string;
  maxDiscountPercent?: number;
  icon?: JSX.Element;
  onClick?: () => void;
  class?: string;
};

export function SdkCategoryCard(props: SdkCategoryCardProps) {
  const pct = () => {
    const v = props.maxDiscountPercent ?? 0;
    return v > 0 ? (Number.isInteger(v) ? `${v}` : v.toFixed(1)) : null;
  };

  return (
    <button
      onClick={props.onClick}
      class={`flex flex-col items-center justify-center gap-[8px] px-2 pb-3 pt-4 transition-colors ${props.class ?? ""}`}
      style={{
        "border-radius": "var(--sdk-roundness-card, 12px)",
        "background-color": "var(--sdk-category-card-bg, var(--background-normal-secondary))",
        "box-shadow": "inset 0 0 0 1px var(--sdk-category-card-border, transparent)",
      }}
    >
      <Show when={props.icon}>
        <div
          class="flex shrink-0 items-center justify-center"
          style={{
            background: "var(--sdk-category-card-icon-bg, transparent)",
            "box-shadow": "inset 0 0 0 1px var(--sdk-category-card-icon-border, transparent)",
            "border-radius": "var(--sdk-category-card-icon-container-radius, 9999px)",
            width: "var(--sdk-category-card-icon-container-size, 32px)",
            height: "var(--sdk-category-card-icon-container-size, 32px)",
            color: "var(--sdk-category-card-icon-color, var(--text-normal-primary))",
          }}
        >
          {props.icon}
        </div>
      </Show>
      <div class="flex w-full flex-col items-center">
        <span class="line-clamp-1 overflow-clip text-center text-title-6-semi-bold" style={{ color: "var(--sdk-category-card-title-color, var(--text-normal-primary))" }}>
          {props.title}
        </span>
        <Show when={pct()}>
          <div class="flex items-center gap-[2px] text-label-regular" style={{ color: "var(--sdk-category-card-subtitle-color, var(--text-normal-secondary))" }}>
            <span>Up to</span>
            <span class="text-label-semi-bold">{pct()}%</span>
          </div>
        </Show>
      </div>
    </button>
  );
}
