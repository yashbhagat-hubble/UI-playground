/**
 * Card Design System Playground — standalone build
 */

import { createMemo, createSignal, For, JSX, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { PhosphorIcon } from "./components/PhosphorIcon";
import { SdkAppbar } from "./components/SdkAppbar";
import { SdkCategoryCard } from "./components/SdkCategoryCard";
import { SdkListingCard } from "./components/SdkListingCard";
import { brandThemes, designVariantOverrides } from "./data/brand_themes_registry";
import { appbarThemes } from "./data/appbar_themes_registry";
import { EXTRACTION_PROMPT } from "./data/extraction_prompt";
import { APPBAR_EXTRACTION_PROMPT } from "./data/appbar_extraction_prompt";
import { MOCK_CATEGORIES, categoryIconMap, categoryEmoji, type MockCategory } from "./utils/categories";
import { formatDiscountPercent } from "./utils/number";
import listingDataRaw from "./data/listing-data.json";

// ─── Dark / light defaults ────────────────────────────────────────────────────

const DARK_TELESCOPE_VARS: JSX.CSSProperties = {
  "--text-normal-primary": "#F3F4F6",
  "--text-normal-secondary": "#9CA3AF",
  "--text-normal-tertiary": "#6B7280",
  "--text-inverted-primary": "#111827",
  "--background-normal-primary": "#0A0A0A",
  "--background-normal-secondary": "#141414",
  "--background-normal-tertiary": "#1E1E1E",
  "--background-inverted-primary": "#F3F4F6",
  "--stroke-1": "#252525",
  "--stroke-2": "#374151",
  "--stroke-3": "#4B5563",
  "--stroke-solid": "#9CA3AF",
};

const LIGHT_CTX_DEFAULTS = {
  bgPrimary:    "#ffffff",
  bgSecondary:  "#f9fafb",
  textPrimary:  "#111827",
  textSecondary:"#6b7280",
  textTertiary: "#9ca3af",
};
const DARK_CTX_DEFAULTS = {
  bgPrimary:    "#0a0a0a",
  bgSecondary:  "#141414",
  textPrimary:  "#f3f4f6",
  textSecondary:"#9ca3af",
  textTertiary: "#6b7280",
};

// ─── Default SDK vars ─────────────────────────────────────────────────────────

const defaultSdkCssVariables: Record<string, string> = {
  "--sdk-roundness-card": "12px",
  "--sdk-roundness-alpha": "8px",
  "--sdk-category-card-bg": "var(--background-normal-secondary)",
  "--sdk-category-card-border": "transparent",
  "--sdk-category-card-icon-bg": "transparent",
  "--sdk-category-card-icon-border": "transparent",
  "--sdk-category-card-icon-container-size": "32px",
  "--sdk-category-card-icon-container-radius": "9999px",
  "--sdk-category-card-icon-color": "var(--text-normal-primary)",
};

// ─── Appbar title type scale ──────────────────────────────────────────────────

type TitleSizeKey = "t3" | "t4" | "t5" | "t6" | "p1" | "p2";
type TitleWeightKey = "regular" | "medium" | "semibold";

const TITLE_SIZES: Record<TitleSizeKey, { label: string; size: number; lineHeight: number; tracking: number }> = {
  t3:  { label: "T3", size: 18, lineHeight: 24, tracking: -0.18 },
  t4:  { label: "T4", size: 16, lineHeight: 22, tracking: -0.16 },
  t5:  { label: "T5", size: 15, lineHeight: 20, tracking: -0.15 },
  t6:  { label: "T6", size: 14, lineHeight: 20, tracking: -0.14 },
  p1:  { label: "P1", size: 14, lineHeight: 20, tracking:  0 },
  p2:  { label: "P2", size: 12, lineHeight: 16, tracking:  0 },
};

const TITLE_WEIGHTS: Record<TitleWeightKey, { label: string; weight: number }> = {
  regular:  { label: "Regular",  weight: 400 },
  medium:   { label: "Medium",   weight: 500 },
  semibold: { label: "Semibold", weight: 600 },
};

// ─── Default appbar SDK vars ──────────────────────────────────────────────────

const defaultAppbarCssVariables: Record<string, string> = {
  "--sdk-appbar-bg": "var(--background-normal-primary)",
  "--sdk-appbar-bottom-border": "var(--stroke-1)",
  "--sdk-appbar-title-color": "var(--text-normal-primary)",
  "--sdk-appbar-icon-color": "var(--text-normal-primary)",
  "--sdk-appbar-icon-bg": "transparent",
  "--sdk-appbar-icon-border": "transparent",
  "--sdk-appbar-icon-size": "32px",
  "--sdk-appbar-icon-radius": "9999px",
  "--sdk-appbar-height": "44px",
};

// ─── Theme tabs ───────────────────────────────────────────────────────────────

type ThemeKey = "default" | string;

const SHOWCASE_KEYS = ["phonepe", "googlepay", "cred", "instamart", "blinkit", "uber"];

// ─── Config modal constants ───────────────────────────────────────────────────

const TELESCOPE_COLOR_KEYS = [
  "--background-normal-primary",
  "--text-normal-primary",
  "--text-normal-secondary",
  "--text-normal-tertiary",
];

const SDK_CARD_CONFIG_KEYS = [
  "--sdk-roundness-card",
  "--sdk-category-card-bg",
  "--sdk-category-card-border",
  "--sdk-category-card-icon-bg",
  "--sdk-category-card-icon-border",
  "--sdk-category-card-icon-container-size",
  "--sdk-category-card-icon-container-radius",
  "--sdk-category-card-icon-color",
];

const SDK_LISTING_CONFIG_KEYS = [
  "--text-listing",
  "--sdk-listing-image-radius",
];

type ConfigModalData = {
  key?: string;
  label: string;
  defaultIconStyle?: "icon" | "emoji";
  fontImportUrl?: string;
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

// ─── Layout primitive ─────────────────────────────────────────────────────────

function Section(props: {
  title: string;
  subtitle?: string;
  children: JSX.Element;
  class?: string;
  action?: JSX.Element;
}) {
  return (
    <div class={`flex flex-col ${props.class ?? ""}`}>
      <div class="flex items-start justify-between pb-3">
        <div class="flex flex-col gap-0.5">
          <p class="text-[15px] font-semibold text-text-normal-primary">
            {props.title}
          </p>
          <Show when={props.subtitle}>
            <p class="text-[11px] text-text-normal-tertiary">{props.subtitle}</p>
          </Show>
        </div>
        <Show when={props.action}>{props.action}</Show>
      </div>
      <div>{props.children}</div>
    </div>
  );
}

// ─── Card builder primitives ──────────────────────────────────────────────────

type ColorOption = { label: string; value: string };

const CARD_BG_OPTIONS: ColorOption[] = [
  { label: "None", value: "transparent" },
  { label: "Primary", value: "var(--background-normal-primary)" },
  { label: "Secondary", value: "var(--background-normal-secondary)" },
  { label: "Feature", value: "var(--feature-lighter)" },
  { label: "Brand", value: "var(--brand-tbd-base)" },
];
const BORDER_COLOR_OPTIONS: ColorOption[] = [
  { label: "Stroke 1", value: "var(--stroke-1)" },
  { label: "Stroke 2", value: "var(--stroke-2)" },
  { label: "Solid", value: "var(--stroke-solid)" },
  { label: "Feature", value: "var(--feature-base)" },
  { label: "Brand", value: "var(--brand-tbd-base)" },
];
const FILL_OPTIONS: ColorOption[] = [
  { label: "None", value: "transparent" },
  { label: "Secondary", value: "var(--background-normal-secondary)" },
  { label: "Feature Lt", value: "var(--feature-lighter)" },
  { label: "Feature", value: "var(--feature-light)" },
  { label: "Brand", value: "var(--brand-tbd-base)" },
];
const ICON_COLOR_OPTIONS: ColorOption[] = [
  { label: "Primary", value: "var(--text-normal-primary)" },
  { label: "Secondary", value: "var(--text-normal-secondary)" },
  { label: "Tertiary", value: "var(--text-normal-tertiary)" },
  { label: "Feature", value: "var(--feature-base)" },
  { label: "Brand", value: "var(--brand-tbd-base)" },
];

/** Swatch row with colour presets + a native colour-picker for custom values */
function SwatchRow(props: {
  value: string;
  onChange: (v: string) => void;
  options: ColorOption[];
}) {
  // Is the current value a custom hex not in the preset list?
  const customHex = () => {
    const v = props.value;
    if (!/^#[0-9a-fA-F]{3,8}$/.test(v)) return null;
    return props.options.some((o) => o.value === v) ? null : v;
  };

  return (
    <div class="flex flex-wrap items-center gap-2">
      <For each={props.options}>
        {(opt) => (
          <button
            title={opt.label}
            class="size-5 rounded-full transition-all"
            style={{
              background:
                opt.value === "transparent"
                  ? "linear-gradient(135deg,#d0d0d0 25%,#f4f4f4 25%,#f4f4f4 50%,#d0d0d0 50%,#d0d0d0 75%,#f4f4f4 75%)"
                  : opt.value,
              "background-size": opt.value === "transparent" ? "6px 6px" : undefined,
              outline:
                props.value === opt.value
                  ? "2px solid var(--feature-base)"
                  : "1px solid var(--stroke-1)",
              "outline-offset": props.value === opt.value ? "2px" : "0",
            }}
            onClick={() => props.onChange(opt.value)}
          />
        )}
      </For>

      {/* Custom colour picker — shown as a "+" dot or the selected custom hex */}
      <label
        class="relative flex size-5 cursor-pointer items-center justify-center rounded-full transition-all"
        style={{
          background: customHex() ?? "transparent",
          outline: customHex()
            ? "2px solid var(--feature-base)"
            : "1px dashed var(--stroke-2)",
          "outline-offset": customHex() ? "2px" : "0",
        }}
        title="Custom colour"
      >
        <input
          type="color"
          class="absolute h-0 w-0 opacity-0"
          value={customHex() ?? "#6366f1"}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
        <Show when={!customHex()}>
          <span class="select-none text-[9px] font-bold leading-none text-text-normal-tertiary">
            +
          </span>
        </Show>
      </label>
    </div>
  );
}

/** Standalone colour picker swatch — for background & text overrides */
function ColorPickerCtrl(props: { value: string; onChange: (v: string) => void }) {
  return (
    <label class="relative flex cursor-pointer items-center gap-1.5">
      <span
        class="inline-block size-5 shrink-0 rounded-full border border-stroke-1"
        style={{ background: props.value }}
      />
      <span class="font-mono text-[11px] text-text-normal-secondary">{props.value}</span>
      <input
        type="color"
        class="absolute h-0 w-0 opacity-0"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
      />
    </label>
  );
}

function ToggleSwitch(props: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={props.value}
      class="relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
      style={{ background: props.value ? "var(--feature-base)" : "var(--stroke-2)" }}
      onClick={() => props.onChange(!props.value)}
    >
      <div
        class="absolute size-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: props.value ? "translateX(17px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SliderInput(props: {
  min: number; max: number; value: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div class="flex items-center gap-2">
      <input
        type="range" min={props.min} max={props.max} value={props.value}
        class="h-1 w-24 cursor-pointer"
        style={{ "accent-color": "var(--feature-base)" }}
        onInput={(e) => props.onChange(+e.currentTarget.value)}
      />
      <span class="w-9 text-right font-mono text-[11px] tabular-nums text-text-normal-tertiary">
        {props.value}{props.unit ?? ""}
      </span>
    </div>
  );
}

function Segment<T extends string>(props: {
  value: T; onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div class="flex overflow-hidden rounded-lg border border-stroke-1">
      <For each={props.options}>
        {(opt) => (
          <button
            class="px-2.5 py-1 text-label-semi-bold transition-colors"
            classList={{
              "bg-background-normal-secondary text-text-normal-primary": props.value === opt.value,
              "bg-background-normal-primary text-text-normal-tertiary": props.value !== opt.value,
            }}
            onClick={() => props.onChange(opt.value)}
          >
            {opt.label}
          </button>
        )}
      </For>
    </div>
  );
}

function CtrlRow(props: { label: string; children: JSX.Element }) {
  return (
    <div class="flex min-h-7 items-center justify-between gap-2">
      <span class="shrink-0 text-label-regular text-text-normal-secondary">{props.label}</span>
      <div class="flex flex-wrap items-center justify-end gap-1">{props.children}</div>
    </div>
  );
}

function CtrlGroup(props: { title: string; children: JSX.Element }) {
  return (
    <div class="flex flex-col gap-2">
      <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">
        {props.title}
      </p>
      <div class="flex flex-col gap-1.5">{props.children}</div>
    </div>
  );
}

/** One-click copy with a 2-second "Copied!" confirmation. */
function CopyButton(props: { getText: () => string; label?: string; class?: string }) {
  const [copied, setCopied] = createSignal(false);
  const copy = () => {
    navigator.clipboard.writeText(props.getText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      class={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${props.class ?? ""}`}
      classList={{
        "bg-feature-lighter text-feature-base": copied(),
        "text-text-normal-tertiary hover:bg-background-normal-secondary hover:text-text-normal-primary": !copied(),
      }}
      onClick={copy}
    >
      <PhosphorIcon name={copied() ? "check" : "copy"} fontSize={12} />
      <span>{copied() ? "Copied!" : (props.label ?? "Copy")}</span>
    </button>
  );
}

// ─── Card builder state ───────────────────────────────────────────────────────

function createCardBuilderState() {
  // — Card —
  const [cardBg, setCardBg] = createSignal("var(--background-normal-secondary)");
  const [cardRadius, setCardRadius] = createSignal(12);
  const [cardBorderOn, setCardBorderOn] = createSignal(false);
  const [cardBorderColor, setCardBorderColor] = createSignal("var(--stroke-1)");
  // — Icon —
  const [iconStyle, setIconStyle] = createSignal<"icon" | "emoji">("icon");
  const [iconSizePx, setIconSizePx] = createSignal(24);
  const [iconColor, setIconColor] = createSignal("var(--text-normal-primary)");
  // — Icon container —
  const [containerOn, setContainerOn] = createSignal(false);
  const [containerSizePx, setContainerSizePx] = createSignal(32);
  const [containerRadiusPx, setContainerRadiusPx] = createSignal(50);
  const [containerBorderOn, setContainerBorderOn] = createSignal(false);
  const [containerBorderColor, setContainerBorderColor] = createSignal("var(--stroke-1)");
  const [containerFill, setContainerFill] = createSignal("transparent");
  // — Context (background + text) —
  const [ctxBgPrimary,    setCtxBgPrimary]    = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgSecondary,  setCtxBgSecondary]  = createSignal(LIGHT_CTX_DEFAULTS.bgSecondary);
  const [ctxTextPrimary,  setCtxTextPrimary]  = createSignal(LIGHT_CTX_DEFAULTS.textPrimary);
  const [ctxTextSecondary,setCtxTextSecondary]= createSignal(LIGHT_CTX_DEFAULTS.textSecondary);
  const [ctxTextTertiary, setCtxTextTertiary] = createSignal(LIGHT_CTX_DEFAULTS.textTertiary);

  const contextVars = createMemo((): JSX.CSSProperties => ({
    "--background-normal-primary":   ctxBgPrimary(),
    "--background-normal-secondary": ctxBgSecondary(),
    "--text-normal-primary":   ctxTextPrimary(),
    "--text-normal-secondary": ctxTextSecondary(),
    "--text-normal-tertiary":  ctxTextTertiary(),
  }));

  const cardCssVars = createMemo((): JSX.CSSProperties => {
    const hasVisibleContainer =
      containerOn() && (containerFill() !== "transparent" || containerBorderOn());
    return {
      "--sdk-roundness-card": `${cardRadius()}px`,
      "--sdk-category-card-bg": cardBg(),
      "--sdk-category-card-border": cardBorderOn() ? cardBorderColor() : "transparent",
      "--sdk-category-card-icon-color": iconColor(),
      "--sdk-category-card-icon-bg": containerOn() ? containerFill() : "transparent",
      "--sdk-category-card-icon-border":
        containerOn() && containerBorderOn() ? containerBorderColor() : "transparent",
      "--sdk-category-card-icon-container-size": hasVisibleContainer
        ? `${containerSizePx()}px`
        : `${iconSizePx()}px`,
      "--sdk-category-card-icon-container-radius": hasVisibleContainer
        ? `${containerRadiusPx()}px`
        : "9999px",
    };
  });

  const [activeThemeKey, setActiveThemeKey] = createSignal<ThemeKey>("default");

  function applyCtxFromTelescope(t: Record<string, string>) {
    if (t["--background-normal-primary"])   setCtxBgPrimary(t["--background-normal-primary"]);
    if (t["--background-normal-secondary"]) setCtxBgSecondary(t["--background-normal-secondary"]);
    if (t["--text-normal-primary"])   setCtxTextPrimary(t["--text-normal-primary"]);
    if (t["--text-normal-secondary"]) setCtxTextSecondary(t["--text-normal-secondary"]);
    if (t["--text-normal-tertiary"])  setCtxTextTertiary(t["--text-normal-tertiary"]);
  }

  function resetCtxToMode(dark: boolean) {
    const d = dark ? DARK_CTX_DEFAULTS : LIGHT_CTX_DEFAULTS;
    setCtxBgPrimary(d.bgPrimary);
    setCtxBgSecondary(d.bgSecondary);
    setCtxTextPrimary(d.textPrimary);
    setCtxTextSecondary(d.textSecondary);
    setCtxTextTertiary(d.textTertiary);
  }

  function loadTheme(key: ThemeKey) {
    const override = key !== "default" ? designVariantOverrides[key] : undefined;
    const sdk = { ...defaultSdkCssVariables, ...override?.sdkCssVariables };

    setCardRadius(parseInt(sdk["--sdk-roundness-card"]) || 12);
    setCardBg(sdk["--sdk-category-card-bg"] || "var(--background-normal-secondary)");

    const border = sdk["--sdk-category-card-border"];
    if (border && border !== "transparent") { setCardBorderOn(true); setCardBorderColor(border); }
    else { setCardBorderOn(false); }

    setIconColor(sdk["--sdk-category-card-icon-color"] || "var(--text-normal-primary)");
    setIconStyle(override?.defaultIconStyle ?? "icon");

    const iconBg = sdk["--sdk-category-card-icon-bg"];
    const hasContainer = !!iconBg && iconBg !== "transparent";
    setContainerOn(hasContainer);
    setContainerFill(hasContainer ? iconBg : "transparent");

    const iconBorder = sdk["--sdk-category-card-icon-border"];
    if (iconBorder && iconBorder !== "transparent") {
      setContainerBorderOn(true); setContainerBorderColor(iconBorder);
    } else { setContainerBorderOn(false); }

    setContainerSizePx(parseInt(sdk["--sdk-category-card-icon-container-size"]) || 32);
    setContainerRadiusPx(
      Math.min(50, parseInt(sdk["--sdk-category-card-icon-container-radius"]) || 50)
    );

    if (override?.telescopeCssVariables) applyCtxFromTelescope(override.telescopeCssVariables);
    setActiveThemeKey(key);
  }

  function resetCard() {
    setCardBg("var(--background-normal-secondary)");
    setCardRadius(12);
    setCardBorderOn(false);
    setCardBorderColor("var(--stroke-1)");
    setIconStyle("icon");
    setIconSizePx(24);
    setIconColor("var(--text-normal-primary)");
    setContainerOn(false);
    setContainerFill("transparent");
    setContainerSizePx(32);
    setContainerRadiusPx(50);
    setContainerBorderOn(false);
    setContainerBorderColor("var(--stroke-1)");
    setActiveThemeKey("default");
  }

  return {
    cardBg, setCardBg, cardRadius, setCardRadius,
    cardBorderOn, setCardBorderOn, cardBorderColor, setCardBorderColor,
    iconStyle, setIconStyle, iconSizePx, setIconSizePx, iconColor, setIconColor,
    containerOn, setContainerOn, containerSizePx, setContainerSizePx,
    containerRadiusPx, setContainerRadiusPx, containerBorderOn, setContainerBorderOn,
    containerBorderColor, setContainerBorderColor, containerFill, setContainerFill,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
    contextVars, cardCssVars,
    activeThemeKey, loadTheme, resetCtxToMode, resetCard,
  };
}

type CardBuilderState = ReturnType<typeof createCardBuilderState>;

// ─── Appbar builder state ─────────────────────────────────────────────────────

function createAppbarBuilderState() {
  // — Appbar shell —
  const [appbarBg, setAppbarBg] = createSignal("var(--background-normal-primary)");
  const [appbarBorderOn, setAppbarBorderOn] = createSignal(true);
  const [appbarBorderColor, setAppbarBorderColor] = createSignal("var(--stroke-1)");
  const [appbarHeight, setAppbarHeight] = createSignal(44);
  // — Title —
  const [titleSizeKey, setTitleSizeKey] = createSignal<TitleSizeKey>("t6");
  const [titleWeightKey, setTitleWeightKey] = createSignal<TitleWeightKey>("medium");
  const [titleAlign, setTitleAlign] = createSignal<"left" | "center">("left");
  // — Icon —
  const [iconGap, setIconGap] = createSignal(12);
  const [backIconKey, setBackIconKey] = createSignal<"arrow" | "caret">("arrow");
  const backIconName = createMemo(() => backIconKey());
  const [iconSizePx, setIconSizePx] = createSignal(20);
  const [iconContainerOn, setIconContainerOn] = createSignal(false);
  const [iconContainerBg, setIconContainerBg] = createSignal("transparent");
  const [iconContainerBorderOn, setIconContainerBorderOn] = createSignal(false);
  const [iconContainerBorderColor, setIconContainerBorderColor] = createSignal("var(--stroke-2)");
  const [iconContainerSize, setIconContainerSize] = createSignal(32);
  const [iconContainerRadius, setIconContainerRadius] = createSignal(50);
  // — Context (background + text) —
  const [ctxBgPrimary,     setCtxBgPrimary]     = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgSecondary,   setCtxBgSecondary]   = createSignal(LIGHT_CTX_DEFAULTS.bgSecondary);
  const [ctxTextPrimary,   setCtxTextPrimary]   = createSignal(LIGHT_CTX_DEFAULTS.textPrimary);
  const [ctxTextSecondary, setCtxTextSecondary] = createSignal(LIGHT_CTX_DEFAULTS.textSecondary);
  const [ctxTextTertiary,  setCtxTextTertiary]  = createSignal(LIGHT_CTX_DEFAULTS.textTertiary);

  const contextVars = createMemo((): JSX.CSSProperties => ({
    "--background-normal-primary":   ctxBgPrimary(),
    "--background-normal-secondary": ctxBgSecondary(),
    "--text-normal-primary":   ctxTextPrimary(),
    "--text-normal-secondary": ctxTextSecondary(),
    "--text-normal-tertiary":  ctxTextTertiary(),
  }));

  const appbarCssVars = createMemo((): JSX.CSSProperties => {
    const hasVisibleContainer =
      iconContainerOn() && (iconContainerBg() !== "transparent" || iconContainerBorderOn());
    return {
      "--sdk-appbar-bg": appbarBg(),
      "--sdk-appbar-bottom-border": appbarBorderOn() ? appbarBorderColor() : "transparent",
      "--sdk-appbar-height": `${appbarHeight()}px`,
      "--sdk-appbar-title-size": `${TITLE_SIZES[titleSizeKey()].size}px`,
      "--sdk-appbar-title-line-height": `${TITLE_SIZES[titleSizeKey()].lineHeight}px`,
      "--sdk-appbar-title-weight": `${TITLE_WEIGHTS[titleWeightKey()].weight}`,
      "--sdk-appbar-title-tracking": `${TITLE_SIZES[titleSizeKey()].tracking}px`,
      "--sdk-appbar-icon-gap": `${iconGap()}px`,
      "--sdk-appbar-icon-inner-size": `${iconSizePx()}px`,
      "--sdk-appbar-icon-bg": iconContainerOn() ? iconContainerBg() : "transparent",
      "--sdk-appbar-icon-border":
        iconContainerOn() && iconContainerBorderOn() ? iconContainerBorderColor() : "transparent",
      "--sdk-appbar-icon-size": hasVisibleContainer ? `${iconContainerSize()}px` : "32px",
      "--sdk-appbar-icon-radius": hasVisibleContainer ? `${iconContainerRadius()}px` : "9999px",
    };
  });

  function resetAppbar() {
    setAppbarBg("var(--background-normal-primary)");
    setAppbarBorderOn(true);
    setAppbarBorderColor("var(--stroke-1)");
    setAppbarHeight(44);
    setTitleSizeKey("t6");
    setTitleWeightKey("medium");
    setTitleAlign("left");
    setIconGap(12);
    setBackIconKey("arrow");
    setIconSizePx(20);
    setIconContainerOn(false);
    setIconContainerBg("transparent");
    setIconContainerBorderOn(false);
    setIconContainerBorderColor("var(--stroke-2)");
    setIconContainerSize(32);
    setIconContainerRadius(50);
  }

  function resetCtxToMode(dark: boolean) {
    const d = dark ? DARK_CTX_DEFAULTS : LIGHT_CTX_DEFAULTS;
    setCtxBgPrimary(d.bgPrimary);
    setCtxBgSecondary(d.bgSecondary);
    setCtxTextPrimary(d.textPrimary);
    setCtxTextSecondary(d.textSecondary);
    setCtxTextTertiary(d.textTertiary);
  }

  return {
    appbarBg, setAppbarBg, appbarBorderOn, setAppbarBorderOn,
    appbarBorderColor, setAppbarBorderColor,
    appbarHeight, setAppbarHeight,
    titleSizeKey, setTitleSizeKey, titleWeightKey, setTitleWeightKey, titleAlign, setTitleAlign,
    iconGap, setIconGap, backIconKey, setBackIconKey, backIconName,
    iconSizePx, setIconSizePx, iconContainerOn, setIconContainerOn,
    iconContainerBg, setIconContainerBg, iconContainerBorderOn, setIconContainerBorderOn,
    iconContainerBorderColor, setIconContainerBorderColor,
    iconContainerSize, setIconContainerSize, iconContainerRadius, setIconContainerRadius,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
    contextVars, appbarCssVars,
    resetAppbar, resetCtxToMode,
  };
}

type AppbarBuilderState = ReturnType<typeof createAppbarBuilderState>;

// ─── Card builder section ─────────────────────────────────────────────────────

function CardBuilderSection(props: { state: CardBuilderState; categories: MockCategory[] }) {
  const {
    cardBg, setCardBg, cardRadius, setCardRadius,
    cardBorderOn, setCardBorderOn, cardBorderColor, setCardBorderColor,
    iconStyle, setIconStyle, iconSizePx, setIconSizePx, iconColor, setIconColor,
    containerOn, setContainerOn, containerSizePx, setContainerSizePx,
    containerRadiusPx, setContainerRadiusPx, containerBorderOn, setContainerBorderOn,
    containerBorderColor, setContainerBorderColor, containerFill, setContainerFill,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
  } = props.state;

  // — Config popup —
  const [configOpen, setConfigOpen] = createSignal(false);
  const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
  let configBtnRef: HTMLButtonElement | undefined;

  const openConfig = () => {
    if (configBtnRef) {
      const rect = configBtnRef.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setConfigOpen((v) => !v);
  };

  const cssVarRows = createMemo(() =>
    Object.entries(props.state.cardCssVars()).map(([name, value]) => ({ name, value: String(value) }))
  );

  const configAction = (
    <div class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
        onClick={() => props.state.resetCard()}
        title="Reset to defaults"
      >
        <PhosphorIcon name="arrow-ccw" fontSize={13} />
        <span>Reset</span>
      </button>
      <button
        ref={(el) => (configBtnRef = el)}
        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
        classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
        onClick={openConfig}
        title="CSS Variables"
      >
        <PhosphorIcon name="sliders" fontSize={16} />
      </button>
    </div>
  );

  return (
    <>
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">
                CSS Variable Output
              </p>
              <CopyButton
                getText={() => JSON.stringify({
                  defaultIconStyle: iconStyle(),
                  telescopeCssVariables: Object.fromEntries(
                    Object.entries(props.state.contextVars()).map(([k, v]) => [k, String(v)])
                  ),
                  sdkCssVariables: Object.fromEntries(cssVarRows().map((r) => [r.name, r.value])),
                }, null, 2)}
                label="Copy JSON"
              />
            </div>
            <div class="p-3">
              <For each={cssVarRows()}>
                {(row) => (
                  <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.name}</span>
                    <span class="max-w-[160px] break-all text-right font-mono text-[11px] text-text-normal-primary">{row.value}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>

      <Section title="Categories Builder" action={configAction}>
        <div class="flex flex-col gap-4">

          {/* ── Card preview row ── */}
          <div
            class="overflow-x-auto rounded-xl px-6 py-8"
            style={{
              ...props.state.contextVars(),
              ...props.state.cardCssVars(),
              background: ctxBgPrimary(),
              "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
            }}
          >
            <div class="flex gap-2">
              <For each={props.categories}>
                {(cat) => {
                  const IconComp = categoryIconMap[cat.categoryName];
                  return (
                    <SdkCategoryCard
                      class="w-[110px] shrink-0"
                      title={cat.categoryTitle}
                      maxDiscountPercent={cat.maxDiscountPercent}
                      icon={
                        iconStyle() === "emoji"
                          ? <span style={{ "font-size": `${iconSizePx()}px`, "line-height": "1" }}>{categoryEmoji(cat.categoryName)}</span>
                          : IconComp
                          ? <div style={{ width: `${iconSizePx()}px`, height: `${iconSizePx()}px` }}><IconComp class="size-full stroke-current" /></div>
                          : undefined
                      }
                    />
                  );
                }}
              </For>
            </div>
          </div>

          {/* ── 2-column controls ── */}
          <div class="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-stroke-1 pt-4">

            {/* Left: Card */}
            <CtrlGroup title="Card">
              <CtrlRow label="Background">
                <SwatchRow value={cardBg()} onChange={setCardBg} options={CARD_BG_OPTIONS} />
              </CtrlRow>
              <CtrlRow label="Radius">
                <SliderInput min={0} max={32} value={cardRadius()} onChange={setCardRadius} unit="px" />
              </CtrlRow>
              <CtrlRow label="Border">
                <ToggleSwitch value={cardBorderOn()} onChange={setCardBorderOn} />
                <Show when={cardBorderOn()}>
                  <SwatchRow value={cardBorderColor()} onChange={setCardBorderColor} options={BORDER_COLOR_OPTIONS} />
                </Show>
              </CtrlRow>
            </CtrlGroup>

            {/* Right: Icon */}
            <CtrlGroup title="Icon">
              <CtrlRow label="Style">
                <Segment
                  value={iconStyle()} onChange={setIconStyle}
                  options={[{ label: "Icon", value: "icon" as const }, { label: "Emoji", value: "emoji" as const }]}
                />
              </CtrlRow>
              <CtrlRow label="Size">
                <SliderInput min={12} max={40} value={iconSizePx()} onChange={setIconSizePx} unit="px" />
              </CtrlRow>
              <CtrlRow label="Color">
                <SwatchRow value={iconColor()} onChange={setIconColor} options={ICON_COLOR_OPTIONS} />
              </CtrlRow>
            </CtrlGroup>

            {/* Left: Background & Text */}
            <CtrlGroup title="Background & Text">
              <CtrlRow label="Bg Primary">
                <ColorPickerCtrl value={ctxBgPrimary()} onChange={setCtxBgPrimary} />
              </CtrlRow>
              <CtrlRow label="Bg Secondary">
                <ColorPickerCtrl value={ctxBgSecondary()} onChange={setCtxBgSecondary} />
              </CtrlRow>
              <CtrlRow label="Text Primary">
                <ColorPickerCtrl value={ctxTextPrimary()} onChange={setCtxTextPrimary} />
              </CtrlRow>
              <CtrlRow label="Text Sec">
                <ColorPickerCtrl value={ctxTextSecondary()} onChange={setCtxTextSecondary} />
              </CtrlRow>
              <CtrlRow label="Text Ter">
                <ColorPickerCtrl value={ctxTextTertiary()} onChange={setCtxTextTertiary} />
              </CtrlRow>
            </CtrlGroup>

            {/* Right: Icon Container */}
            <CtrlGroup title="Icon Container">
              <CtrlRow label="Show">
                <ToggleSwitch value={containerOn()} onChange={setContainerOn} />
              </CtrlRow>
              <Show when={containerOn()}>
                <CtrlRow label="Fill">
                  <SwatchRow value={containerFill()} onChange={setContainerFill} options={FILL_OPTIONS} />
                </CtrlRow>
                <CtrlRow label="Border">
                  <ToggleSwitch value={containerBorderOn()} onChange={setContainerBorderOn} />
                  <Show when={containerBorderOn()}>
                    <SwatchRow value={containerBorderColor()} onChange={setContainerBorderColor} options={BORDER_COLOR_OPTIONS} />
                  </Show>
                </CtrlRow>
                <Show when={containerFill() !== "transparent" || containerBorderOn()}>
                  <CtrlRow label="Size">
                    <SliderInput min={20} max={72} value={containerSizePx()} onChange={setContainerSizePx} unit="px" />
                  </CtrlRow>
                  <CtrlRow label="Radius">
                    <SliderInput min={0} max={50} value={containerRadiusPx()} onChange={setContainerRadiusPx} unit="px" />
                  </CtrlRow>
                </Show>
              </Show>
            </CtrlGroup>

          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Phone preview shell ──────────────────────────────────────────────────────

/** Wraps content in a phone-shaped preview container with a status bar */
function PhonePreview(props: { children: JSX.Element }) {
  return (
    <div
      class="w-[375px] shrink-0 overflow-hidden rounded-2xl border border-stroke-1"
      style={{
        height: "200px",
        background: "var(--background-normal-primary)",
      }}
    >
      {/* Status bar */}
      <div class="flex items-center justify-between px-5 pb-1 pt-3">
        <span class="text-[11px] font-semibold tabular-nums text-text-normal-tertiary">9:41</span>
        <div class="flex items-center gap-1.5 text-text-normal-tertiary">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M228,128a100,100,0,1,1-100-100A100.11,100.11,0,0,1,228,128Zm-100-84a84,84,0,1,0,84,84A84.09,84.09,0,0,0,128,44ZM76,128a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,128Z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99,49.24a8.07,8.07,0,0,0-3.83,0L29.14,64.2A8,8,0,0,0,23,72V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.94,14.28A8.07,8.07,0,0,0,159,207l66.86-14.95A8,8,0,0,0,232,184V56A8,8,0,0,0,228.92,49.69Z" />
          </svg>
          <div class="flex items-center gap-0.5">
            <div class="h-2.5 w-1 rounded-sm" style={{ background: "var(--text-normal-tertiary)" }} />
            <div class="h-3 w-1 rounded-sm" style={{ background: "var(--text-normal-tertiary)" }} />
            <div class="h-3.5 w-1 rounded-sm" style={{ background: "var(--text-normal-secondary)" }} />
            <div class="h-4 w-1 rounded-sm" style={{ background: "var(--text-normal-primary)" }} />
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
}

/** Skeleton content blocks to give the appbar preview context */
function PageContentSkeleton() {
  return (
    <div class="flex flex-col gap-3 px-4 pb-6 pt-4">
      <div class="h-32 rounded-xl" style={{ background: "var(--background-normal-secondary)" }} />
      <div class="grid grid-cols-3 gap-2">
        <div class="h-20 rounded-xl" style={{ background: "var(--background-normal-secondary)" }} />
        <div class="h-20 rounded-xl" style={{ background: "var(--background-normal-secondary)" }} />
        <div class="h-20 rounded-xl" style={{ background: "var(--background-normal-secondary)" }} />
      </div>
      <div class="h-4 w-2/3 rounded-lg" style={{ background: "var(--background-normal-secondary)" }} />
      <div class="h-4 w-full rounded-lg" style={{ background: "var(--background-normal-secondary)" }} />
      <div class="h-4 w-4/5 rounded-lg" style={{ background: "var(--background-normal-secondary)" }} />
    </div>
  );
}

// ─── Appbar builder section ───────────────────────────────────────────────────

function AppbarBuilderSection(props: { state: AppbarBuilderState }) {
  const {
    appbarBg, setAppbarBg, appbarBorderOn, setAppbarBorderOn,
    appbarBorderColor, setAppbarBorderColor,
    appbarHeight, setAppbarHeight,
    titleSizeKey, setTitleSizeKey, titleWeightKey, setTitleWeightKey, titleAlign, setTitleAlign,
    iconGap, setIconGap, backIconKey, setBackIconKey, backIconName,
    iconSizePx, setIconSizePx, iconContainerOn, setIconContainerOn,
    iconContainerBg, setIconContainerBg, iconContainerBorderOn, setIconContainerBorderOn,
    iconContainerBorderColor, setIconContainerBorderColor,
    iconContainerSize, setIconContainerSize, iconContainerRadius, setIconContainerRadius,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
  } = props.state;

  const TITLE_SIZE_OPTIONS = (Object.keys(TITLE_SIZES) as TitleSizeKey[]).map((k) => ({
    label: TITLE_SIZES[k].label,
    value: k,
  }));
  const TITLE_WEIGHT_OPTIONS = (Object.keys(TITLE_WEIGHTS) as TitleWeightKey[]).map((k) => ({
    label: TITLE_WEIGHTS[k].label,
    value: k,
  }));

  const [configOpen, setConfigOpen] = createSignal(false);
  const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
  let configBtnRef: HTMLButtonElement | undefined;

  const openConfig = () => {
    if (configBtnRef) {
      const rect = configBtnRef.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setConfigOpen((v) => !v);
  };

  const cssVarRows = createMemo(() =>
    Object.entries(props.state.appbarCssVars()).map(([name, value]) => ({ name, value: String(value) }))
  );

  const getAppbarJson = () => JSON.stringify({
    appbarCssVariables: Object.fromEntries(
      [
        ...Object.entries(props.state.contextVars()),
        ...Object.entries(props.state.appbarCssVars()),
      ].map(([k, v]) => [k, String(v)])
    ),
    appbarConfig: {
      backIcon: backIconKey(),
      titleAlign: titleAlign(),
    },
  }, null, 2);

  const configAction = (
    <div class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
        onClick={() => props.state.resetAppbar()}
        title="Reset to defaults"
      >
        <PhosphorIcon name="arrow-ccw" fontSize={13} />
        <span>Reset</span>
      </button>
      <button
        ref={(el) => (configBtnRef = el)}
        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
        classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
        onClick={openConfig}
        title="CSS Variables"
      >
        <PhosphorIcon name="sliders" fontSize={16} />
      </button>
    </div>
  );

  return (
    <>
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">
                CSS Variable Output
              </p>
              <CopyButton getText={getAppbarJson} label="Copy JSON" />
            </div>
            <div class="p-3">
              <For each={cssVarRows()}>
                {(row) => (
                  <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.name}</span>
                    <span class="max-w-[160px] break-all text-right font-mono text-[11px] text-text-normal-primary">{row.value}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>

      <Section title="Appbar Builder" action={configAction}>
        <div class="flex flex-col gap-4">

          {/* ── Phone preview ── */}
          <div
            class="flex justify-center"
            style={{
              ...props.state.contextVars(),
              ...props.state.appbarCssVars(),
            }}
          >
            <PhonePreview>
              <SdkAppbar title="Gift Cards" backIcon={backIconName()} titleAlign={titleAlign()} />
              <PageContentSkeleton />
            </PhonePreview>
          </div>

          {/* ── 2-column controls ── */}
          <div class="grid grid-cols-2 gap-x-6 border-t border-stroke-1 pt-4">

            {/* Left column */}
            <div class="flex flex-col gap-4">

            <CtrlGroup title="Appbar">
              <CtrlRow label="Background">
                <SwatchRow value={appbarBg()} onChange={setAppbarBg} options={CARD_BG_OPTIONS} />
              </CtrlRow>
              <CtrlRow label="Height">
                <SliderInput min={40} max={80} value={appbarHeight()} onChange={setAppbarHeight} unit="px" />
              </CtrlRow>
              <CtrlRow label="Border">
                <ToggleSwitch value={appbarBorderOn()} onChange={setAppbarBorderOn} />
                <Show when={appbarBorderOn()}>
                  <SwatchRow value={appbarBorderColor()} onChange={setAppbarBorderColor} options={BORDER_COLOR_OPTIONS} />
                </Show>
              </CtrlRow>
            </CtrlGroup>

            <CtrlGroup title="Background & Text">
              <CtrlRow label="Bg Primary">
                <ColorPickerCtrl value={ctxBgPrimary()} onChange={setCtxBgPrimary} />
              </CtrlRow>
              <CtrlRow label="Bg Secondary">
                <ColorPickerCtrl value={ctxBgSecondary()} onChange={setCtxBgSecondary} />
              </CtrlRow>
              <CtrlRow label="Text Primary">
                <ColorPickerCtrl value={ctxTextPrimary()} onChange={setCtxTextPrimary} />
              </CtrlRow>
              <CtrlRow label="Text Sec">
                <ColorPickerCtrl value={ctxTextSecondary()} onChange={setCtxTextSecondary} />
              </CtrlRow>
              <CtrlRow label="Text Ter">
                <ColorPickerCtrl value={ctxTextTertiary()} onChange={setCtxTextTertiary} />
              </CtrlRow>
            </CtrlGroup>

            </div>{/* end left column */}

            {/* Right column */}
            <div class="flex flex-col gap-4">

            <CtrlGroup title="Title & Icon">
              <CtrlRow label="Title style">
                <Segment value={titleSizeKey()} onChange={setTitleSizeKey} options={TITLE_SIZE_OPTIONS} />
              </CtrlRow>
              <CtrlRow label="Weight">
                <Segment value={titleWeightKey()} onChange={setTitleWeightKey} options={TITLE_WEIGHT_OPTIONS} />
              </CtrlRow>
              <CtrlRow label="Alignment">
                <Segment
                  value={titleAlign()} onChange={setTitleAlign}
                  options={[
                    { label: "Left", value: "left" as const },
                    { label: "Center", value: "center" as const },
                  ]}
                />
              </CtrlRow>
              <CtrlRow label="Icon type">
                <Segment
                  value={backIconKey()} onChange={setBackIconKey}
                  options={[
                    { label: "Arrow", value: "arrow" as const },
                    { label: "Caret", value: "caret" as const },
                  ]}
                />
              </CtrlRow>
              <CtrlRow label="Icon gap">
                <SliderInput min={0} max={32} value={iconGap()} onChange={setIconGap} unit="px" />
              </CtrlRow>
              <CtrlRow label="Icon size">
                <SliderInput min={12} max={32} value={iconSizePx()} onChange={setIconSizePx} unit="px" />
              </CtrlRow>
              <CtrlRow label="Icon container">
                <ToggleSwitch value={iconContainerOn()} onChange={setIconContainerOn} />
              </CtrlRow>
              <Show when={iconContainerOn()}>
                <CtrlRow label="Fill">
                  <SwatchRow value={iconContainerBg()} onChange={setIconContainerBg} options={FILL_OPTIONS} />
                </CtrlRow>
                <CtrlRow label="Border">
                  <ToggleSwitch value={iconContainerBorderOn()} onChange={setIconContainerBorderOn} />
                  <Show when={iconContainerBorderOn()}>
                    <SwatchRow value={iconContainerBorderColor()} onChange={setIconContainerBorderColor} options={BORDER_COLOR_OPTIONS} />
                  </Show>
                </CtrlRow>
                <Show when={iconContainerBg() !== "transparent" || iconContainerBorderOn()}>
                  <CtrlRow label="Size">
                    <SliderInput min={24} max={56} value={iconContainerSize()} onChange={setIconContainerSize} unit="px" />
                  </CtrlRow>
                  <CtrlRow label="Radius">
                    <SliderInput min={0} max={50} value={iconContainerRadius()} onChange={setIconContainerRadius} unit="px" />
                  </CtrlRow>
                </Show>
              </Show>
            </CtrlGroup>

            </div>{/* end right column */}

          </div>{/* end 2-col grid */}
        </div>{/* end flex-col gap-4 */}
      </Section>
    </>
  );
}

// ─── Appbar brand card ────────────────────────────────────────────────────────

function AppbarBrandCard(props: {
  theme: typeof appbarThemes[number];
  darkMode: () => boolean;
}) {
  const [configOpen, setConfigOpen] = createSignal(false);
  const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
  let configBtnRef: HTMLButtonElement | undefined;

  const openConfig = () => {
    if (configBtnRef) {
      const rect = configBtnRef.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setConfigOpen((v) => !v);
  };

  const cssVarRows = () =>
    Object.entries(props.theme.appbarCssVariables ?? {}).map(([name, value]) => ({ name, value }));

  const getJson = () => JSON.stringify({
    appbarCssVariables: props.theme.appbarCssVariables ?? {},
    appbarConfig: props.theme.appbarConfig ?? {},
  }, null, 2);

  return (
    <div class="flex flex-col gap-1.5">
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">
                {props.theme.label}
              </p>
              <CopyButton getText={getJson} label="Copy JSON" />
            </div>
            <div class="p-3">
              <For each={cssVarRows()}>
                {(row) => (
                  <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.name}</span>
                    <span class="max-w-[160px] break-all text-right font-mono text-[11px] text-text-normal-primary">{row.value}</span>
                  </div>
                )}
              </For>
              <Show when={props.theme.appbarConfig}>
                <div class="mt-1 border-t border-stroke-1 pt-1">
                  <For each={Object.entries(props.theme.appbarConfig ?? {})}>
                    {([k, v]) => (
                      <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                        <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{k}</span>
                        <span class="font-mono text-[11px] text-text-normal-primary">{v as string}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Portal>
      </Show>

      <div class="flex items-center justify-between">
        <p class="text-label-semi-bold text-text-normal-primary">{props.theme.label}</p>
        <div class="flex items-center gap-1">
          <button
            ref={(el) => (configBtnRef = el)}
            class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
            classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
            onClick={openConfig}
          >
            <PhosphorIcon name="code" fontSize={13} />
            <span>Config</span>
          </button>
        </div>
      </div>

      <div
        class="flex justify-center"
        style={{
          ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
          ...(props.theme.appbarCssVariables as JSX.CSSProperties | undefined),
        }}
      >
        <PhonePreview>
          <SdkAppbar
            title="Gift Cards"
            backIcon={props.theme.appbarConfig?.backIcon ?? "arrow"}
            titleAlign={props.theme.appbarConfig?.titleAlign ?? "left"}
          />
          <PageContentSkeleton />
        </PhonePreview>
      </div>
    </div>
  );
}

// ─── Appbar brands section ────────────────────────────────────────────────────

function AppbarBrandsSection(props: {
  darkMode: () => boolean;
  appbarCssVars: () => JSX.CSSProperties;
}) {
  return (
    <Show when={appbarThemes.length > 0}>
      <Section title="Brands">
        <div class="flex flex-col gap-6">
          <For each={appbarThemes}>
            {(theme) => <AppbarBrandCard theme={theme} darkMode={props.darkMode} />}
          </For>
        </div>
      </Section>
    </Show>
  );
}

// ─── Config modal ─────────────────────────────────────────────────────────────

function CfgSection(props: { title: string; children: JSX.Element }) {
  return (
    <div>
      <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">
        {props.title}
      </p>
      <div class="flex flex-col divide-y divide-stroke-1 rounded-lg border border-stroke-1 bg-background-normal-secondary px-3">
        {props.children}
      </div>
    </div>
  );
}

function CfgKVRow(props: { label: string; value: string }) {
  const isHex = () => /^#[0-9a-fA-F]{3,8}$/.test(props.value);
  return (
    <div class="flex items-center justify-between gap-3 py-2">
      <span class="text-[11px] text-text-normal-tertiary">{props.label}</span>
      <span class="flex items-center gap-1.5 font-mono text-[11px] text-text-normal-primary">
        <Show when={isHex()}>
          <span class="inline-block size-3 shrink-0 rounded-sm border border-stroke-1" style={{ background: props.value }} />
        </Show>
        {props.value}
      </span>
    </div>
  );
}

function CfgToggleRow(props: { label: string; on: boolean; value?: string }) {
  const isHex = () => !!props.value && /^#[0-9a-fA-F]{3,8}$/.test(props.value);
  return (
    <div class="flex items-center justify-between gap-3 py-2">
      <span class="text-[11px] text-text-normal-tertiary">{props.label}</span>
      <div class="flex items-center gap-1.5">
        <Show when={props.on && props.value}>
          <Show when={isHex()}>
            <span class="inline-block size-3 shrink-0 rounded-sm border border-stroke-1" style={{ background: props.value }} />
          </Show>
          <span class="font-mono text-[11px] text-text-normal-primary">{props.value}</span>
        </Show>
        <span
          class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
          classList={{
            "bg-feature-lighter text-feature-base": props.on,
            "bg-background-normal-tertiary text-text-normal-tertiary": !props.on,
          }}
        >
          {props.on ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
}

function ConfigModal(props: { data: ConfigModalData; onClose: () => void }) {
  const tele = () => props.data.telescopeCssVariables ?? {};
  const sdk = () => props.data.sdkCssVariables ?? {};
  const cardBorder = () => sdk()["--sdk-category-card-border"] ?? "transparent";
  const cardBorderOn = () => cardBorder() !== "transparent";
  const containerBg = () => sdk()["--sdk-category-card-icon-bg"] ?? "transparent";
  const containerBorder = () => sdk()["--sdk-category-card-icon-border"] ?? "transparent";
  const containerOn = () => containerBg() !== "transparent" || containerBorder() !== "transparent";
  const containerBorderOn = () => containerBorder() !== "transparent";
  const hasBgText = () => TELESCOPE_COLOR_KEYS.some((k) => tele()[k] !== undefined);
  const hasSdk = () => Object.keys(sdk()).length > 0 || !!props.data.defaultIconStyle;

  return (
    <Portal>
      <div class="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm" onClick={props.onClose} />
      <div class="pointer-events-none fixed inset-0 z-[401] flex items-center justify-center p-4">
        <div class="pointer-events-auto flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-stroke-1 bg-background-normal-primary shadow-2xl">
          <div class="flex shrink-0 items-center justify-between border-b border-stroke-1 px-4 py-3">
            <div>
              <p class="text-label-semi-bold text-text-normal-primary">{props.data.label}</p>
              <p class="text-[11px] text-text-normal-tertiary">Theme config</p>
            </div>
            <div class="flex items-center gap-1">
              <CopyButton
                getText={() => {
                  const obj: Record<string, unknown> = {
                    key: props.data.key ?? "custom",
                    label: props.data.label,
                  };
                  if (props.data.defaultIconStyle) obj.defaultIconStyle = props.data.defaultIconStyle;
                  if (props.data.fontImportUrl) obj.fontImportUrl = props.data.fontImportUrl;
                  if (props.data.telescopeCssVariables && Object.keys(props.data.telescopeCssVariables).length)
                    obj.telescopeCssVariables = props.data.telescopeCssVariables;
                  if (props.data.sdkCssVariables && Object.keys(props.data.sdkCssVariables).length)
                    obj.sdkCssVariables = props.data.sdkCssVariables;
                  return JSON.stringify(obj, null, 2);
                }}
                label="Copy JSON"
              />
              <button
                class="flex size-7 items-center justify-center rounded-lg text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary"
                onClick={props.onClose}
              >
                <PhosphorIcon name="x" fontSize={16} />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-4 overflow-y-auto p-4">
            <Show when={hasBgText()}>
              <CfgSection title="Background & Text">
                <For each={TELESCOPE_COLOR_KEYS.filter((k) => tele()[k] !== undefined)}>
                  {(k) => <CfgKVRow label={k.replace(/^--/, "").replace(/-/g, " ")} value={tele()[k]} />}
                </For>
              </CfgSection>
            </Show>
            <Show when={hasSdk()}>
              <CfgSection title="Card">
                <Show when={sdk()["--sdk-category-card-bg"] !== undefined}>
                  <CfgKVRow label="Background" value={sdk()["--sdk-category-card-bg"]!} />
                </Show>
                <Show when={sdk()["--sdk-roundness-card"] !== undefined}>
                  <CfgKVRow label="Radius" value={sdk()["--sdk-roundness-card"]!} />
                </Show>
                <CfgToggleRow label="Border" on={cardBorderOn()} value={cardBorderOn() ? cardBorder() : undefined} />
              </CfgSection>
              <CfgSection title="Icon">
                <CfgKVRow label="Style" value={props.data.defaultIconStyle ?? "icon"} />
                <Show when={sdk()["--sdk-category-card-icon-color"] !== undefined}>
                  <CfgKVRow label="Color" value={sdk()["--sdk-category-card-icon-color"]!} />
                </Show>
              </CfgSection>
              <CfgSection title="Icon Container">
                <CfgToggleRow label="Visible" on={containerOn()} />
                <Show when={containerOn()}>
                  <Show when={sdk()["--sdk-category-card-icon-bg"] !== undefined}>
                    <CfgKVRow label="Fill" value={containerBg()} />
                  </Show>
                  <Show when={sdk()["--sdk-category-card-icon-container-size"] !== undefined}>
                    <CfgKVRow label="Size" value={sdk()["--sdk-category-card-icon-container-size"]!} />
                  </Show>
                  <Show when={sdk()["--sdk-category-card-icon-container-radius"] !== undefined}>
                    <CfgKVRow label="Radius" value={sdk()["--sdk-category-card-icon-container-radius"]!} />
                  </Show>
                  <CfgToggleRow label="Border" on={containerBorderOn()} value={containerBorderOn() ? containerBorder() : undefined} />
                </Show>
              </CfgSection>
            </Show>
            <Show when={SDK_LISTING_CONFIG_KEYS.some((k) => sdk()[k] !== undefined)}>
              <CfgSection title="Listing">
                <Show when={sdk()["--text-listing"] !== undefined}>
                  <CfgKVRow label="Discount color" value={sdk()["--text-listing"]!} />
                </Show>
                <Show when={sdk()["--sdk-listing-image-radius"] !== undefined}>
                  <CfgKVRow label="Image radius" value={sdk()["--sdk-listing-image-radius"]!} />
                </Show>
              </CfgSection>
            </Show>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ─── Invisible container collapse ────────────────────────────────────────────

function collapseInvisibleContainer(sdkVars: Record<string, string> | undefined): JSX.CSSProperties {
  if (!sdkVars) return {};
  const bg = sdkVars["--sdk-category-card-icon-bg"] ?? "transparent";
  const border = sdkVars["--sdk-category-card-icon-border"] ?? "transparent";
  if (bg !== "transparent" || border !== "transparent") return {};
  return { "--sdk-category-card-icon-container-size": "24px" } as JSX.CSSProperties;
}

// ─── Unified brands section ───────────────────────────────────────────────────
// Built-in showcase themes are seeded into localStorage on first visit so they
// appear in the same list as custom-added brands and can be deleted like any other.

const BRANDS_KEY = "hcp-brands";
const BRANDS_INIT_KEY = "hcp-brands-init";

type Brand = {
  key: string;
  label: string;
  defaultIconStyle?: "icon" | "emoji";
  fontImportUrl?: string;
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

/** Fixed reference card — always shows SDK defaults, never moves with the builder */
const DEFAULT_BRAND: Brand = {
  key: "default",
  label: "Default",
  defaultIconStyle: "icon",
  sdkCssVariables: {
    "--sdk-roundness-card": "12px",
    "--sdk-category-card-bg": "var(--background-normal-secondary)",
    "--sdk-category-card-border": "transparent",
    "--sdk-category-card-icon-bg": "transparent",
    "--sdk-category-card-icon-border": "transparent",
    "--sdk-category-card-icon-container-size": "24px",
    "--sdk-category-card-icon-container-radius": "9999px",
    "--sdk-category-card-icon-color": "var(--text-normal-primary)",
  },
};

/** Built-in showcase brands — seeded on first load */
const SEED_BRANDS: Brand[] = [
  DEFAULT_BRAND,
  ...SHOWCASE_KEYS.map((k) => brandThemes.find((t) => t.key === k)).filter(Boolean) as Brand[],
];

function loadBrands(): Brand[] {
  try {
    const s = localStorage.getItem(BRANDS_KEY);
    return s ? (JSON.parse(s) as Brand[]) : [];
  } catch { return []; }
}
function saveBrands(b: Brand[]) {
  localStorage.setItem(BRANDS_KEY, JSON.stringify(b));
}
function loadFont(url: string) {
  if (!url || document.querySelector(`link[href="${url}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = url;
  document.head.appendChild(l);
}

function BrandsSection(props: {
  darkMode: () => boolean;
  cardCssVars: () => JSX.CSSProperties;
  listingCssVars: () => JSX.CSSProperties;
  onOpenConfig: (data: ConfigModalData) => void;
  categories: MockCategory[];
}) {
  const [brands, setBrands] = createSignal<Brand[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => {
    const initialized = localStorage.getItem(BRANDS_INIT_KEY);
    let list: Brand[];
    if (!initialized) {
      list = SEED_BRANDS;
      saveBrands(list);
      localStorage.setItem(BRANDS_INIT_KEY, "1");
    } else {
      list = loadBrands();
      // Migration: ensure the Default brand is always present at position 0
      if (!list.find((b) => b.key === "default")) {
        list = [DEFAULT_BRAND, ...list];
        saveBrands(list);
      }
    }
    setBrands(list);
    list.forEach((b) => b.fontImportUrl && loadFont(b.fontImportUrl));
  });

  const addBrand = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a brand name"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p !== "object" || p === null || Array.isArray(p)) {
        setParseError("Invalid JSON: expected an object"); return;
      }
      const brand: Brand = {
        key: `custom-${Date.now()}`,
        label: name,
        defaultIconStyle: p["defaultIconStyle"] as "icon" | "emoji" | undefined,
        fontImportUrl: p["fontImportUrl"] as string | undefined,
        telescopeCssVariables: p["telescopeCssVariables"] as Record<string, string> | undefined,
        sdkCssVariables: p["sdkCssVariables"] as Record<string, string> | undefined,
      };
      if (brand.fontImportUrl) loadFont(brand.fontImportUrl);
      const updated = [...brands(), brand];
      setBrands(updated); saveBrands(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const deleteBrand = (key: string) => {
    const updated = brands().filter((b) => b.key !== key);
    setBrands(updated); saveBrands(updated);
  };

  const BrandCard = (brand: Brand) => (
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <p class="text-label-semi-bold text-text-normal-primary">{brand.label}</p>
        <div class="flex items-center gap-1">
          <button
            class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
            onClick={() => props.onOpenConfig({
              key: brand.key,
              label: brand.label,
              defaultIconStyle: brand.defaultIconStyle,
              fontImportUrl: brand.fontImportUrl,
              telescopeCssVariables: brand.telescopeCssVariables,
              sdkCssVariables: brand.sdkCssVariables,
            })}
          >
            <PhosphorIcon name="code" fontSize={13} />
            <span>Config</span>
          </button>
          <button
            class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
            onClick={() => deleteBrand(brand.key)}
          >
            <PhosphorIcon name="trash" fontSize={14} />
          </button>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-xl"
        style={{
          ...(brand.key !== "default" ? props.cardCssVars() : {}),
          ...props.listingCssVars(),
          ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
          ...(brand.telescopeCssVariables as JSX.CSSProperties | undefined),
          ...(brand.sdkCssVariables as JSX.CSSProperties | undefined),
          ...collapseInvisibleContainer(brand.sdkCssVariables),
          background: "var(--background-normal-primary)",
          "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
        }}
      >
        {/* Category cards */}
        <div class="flex flex-wrap gap-2 p-6">
          <For each={props.categories.slice(0, 5)}>
            {(cat) => {
              const IconComponent = categoryIconMap[cat.categoryName];
              const useEmoji = brand.defaultIconStyle === "emoji";
              return (
                <SdkCategoryCard
                  class="w-[120px]"
                  title={cat.categoryTitle ?? cat.categoryName}
                  maxDiscountPercent={cat.maxDiscountPercent}
                  icon={
                    useEmoji
                      ? <span style={{ "font-size": "24px", "line-height": "1" }}>{categoryEmoji(cat.categoryName)}</span>
                      : IconComponent ? <IconComponent class="size-6 stroke-current" /> : undefined
                  }
                />
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Add custom brand ── */}
      <Section
        title="Custom Brand"
        subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response"
        action={<CopyButton getText={() => EXTRACTION_PROMPT} label="Copy Prompt" />}
      >
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-24 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
            placeholder={`Paste brand JSON here…\n{\n  "telescopeCssVariables": { "--background-normal-primary": "#..." },\n  "sdkCssVariables": { "--sdk-category-card-bg": "..." },\n  "defaultIconStyle": "icon"\n}`}
            value={jsonInput()}
            onInput={(e) => { setJsonInput(e.currentTarget.value); setParseError(null); }}
          />
          <Show when={parseError()}>
            <p class="text-[11px] text-red-400">{parseError()}</p>
          </Show>
          <div class="flex gap-2">
            <input
              type="text"
              class="min-w-0 flex-1 rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 text-label-regular text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
              placeholder="Brand name…"
              value={nameInput()}
              onInput={(e) => setNameInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && addBrand()}
            />
            <button
              class="shrink-0 rounded-lg bg-feature-base px-4 py-2 text-label-semi-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!jsonInput().trim() || !nameInput().trim()}
              onClick={addBrand}
            >
              Add
            </button>
          </div>
        </div>
      </Section>

      {/* ── Brands list ── */}
      <Show when={brands().length > 0}>
        <Section title="Brands">
          <div class="flex flex-col gap-4">
            <For each={brands()}>{(brand) => BrandCard(brand)}</For>
          </div>
        </Section>
      </Show>
    </>
  );
}

// ─── Basics tab ──────────────────────────────────────────────────────────────

const TYPE_STYLES: { label: string; className: string; size: string; weight: string }[] = [
  { label: "Display 4",      className: "text-display-4-semi-bold", size: "48px", weight: "600" },
  { label: "Title 1",        className: "text-title-1-semi-bold",   size: "36px", weight: "600" },
  { label: "Title 2",        className: "text-title-2-semi-bold",   size: "32px", weight: "600" },
  { label: "Title 3",        className: "text-title-3-semi-bold",   size: "24px", weight: "600" },
  { label: "Title 4",        className: "text-title-4-semi-bold",   size: "20px", weight: "600" },
  { label: "Title 5",        className: "text-title-5-semi-bold",   size: "16px", weight: "600" },
  { label: "Title 6",        className: "text-title-6-semi-bold",   size: "14px", weight: "600" },
  { label: "Para 2 Regular", className: "text-para-2-regular",      size: "16px", weight: "400" },
  { label: "Para 2 SemiBold",className: "text-para-2-semi-bold",    size: "16px", weight: "600" },
  { label: "Label Regular",  className: "text-label-regular",       size: "12px", weight: "400" },
  { label: "Label SemiBold", className: "text-label-semi-bold",     size: "12px", weight: "600" },
  { label: "Caption Regular",className: "text-caption-regular",     size: "10px", weight: "400" },
];

function TypographySection() {
  return (
    <Section title="Typography">
      <div class="overflow-hidden rounded-xl border border-stroke-1">
        <For each={TYPE_STYLES}>
          {(s, i) => (
            <div
              class="flex items-baseline justify-between gap-4 px-4 py-3"
              classList={{ "border-t border-stroke-1": i() > 0 }}
            >
              <span class={`${s.className} text-text-normal-primary`}>{s.label}</span>
              <span class="shrink-0 font-mono text-label-regular text-text-normal-tertiary">
                {s.size} / {s.weight}
              </span>
            </div>
          )}
        </For>
      </div>
    </Section>
  );
}

type BtnVariant = { label: string; bg: string; text: string; border?: string; opacity?: boolean };

const BUTTON_VARIANTS: BtnVariant[] = [
  { label: "Primary · Brand",     bg: "var(--brand-tbd-base)",             text: "#fff" },
  { label: "Secondary · Brand",   bg: "transparent",                       text: "var(--feature-base)",        border: "1px solid var(--feature-base)" },
  { label: "Tertiary · Brand",    bg: "var(--feature-lighter)",            text: "var(--feature-base)" },
  { label: "Ghost · Brand",       bg: "transparent",                       text: "var(--feature-base)" },
  { label: "Primary · Neutral",   bg: "var(--background-inverted-primary)",text: "var(--text-inverted-primary)" },
  { label: "Secondary · Neutral", bg: "transparent",                       text: "var(--text-normal-primary)", border: "1px solid var(--stroke-solid)" },
  { label: "Error",               bg: "var(--error-base, #ef4444)",        text: "#fff" },
  { label: "Disabled",            bg: "var(--brand-tbd-base)",             text: "#fff", opacity: true },
];

const ICON_BUTTONS: { bg: string; text: string; border?: string }[] = [
  { bg: "var(--brand-tbd-base)",              text: "#fff" },
  { bg: "transparent",                         text: "var(--feature-base)",        border: "1px solid var(--feature-base)" },
  { bg: "var(--feature-lighter)",             text: "var(--feature-base)" },
  { bg: "transparent",                         text: "var(--feature-base)" },
  { bg: "var(--background-inverted-primary)", text: "var(--text-inverted-primary)" },
  { bg: "var(--error-base, #ef4444)",         text: "#fff" },
  { bg: "var(--background-normal-secondary)", text: "var(--text-normal-tertiary)" },
];

function ButtonsSection() {
  return (
    <Section title="Buttons">
      <div class="flex flex-col gap-3 rounded-xl border border-stroke-1 p-4">
        <For each={BUTTON_VARIANTS}>
          {(v) => (
            <button
              class="flex h-11 w-full items-center justify-center rounded-xl text-label-semi-bold transition-opacity"
              style={{
                background: v.bg,
                color: v.text,
                border: v.border ?? "none",
                opacity: v.opacity ? "0.4" : "1",
              }}
            >
              {v.label}
            </button>
          )}
        </For>

        {/* Round icon buttons */}
        <div class="flex flex-wrap gap-2 border-t border-stroke-1 pt-3">
          <For each={ICON_BUTTONS}>
            {(b) => (
              <button
                class="flex size-11 items-center justify-center rounded-full"
                style={{
                  background: b.bg,
                  color: b.text,
                  border: b.border ?? "none",
                }}
              >
                <PhosphorIcon name="list" fontSize={20} />
              </button>
            )}
          </For>
        </div>
      </div>
    </Section>
  );
}

function BasicsPlayground() {
  return (
    <div class="flex flex-col gap-16 p-4 pb-20">
      <TypographySection />
      <ButtonsSection />
    </div>
  );
}

// ─── Playground grid ──────────────────────────────────────────────────────────

function PlaygroundGrid(props: { darkMode: () => boolean }) {
  const state = createCardBuilderState();
  const listingState = createListingBuilderState();
  const [configModalData, setConfigModalData] = createSignal<ConfigModalData | null>(null);

  return (
    <>
      <Show when={configModalData()}>
        {(data) => <ConfigModal data={data()} onClose={() => setConfigModalData(null)} />}
      </Show>
      <div class="flex flex-col gap-16 p-4 pb-20">
        <CardBuilderSection state={state} categories={MOCK_CATEGORIES} />
        <BrandsSection
          darkMode={props.darkMode}
          cardCssVars={state.cardCssVars}
          listingCssVars={listingState.listingCssVars}
          onOpenConfig={setConfigModalData}
          categories={MOCK_CATEGORIES}
        />
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type PlaygroundTab = "categories" | "appbar" | "listing" | "basics";

// ─── Listing data (imported from API response) ────────────────────────────────

type ListingItem = {
  id: string;
  title: string;
  tags: string[];
  discountPercentage: number;
  imageUrl: string;
};

const LISTING_DATA: ListingItem[] = listingDataRaw as ListingItem[];

// ─── Listing CSS var options ──────────────────────────────────────────────────

const LISTING_COLOR_OPTIONS: ColorOption[] = [
  { label: "Feature",  value: "var(--feature-base)" },
  { label: "Brand",    value: "var(--brand-tbd-base)" },
  { label: "Primary",  value: "var(--text-normal-primary)" },
  { label: "Secondary",value: "var(--text-normal-secondary)" },
  { label: "Warning",  value: "#f59e0b" },
];

// ─── Listing builder state ────────────────────────────────────────────────────

function createListingBuilderState() {
  const [imageRadius, setImageRadius] = createSignal(16);
  const [listingColor, setListingColor] = createSignal("var(--feature-base)");
  // — Context —
  const [ctxBgPrimary,     setCtxBgPrimary]     = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgSecondary,   setCtxBgSecondary]   = createSignal(LIGHT_CTX_DEFAULTS.bgSecondary);
  const [ctxTextPrimary,   setCtxTextPrimary]   = createSignal(LIGHT_CTX_DEFAULTS.textPrimary);
  const [ctxTextSecondary, setCtxTextSecondary] = createSignal(LIGHT_CTX_DEFAULTS.textSecondary);
  const [ctxTextTertiary,  setCtxTextTertiary]  = createSignal(LIGHT_CTX_DEFAULTS.textTertiary);

  const contextVars = createMemo((): JSX.CSSProperties => ({
    "--background-normal-primary":   ctxBgPrimary(),
    "--background-normal-secondary": ctxBgSecondary(),
    "--text-normal-primary":   ctxTextPrimary(),
    "--text-normal-secondary": ctxTextSecondary(),
    "--text-normal-tertiary":  ctxTextTertiary(),
  }));

  const listingCssVars = createMemo((): JSX.CSSProperties => ({
    "--sdk-listing-image-radius": `${imageRadius()}px`,
    "--text-listing": listingColor(),
  }));

  function resetListing() {
    setImageRadius(16);
    setListingColor("var(--feature-base)");
  }

  function resetCtxToMode(dark: boolean) {
    const d = dark ? DARK_CTX_DEFAULTS : LIGHT_CTX_DEFAULTS;
    setCtxBgPrimary(d.bgPrimary); setCtxBgSecondary(d.bgSecondary);
    setCtxTextPrimary(d.textPrimary); setCtxTextSecondary(d.textSecondary);
    setCtxTextTertiary(d.textTertiary);
  }

  return {
    imageRadius, setImageRadius, listingColor, setListingColor,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
    contextVars, listingCssVars, resetListing, resetCtxToMode,
  };
}

// ─── Listing builder section ──────────────────────────────────────────────────

function ListingBuilderSection(props: { state: ReturnType<typeof createListingBuilderState> }) {
  const {
    imageRadius, setImageRadius, listingColor, setListingColor,
    ctxBgPrimary, setCtxBgPrimary, ctxBgSecondary, setCtxBgSecondary,
    ctxTextPrimary, setCtxTextPrimary, ctxTextSecondary, setCtxTextSecondary,
    ctxTextTertiary, setCtxTextTertiary,
  } = props.state;

  const [configOpen, setConfigOpen] = createSignal(false);
  const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
  let configBtnRef: HTMLButtonElement | undefined;

  const openConfig = () => {
    if (configBtnRef) {
      const rect = configBtnRef.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setConfigOpen((v) => !v);
  };

  const cssVarRows = createMemo(() =>
    Object.entries(props.state.listingCssVars()).map(([name, value]) => ({ name, value: String(value) }))
  );

  const configAction = (
    <div class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
        onClick={() => props.state.resetListing()}
        title="Reset to defaults"
      >
        <PhosphorIcon name="arrow-ccw" fontSize={13} />
        <span>Reset</span>
      </button>
      <button
        ref={(el) => (configBtnRef = el)}
        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
        classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
        onClick={openConfig}
        title="CSS Variables"
      >
        <PhosphorIcon name="sliders" fontSize={16} />
      </button>
    </div>
  );

  return (
    <>
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">CSS Variable Output</p>
              <CopyButton
                getText={() => JSON.stringify({
                  telescopeCssVariables: Object.fromEntries(
                    Object.entries(props.state.contextVars()).map(([k, v]) => [k, String(v)])
                  ),
                  sdkCssVariables: Object.fromEntries(cssVarRows().map((r) => [r.name, r.value])),
                }, null, 2)}
                label="Copy JSON"
              />
            </div>
            <div class="p-3">
              <For each={cssVarRows()}>
                {(row) => (
                  <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.name}</span>
                    <span class="max-w-[160px] break-all text-right font-mono text-[11px] text-text-normal-primary">{row.value}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>

      <Section title="Listing Builder" action={configAction}>
        <div class="flex flex-col gap-4">

          {/* ── Preview ── */}
          <div
            class="overflow-hidden rounded-2xl border border-stroke-1"
            style={{
              ...props.state.contextVars(),
              ...props.state.listingCssVars(),
              background: ctxBgPrimary(),
            }}
          >
            <div class="grid gap-4 overflow-x-auto no-scrollbar" style={{ "grid-auto-flow": "column", "grid-template-rows": "1fr", padding: "12px" }}>
              <For each={LISTING_DATA.slice(0, 5)}>
                {(item) => (
                  <SdkListingCard
                    title={item.title}
                    tags={item.tags}
                    discountPercent={item.discountPercentage}
                    imageUrl={item.imageUrl}
                  />
                )}
              </For>
            </div>
          </div>

          {/* ── Controls ── */}
          <div class="grid grid-cols-2 gap-x-6 border-t border-stroke-1 pt-4">

            {/* Left column */}
            <div class="flex flex-col gap-4">
              <CtrlGroup title="Card">
                <CtrlRow label="Image radius">
                  <SliderInput min={0} max={32} value={imageRadius()} onChange={setImageRadius} unit="px" />
                </CtrlRow>
                <CtrlRow label="Offer color">
                  <SwatchRow value={listingColor()} onChange={setListingColor} options={LISTING_COLOR_OPTIONS} />
                </CtrlRow>
              </CtrlGroup>

              <CtrlGroup title="Background & Text">
                <CtrlRow label="Bg Primary">
                  <ColorPickerCtrl value={ctxBgPrimary()} onChange={setCtxBgPrimary} />
                </CtrlRow>
                <CtrlRow label="Bg Secondary">
                  <ColorPickerCtrl value={ctxBgSecondary()} onChange={setCtxBgSecondary} />
                </CtrlRow>
                <CtrlRow label="Text Primary">
                  <ColorPickerCtrl value={ctxTextPrimary()} onChange={setCtxTextPrimary} />
                </CtrlRow>
                <CtrlRow label="Text Sec">
                  <ColorPickerCtrl value={ctxTextSecondary()} onChange={setCtxTextSecondary} />
                </CtrlRow>
                <CtrlRow label="Text Ter">
                  <ColorPickerCtrl value={ctxTextTertiary()} onChange={setCtxTextTertiary} />
                </CtrlRow>
              </CtrlGroup>
            </div>

          </div>
        </div>
      </Section>
    </>
  );
}

// ─── Listing playground ───────────────────────────────────────────────────────

function ListingPlayground() {
  const state = createListingBuilderState();
  return (
    <div class="flex flex-col gap-16 p-4 pb-20">
      <ListingBuilderSection state={state} />
    </div>
  );
}

// ─── Appbar playground ────────────────────────────────────────────────────────

// ─── Appbar custom section ────────────────────────────────────────────────────

type AppbarCustomBrand = {
  key: string;
  label: string;
  appbarCssVariables: Record<string, string>;
  appbarConfig: { backIcon: "arrow" | "caret"; titleAlign: "left" | "center" };
};

const APPBAR_CUSTOMS_KEY = "hcp-appbar-customs";

function loadAppbarCustoms(): AppbarCustomBrand[] {
  try { const s = localStorage.getItem(APPBAR_CUSTOMS_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}
function saveAppbarCustoms(list: AppbarCustomBrand[]) {
  localStorage.setItem(APPBAR_CUSTOMS_KEY, JSON.stringify(list));
}

const APPBAR_JSON_PLACEHOLDER = `{
  "appbarCssVariables": {
    "--sdk-appbar-bg": "var(--background-normal-primary)",
    "--sdk-appbar-bottom-border": "var(--stroke-1)",
    "--sdk-appbar-height": "44px",
    "--sdk-appbar-title-color": "var(--text-normal-primary)",
    "--sdk-appbar-title-size": "14px",
    "--sdk-appbar-title-weight": "500",
    "--sdk-appbar-icon-color": "var(--text-normal-primary)",
    "--sdk-appbar-icon-inner-size": "20px"
  },
  "appbarConfig": {
    "backIcon": "arrow",
    "titleAlign": "left"
  }
}`;

function AppbarCustomSection(props: { darkMode: () => boolean }) {
  const [customs, setCustoms] = createSignal<AppbarCustomBrand[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => setCustoms(loadAppbarCustoms()));

  const addCustom = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a name"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      const entry: AppbarCustomBrand = {
        key: `appbar-${Date.now()}`,
        label: name,
        appbarCssVariables: (p["appbarCssVariables"] as Record<string, string>) ?? {},
        appbarConfig: {
          backIcon: ((p["appbarConfig"] as Record<string, string>)?.["backIcon"] as "arrow" | "caret") ?? "arrow",
          titleAlign: ((p["appbarConfig"] as Record<string, string>)?.["titleAlign"] as "left" | "center") ?? "left",
        },
      };
      const updated = [...customs(), entry];
      setCustoms(updated); saveAppbarCustoms(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const deleteCustom = (key: string) => {
    const updated = customs().filter((c) => c.key !== key);
    setCustoms(updated); saveAppbarCustoms(updated);
  };

  return (
    <>
      <Section title="Custom Appbar" subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response" action={<CopyButton getText={() => APPBAR_EXTRACTION_PROMPT} label="Copy Prompt" />}>
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-40 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
            placeholder={APPBAR_JSON_PLACEHOLDER}
            value={jsonInput()}
            onInput={(e) => { setJsonInput(e.currentTarget.value); setParseError(null); }}
          />
          <Show when={parseError()}>
            <p class="text-[11px] text-red-400">{parseError()}</p>
          </Show>
          <div class="flex gap-2">
            <input
              type="text"
              class="min-w-0 flex-1 rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 text-label-regular text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
              placeholder="Config name…"
              value={nameInput()}
              onInput={(e) => setNameInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
            />
            <button
              class="shrink-0 rounded-lg bg-feature-base px-4 py-2 text-label-semi-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!jsonInput().trim() || !nameInput().trim()}
              onClick={addCustom}
            >
              Add
            </button>
          </div>
        </div>
      </Section>

      <Show when={customs().length > 0}>
        <Section title="Saved Configs">
          <div class="flex flex-col gap-6">
            <For each={customs()}>
              {(c) => {
                const [configOpen, setConfigOpen] = createSignal(false);
                const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
                let configBtnRef: HTMLButtonElement | undefined;

                const openConfig = () => {
                  if (configBtnRef) {
                    const rect = configBtnRef.getBoundingClientRect();
                    setPopupPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                  }
                  setConfigOpen((v) => !v);
                };

                const getJson = () => JSON.stringify(
                  { appbarCssVariables: c.appbarCssVariables, appbarConfig: c.appbarConfig },
                  null, 2
                );

                const cssVarRows = () => Object.entries(c.appbarCssVariables ?? {}).map(([name, value]) => ({ name, value }));

                return (
                  <div class="flex flex-col gap-1.5">
                    <Show when={configOpen()}>
                      <Portal>
                        <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
                        <div
                          class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
                          style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
                        >
                          <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">{c.label}</p>
                            <CopyButton getText={getJson} label="Copy JSON" />
                          </div>
                          <div class="p-3">
                            <For each={cssVarRows()}>
                              {(row) => (
                                <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                                  <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.name}</span>
                                  <span class="max-w-[160px] break-all text-right font-mono text-[11px] text-text-normal-primary">{row.value}</span>
                                </div>
                              )}
                            </For>
                            <div class="mt-1 border-t border-stroke-1 pt-1">
                              <For each={Object.entries(c.appbarConfig ?? {})}>
                                {([k, v]) => (
                                  <div class="flex items-start justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{k}</span>
                                    <span class="font-mono text-[11px] text-text-normal-primary">{v as string}</span>
                                  </div>
                                )}
                              </For>
                            </div>
                          </div>
                        </div>
                      </Portal>
                    </Show>

                    <div class="flex items-center justify-between">
                      <p class="text-label-semi-bold text-text-normal-primary">{c.label}</p>
                      <div class="flex items-center gap-1">
                        <button
                          ref={(el) => (configBtnRef = el)}
                          class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
                          classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
                          onClick={openConfig}
                        >
                          <PhosphorIcon name="code" fontSize={13} />
                          <span>Config</span>
                        </button>
                        <button
                          class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                          onClick={() => deleteCustom(c.key)}
                        >
                          <PhosphorIcon name="trash" fontSize={14} />
                        </button>
                      </div>
                    </div>

                    <div
                      class="flex justify-center"
                      style={{
                        ...(c.appbarCssVariables as JSX.CSSProperties),
                        ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
                      }}
                    >
                      <PhonePreview>
                        <SdkAppbar
                          title="Gift Cards"
                          backIcon={c.appbarConfig.backIcon}
                          titleAlign={c.appbarConfig.titleAlign}
                        />
                        <PageContentSkeleton />
                      </PhonePreview>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Section>
      </Show>
    </>
  );
}

// ─── Appbar playground ────────────────────────────────────────────────────────

function AppbarPlayground(props: { darkMode: () => boolean }) {
  const state = createAppbarBuilderState();
  return (
    <div class="flex flex-col gap-16 p-4 pb-20">
      <AppbarBuilderSection state={state} />
      <AppbarCustomSection darkMode={props.darkMode} />
      <AppbarBrandsSection darkMode={props.darkMode} appbarCssVars={state.appbarCssVars} />
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const savedTab = localStorage.getItem("hcp-tab") as PlaygroundTab | null;
  const [darkMode, setDarkMode] = createSignal(false);
  const [tab, setTab] = createSignal<PlaygroundTab>(savedTab ?? "categories");

  onMount(() => document.documentElement.classList.toggle("dark", false));

  function switchTab(t: PlaygroundTab) {
    setTab(t);
    localStorage.setItem("hcp-tab", t);
  }

  const outerStyle = createMemo(
    (): JSX.CSSProperties => (darkMode() ? DARK_TELESCOPE_VARS : {})
  );

  return (
    <div
      class="flex min-h-dvh w-full flex-col bg-background-normal-primary"
      style={outerStyle()}
    >
      {/* Full-width sticky header + tabs */}
      <div class="sticky top-0 z-[200] w-full bg-background-normal-primary">
        {/* Title row */}
        <div class="mx-auto flex max-w-[900px] items-center justify-between px-4 py-3">
          <div class="flex flex-col gap-0.5">
            <p class="text-title-5-semi-bold text-text-normal-primary">UI Playground</p>
            <p class="text-label-regular text-text-normal-tertiary">
              CSS variable explorer
            </p>
          </div>
          <Segment
            value={darkMode() ? "dark" : "light"}
            onChange={(v) => {
              const dark = v === "dark";
              setDarkMode(dark);
              document.documentElement.classList.toggle("dark", dark);
            }}
            options={[
              { label: "☀︎ Light", value: "light" as const },
              { label: "☽ Dark", value: "dark" as const },
            ]}
          />
        </div>

        {/* Tab bar — full-width stroke via border-b on the outer div */}
        <div class="border-b border-stroke-1">
          <div class="mx-auto flex max-w-[900px] gap-1 px-4">
            <For each={[
              { key: "categories" as PlaygroundTab, label: "Categories" },
              { key: "appbar" as PlaygroundTab, label: "Appbar" },
              { key: "listing" as PlaygroundTab, label: "Listing" },
              { key: "basics" as PlaygroundTab, label: "Basics" },
            ]}>
              {(t) => (
                <button
                  class="relative px-3 py-2.5 text-label-semi-bold transition-colors"
                  classList={{
                    "text-text-normal-primary": tab() === t.key,
                    "text-text-normal-tertiary hover:text-text-normal-secondary": tab() !== t.key,
                  }}
                  onClick={() => switchTab(t.key)}
                >
                  {t.label}
                  {/* Active indicator */}
                  <Show when={tab() === t.key}>
                    <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-text-normal-primary" />
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="mx-auto w-full max-w-[900px]">
        <Show when={tab() === "categories"}>
          <PlaygroundGrid darkMode={darkMode} />
        </Show>
        <Show when={tab() === "appbar"}>
          <AppbarPlayground darkMode={darkMode} />
        </Show>
        <Show when={tab() === "listing"}>
          <ListingPlayground />
        </Show>
        <Show when={tab() === "basics"}>
          <BasicsPlayground />
        </Show>
      </div>
    </div>
  );
}
