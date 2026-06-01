import { JSX } from "solid-js";

function ArrowLeftIcon() {
  return (
    <svg width="var(--sdk-appbar-icon-inner-size, 20px)" height="var(--sdk-appbar-icon-inner-size, 20px)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.00977 11.9805H18.9998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.013 5.98828L4.00195 12.0003L10.013 18.0123" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="var(--sdk-appbar-icon-inner-size, 20px)" height="var(--sdk-appbar-icon-inner-size, 20px)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 7L9 12L14 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

type SdkAppbarProps = {
  title?: string;
  backIcon?: string;
  titleAlign?: "left" | "center";
  class?: string;
  style?: JSX.CSSProperties;
};

const TITLE_STYLE: JSX.CSSProperties = {
  color: "var(--sdk-appbar-title-color, var(--text-normal-primary))",
  "font-size": "var(--sdk-appbar-title-size, 14px)",
  "line-height": "var(--sdk-appbar-title-line-height, 20px)",
  "font-weight": "var(--sdk-appbar-title-weight, 500)",
  "letter-spacing": "var(--sdk-appbar-title-tracking, -0.14px)",
};

export function SdkAppbar(props: SdkAppbarProps) {
  const centered = () => (props.titleAlign ?? "left") === "center";

  return (
    <div
      class={`relative flex items-center px-4 ${props.class ?? ""}`}
      style={{
        background: "var(--sdk-appbar-bg, var(--background-normal-primary))",
        "box-shadow": "inset 0 -1px 0 var(--sdk-appbar-bottom-border, transparent)",
        height: "var(--sdk-appbar-height, 56px)",
        ...props.style,
      }}
    >
      {/* Back icon */}
      <div
        class="relative z-10 flex shrink-0 items-center justify-center"
        style={{
          "margin-right": "var(--sdk-appbar-icon-gap, 12px)",
          background: "var(--sdk-appbar-icon-bg, transparent)",
          "box-shadow": "inset 0 0 0 1px var(--sdk-appbar-icon-border, transparent)",
          width: "var(--sdk-appbar-icon-size, 32px)",
          height: "var(--sdk-appbar-icon-size, 32px)",
          "border-radius": "var(--sdk-appbar-icon-radius, 9999px)",
          color: "var(--sdk-appbar-icon-color, var(--text-normal-primary))",
        }}
      >
        {(props.backIcon ?? "arrow") === "arrow" ? <ArrowLeftIcon /> : <ChevronLeftIcon />}
      </div>

      {/* Title — left: flex-1, center: absolute inset-x-0 */}
      {centered() ? (
        <span
          class="pointer-events-none absolute inset-x-0 text-center"
          style={TITLE_STYLE}
        >
          {props.title ?? "Gift Cards"}
        </span>
      ) : (
        <span class="flex-1" style={TITLE_STYLE}>
          {props.title ?? "Gift Cards"}
        </span>
      )}
    </div>
  );
}
