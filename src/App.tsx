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
import { LISTING_EXTRACTION_PROMPT } from "./data/listing_extraction_prompt";
import { BUTTON_EXTRACTION_PROMPT } from "./data/button_extraction_prompt";
import { INPUT_EXTRACTION_PROMPT } from "./data/input_extraction_prompt";
import { BASICS_EXTRACTION_PROMPT } from "./data/basics_extraction_prompt";
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
    const text = props.getText();
    const finish = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(finish).catch(() => {
        // Fallback for environments where clipboard API is blocked
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        finish();
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      finish();
    }
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

const TYPE_STYLES: { label: string; size: number; lineHeight: number; weight: number }[] = [
  { label: "Display 4",       size: 48, lineHeight: 54, weight: 600 },
  { label: "Title 1",         size: 36, lineHeight: 42, weight: 600 },
  { label: "Title 2",         size: 32, lineHeight: 40, weight: 600 },
  { label: "Title 3",         size: 24, lineHeight: 32, weight: 600 },
  { label: "Title 4",         size: 20, lineHeight: 28, weight: 600 },
  { label: "Title 5",         size: 16, lineHeight: 24, weight: 600 },
  { label: "Title 6",         size: 14, lineHeight: 20, weight: 600 },
  { label: "Para 2 Regular",  size: 16, lineHeight: 24, weight: 400 },
  { label: "Para 2 SemiBold", size: 16, lineHeight: 24, weight: 600 },
  { label: "Para 3 Regular",  size: 14, lineHeight: 20, weight: 400 },
  { label: "Para 3 SemiBold", size: 14, lineHeight: 20, weight: 600 },
  { label: "Label Regular",   size: 12, lineHeight: 16, weight: 400 },
  { label: "Label SemiBold",  size: 12, lineHeight: 16, weight: 600 },
  { label: "Caption Regular", size: 10, lineHeight: 12, weight: 400 },
];

function TypographySection() {
  let probeRef: HTMLSpanElement | undefined;
  const [fontName, setFontName] = createSignal("—");
  onMount(() => {
    if (!probeRef) return;
    const raw = getComputedStyle(probeRef).fontFamily;
    const first = raw.split(",")[0].trim().replace(/['"]/g, "");
    setFontName(first || "system-ui");
  });
  return (
    <Section title="Typography">
      <span ref={probeRef} class="sr-only" aria-hidden="true" />
      <div class="overflow-hidden rounded-xl border border-stroke-1">
        <div class="flex items-center justify-between border-b border-stroke-1 px-4 py-2.5">
          <span class="text-label-regular text-text-normal-tertiary">Typeface</span>
          <span class="text-label-semi-bold text-text-normal-primary">{fontName()}</span>
        </div>
        <For each={TYPE_STYLES}>
          {(s, i) => (
            <div
              class="flex items-baseline justify-between gap-4 px-4 py-2.5"
              classList={{ "border-t border-stroke-1": i() > 0 }}
            >
              <span
                style={{
                  "font-size": `${s.size}px`,
                  "line-height": `${s.lineHeight}px`,
                  "font-weight": String(s.weight),
                  color: "var(--text-normal-primary)",
                }}
              >
                {s.label}
              </span>
              <span class="shrink-0 font-mono text-label-regular text-text-normal-tertiary">
                {s.size}px · {s.weight}
              </span>
            </div>
          )}
        </For>
      </div>
    </Section>
  );
}

type BtnSpec = { label: string; bg: string; text: string; border?: string; opacity?: boolean; hover?: string };

const BRAND_BUTTONS: BtnSpec[] = [
  { label: "Primary",   bg: "var(--brand-tbd-base)",  text: "var(--text-inverted-primary)",  hover: "hover:bg-brand-tbd-dark active:bg-brand-tbd-dark" },
  { label: "Secondary", bg: "transparent",             text: "var(--brand-tbd-base)",         border: "1px solid var(--brand-tbd-base)", hover: "hover:bg-feature-lighter active:bg-feature-lighter" },
  { label: "Tertiary",  bg: "var(--feature-lighter)", text: "var(--feature-base)",    hover: "hover:opacity-80 active:opacity-60" },
  { label: "Ghost",     bg: "transparent",             text: "var(--feature-base)",    hover: "hover:bg-background-normal-secondary active:bg-background-normal-tertiary" },
  { label: "Disabled",  bg: "var(--brand-tbd-base)",  text: "#fff", opacity: true },
];

const NEUTRAL_BUTTONS: BtnSpec[] = [
  { label: "Primary",   bg: "var(--background-inverted-primary)", text: "var(--text-inverted-primary)", hover: "hover:opacity-80 active:opacity-60" },
  { label: "Secondary", bg: "transparent",                         text: "var(--text-normal-primary)",   border: "1px solid var(--stroke-solid)", hover: "hover:bg-background-normal-secondary active:bg-background-normal-secondary" },
  { label: "Error",     bg: "var(--error-base, #ef4444)",         text: "#fff",                         hover: "hover:opacity-80 active:opacity-60" },
  { label: "Disabled",  bg: "var(--background-normal-secondary)", text: "var(--text-normal-tertiary)", opacity: true },
];

type IconBtnSpec = { bg: string; text: string; border?: string; hover?: string };
const ICON_BUTTONS: IconBtnSpec[] = [
  { bg: "var(--brand-tbd-base)",               text: "#fff",                         hover: "hover:bg-brand-tbd-dark active:bg-brand-tbd-dark" },
  { bg: "transparent",                          text: "var(--feature-base)",          border: "1px solid var(--feature-base)", hover: "hover:bg-feature-lighter active:bg-feature-lighter" },
  { bg: "var(--feature-lighter)",              text: "var(--feature-base)",          hover: "hover:opacity-80 active:opacity-60" },
  { bg: "var(--background-inverted-primary)", text: "var(--text-inverted-primary)", hover: "hover:opacity-80 active:opacity-60" },
  { bg: "var(--error-base, #ef4444)",          text: "#fff",                         hover: "hover:opacity-80 active:opacity-60" },
  { bg: "var(--background-normal-secondary)", text: "var(--text-normal-tertiary)",  hover: "hover:bg-background-normal-tertiary active:bg-background-normal-tertiary" },
];

function BtnColumn(props: { title: string; buttons: BtnSpec[] }) {
  return (
    <div class="flex flex-col gap-2">
      <p class="text-label-semi-bold text-text-normal-secondary">{props.title}</p>
      <For each={props.buttons}>
        {(v) => (
          <button
            class={`flex h-11 w-full items-center justify-center rounded-xl transition-all active:scale-[0.98] ${v.opacity ? "pointer-events-none" : (v.hover ?? "")}`}
            style={{
              background: v.bg,
              color: v.text,
              border: v.border ?? "none",
              opacity: v.opacity ? "0.4" : "1",
              "font-size": "14px",
              "font-weight": "600",
            }}
          >
            {v.label}
          </button>
        )}
      </For>
    </div>
  );
}

const COLOR_GROUPS: { label: string; tokens: { name: string; bg: string; border?: boolean }[] }[] = [
  {
    label: "Brand",
    tokens: [
      { name: "Base",    bg: "var(--brand-tbd-base)" },
      { name: "Dark",    bg: "var(--brand-tbd-dark)" },
      { name: "Feature", bg: "var(--feature-base)" },
      { name: "Feature Light", bg: "var(--feature-light)" },
      { name: "Feature Lighter", bg: "var(--feature-lighter)" },
    ],
  },
  {
    label: "Background",
    tokens: [
      { name: "Primary",   bg: "var(--background-normal-primary)",   border: true },
      { name: "Secondary", bg: "var(--background-normal-secondary)" },
      { name: "Tertiary",  bg: "var(--background-normal-tertiary)" },
      { name: "Inverted",  bg: "var(--background-inverted-primary)" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "Primary",   bg: "var(--text-normal-primary)" },
      { name: "Secondary", bg: "var(--text-normal-secondary)" },
      { name: "Tertiary",  bg: "var(--text-normal-tertiary)" },
      { name: "Inverted",  bg: "var(--text-inverted-primary)" },
    ],
  },
  {
    label: "Stroke",
    tokens: [
      { name: "Solid", bg: "var(--stroke-solid)" },
      { name: "3",     bg: "var(--stroke-3)" },
      { name: "2",     bg: "var(--stroke-2)" },
      { name: "1",     bg: "var(--stroke-1)", border: true },
    ],
  },
  {
    label: "Semantic",
    tokens: [
      { name: "Success", bg: "var(--success-base, #22c55e)" },
      { name: "Error",   bg: "var(--error-base, #ef4444)" },
      { name: "Warning", bg: "var(--warning-base, #f59e0b)" },
    ],
  },
];

function ColoursSection() {
  return (
    <Section title="Colours">
      <div class="flex flex-col gap-6">
        <For each={COLOR_GROUPS}>
          {(group) => (
            <div class="flex flex-col gap-2">
              <p class="text-label-semi-bold text-text-normal-secondary">{group.label}</p>
              <div class="grid grid-cols-5 gap-2">
                <For each={group.tokens}>
                  {(token) => (
                    <div class="flex flex-col gap-1">
                      <div
                        class="size-10 rounded-lg"
                        style={{
                          background: token.bg,
                          "box-shadow": token.border ? "inset 0 0 0 1px var(--stroke-1)" : undefined,
                        }}
                      />
                      <p class="text-label-regular text-text-normal-tertiary">{token.name}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </Section>
  );
}

// ─── Basics preview cards ─────────────────────────────────────────────────────

const BASICS_COLOR_TOKENS: { label: string; bg: string; border?: boolean }[] = [
  { label: "bg-primary",   bg: "var(--background-normal-primary)",   border: true },
  { label: "bg-secondary", bg: "var(--background-normal-secondary)" },
  { label: "bg-tertiary",  bg: "var(--background-normal-tertiary)" },
  { label: "text-primary",   bg: "var(--text-normal-primary)" },
  { label: "text-secondary", bg: "var(--text-normal-secondary)" },
  { label: "text-tertiary",  bg: "var(--text-normal-tertiary)" },
  { label: "stroke-1", bg: "var(--stroke-1)", border: true },
  { label: "stroke-2", bg: "var(--stroke-2)", border: true },
  { label: "brand",    bg: "var(--brand-tbd-base)" },
];

function BasicsPreviewCards(props: { fontLabel?: string }) {
  return (
    <div class="flex flex-col gap-4">
      {/* Text cards */}
      <div class="flex flex-col gap-3 sm:flex-row">
        {/* Card A — bg-primary + stroke-1 */}
        <div
          class="flex-1 rounded-xl p-5"
          style={{
            background: "var(--background-normal-primary)",
            "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
          }}
        >
          <div class="flex flex-col gap-2">
            <p style={{ color: "var(--text-normal-primary)", "font-size": "15px", "font-weight": "600", "line-height": "20px" }}>
              Gift Cards
            </p>
            <p style={{ color: "var(--text-normal-secondary)", "font-size": "13px", "font-weight": "400", "line-height": "18px" }}>
              Save on your favourite brands
            </p>
            <p style={{ color: "var(--text-normal-tertiary)", "font-size": "11px", "font-weight": "400", "line-height": "16px" }}>
              400+ brands · Instant delivery
            </p>
          </div>
        </div>

        {/* Card B — bg-secondary, no border */}
        <div
          class="flex-1 rounded-xl p-5"
          style={{ background: "var(--background-normal-secondary)" }}
        >
          <div class="flex flex-col gap-2">
            <p style={{ color: "var(--text-normal-primary)", "font-size": "15px", "font-weight": "600", "line-height": "20px" }}>
              Popular right now
            </p>
            <p style={{ color: "var(--text-normal-secondary)", "font-size": "13px", "font-weight": "400", "line-height": "18px" }}>
              Amazon, Flipkart, Zomato and more
            </p>
            <p style={{ color: "var(--text-normal-tertiary)", "font-size": "11px", "font-weight": "400", "line-height": "16px" }}>
              Up to 10% off · Use points or cash
            </p>
          </div>
        </div>
      </div>

      {/* Color swatches + typeface */}
      <div class="flex items-end justify-between gap-4">
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-9">
          <For each={BASICS_COLOR_TOKENS}>
            {(token) => (
              <div class="flex flex-col items-center gap-1.5">
                <div
                  class="size-10 rounded-lg"
                  style={{
                    background: token.bg,
                    "box-shadow": token.border ? "inset 0 0 0 1px var(--stroke-2)" : undefined,
                  }}
                />
                <p class="text-center font-mono text-[10px] leading-tight text-text-normal-tertiary">{token.label}</p>
              </div>
            )}
          </For>
        </div>
        <Show when={props.fontLabel}>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <p class="font-mono text-[10px] text-text-normal-tertiary">typeface</p>
            <p class="text-[13px] font-medium text-text-normal-primary" style={{ "font-family": props.fontLabel }}>{props.fontLabel}</p>
          </div>
        </Show>
      </div>
    </div>
  );
}

// ─── Basics brands section ────────────────────────────────────────────────────

function BasicsBrandsSection(props: { darkMode: () => boolean }) {
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

  return (
    <>
      <Section
        title="Custom Brand"
        subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response"
        action={<CopyButton getText={() => BASICS_EXTRACTION_PROMPT} label="Copy Prompt" />}
      >
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-24 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
            placeholder={`Paste brand JSON here…\n{\n  "telescopeCssVariables": { "--background-normal-primary": "#..." },\n  "fontImportUrl": "https://fonts.googleapis.com/…"\n}`}
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

      <Show when={brands().length > 0}>
        <Section title="Brands">
          <div class="flex flex-col gap-6">
            <For each={brands()}>
              {(brand) => {
                const [cfgOpen, setCfgOpen] = createSignal(false);
                const [cfgPos, setCfgPos] = createSignal({ top: 0, right: 0 });
                let cfgBtnRef: HTMLButtonElement | undefined;

                const openCfg = () => {
                  if (cfgBtnRef) {
                    const r = cfgBtnRef.getBoundingClientRect();
                    setCfgPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
                  }
                  setCfgOpen((v) => !v);
                };

                const BASICS_KEYS = [
                  "--background-normal-primary", "--background-normal-secondary", "--background-normal-tertiary",
                  "--text-normal-primary", "--text-normal-secondary", "--text-normal-tertiary",
                  "--stroke-1", "--stroke-2", "--brand-tbd-base",
                ];
                const basicsVars = () => Object.fromEntries(
                  BASICS_KEYS.flatMap((k) => {
                    const v = (brand.telescopeCssVariables ?? {})[k];
                    return v !== undefined ? [[k, v]] : [];
                  })
                );

                const fontFamily = () => brand.sdkCssVariables?.["--font-family"];

                const cfgRows = () => [
                  ...Object.entries(basicsVars()),
                  ...(fontFamily() ? [["--font-family", fontFamily()!]] : []),
                ].map(([k, v]) => ({ k, v }));

                const getJson = () => JSON.stringify({
                  telescopeCssVariables: basicsVars(),
                  ...(fontFamily() ? { sdkCssVariables: { "--font-family": fontFamily() } } : {}),
                }, null, 2);

                return (
                  <div class="flex flex-col gap-1.5">
                    <Show when={cfgOpen()}>
                      <Portal>
                        <div class="fixed inset-0 z-[300]" onClick={() => setCfgOpen(false)} />
                        <div
                          class="fixed z-[301] min-w-[300px] max-h-80 overflow-y-auto overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
                          style={{ top: `${cfgPos().top}px`, right: `${cfgPos().right}px` }}
                        >
                          <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">{brand.label}</p>
                            <CopyButton getText={getJson} label="Copy JSON" />
                          </div>
                          <div class="p-3">
                            <For each={cfgRows()}>
                              {(row) => (
                                <div class="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                                  <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.k}</span>
                                  <span class="font-mono text-[11px] text-text-normal-primary">{row.v}</span>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Portal>
                    </Show>

                    <div class="flex items-center justify-between">
                      <p class="text-label-semi-bold text-text-normal-primary">{brand.label}</p>
                      <div class="flex items-center gap-1">
                        <button
                          ref={(el) => (cfgBtnRef = el)}
                          class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
                          classList={{ "bg-background-normal-secondary text-text-normal-primary": cfgOpen() }}
                          onClick={openCfg}
                        >
                          <PhosphorIcon name="code" fontSize={13} />
                          <span>Config</span>
                        </button>
                        <Show when={brand.key !== "default"}>
                          <button
                            class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                            title="Delete"
                            onClick={() => deleteBrand(brand.key)}
                          >
                            <PhosphorIcon name="trash" fontSize={14} />
                          </button>
                        </Show>
                      </div>
                    </div>
                    <div
                      class="overflow-hidden rounded-xl p-4"
                      style={{
                        ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
                        ...(brand.telescopeCssVariables as JSX.CSSProperties | undefined),
                        background: "var(--background-normal-primary)",
                        "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                      }}
                    >
                      <BasicsPreviewCards fontLabel={
                        (brand.sdkCssVariables?.["--font-family"] ?? "")
                          .replace(/^['"]/, "").split(/[,'"]/)[0].trim() || undefined
                      } />
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

function BasicsPlayground(props: { darkMode: () => boolean }) {
  return (
    <div class="flex flex-col gap-8 p-4 pb-20">
      <Section title="Preview">
        <div
          class="overflow-hidden rounded-xl p-4"
          style={{
            background: "var(--background-normal-primary)",
            "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
          }}
        >
          <BasicsPreviewCards />
        </div>
      </Section>
      <BasicsBrandsSection darkMode={props.darkMode} />
    </div>
  );
}

// ─── Button builder ───────────────────────────────────────────────────────────

// Button builder reuses TITLE_SIZES and TITLE_WEIGHTS from the Appbar section above

function ButtonPlayground() {
  // — Shape & text —
  const [height, setHeight] = createSignal(44);
  const [radius, setRadius] = createSignal(12);
  const [textSizeKey, setTextSizeKey] = createSignal<TitleSizeKey>("t6");
  const [textWeightKey, setTextWeightKey] = createSignal<TitleWeightKey>("semibold");

  // — Brand context colors (same pattern as Appbar / Listing) —
  const [ctxBgPrimary,    setCtxBgPrimary]    = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgSecondary,  setCtxBgSecondary]  = createSignal(LIGHT_CTX_DEFAULTS.bgSecondary);
  const [ctxBgInverted,   setCtxBgInverted]   = createSignal("#111827");
  const [ctxTextPrimary,  setCtxTextPrimary]  = createSignal(LIGHT_CTX_DEFAULTS.textPrimary);
  const [ctxTextSecondary,setCtxTextSecondary]= createSignal(LIGHT_CTX_DEFAULTS.textSecondary);
  const [ctxTextTertiary, setCtxTextTertiary] = createSignal(LIGHT_CTX_DEFAULTS.textTertiary);
  const [ctxTextInverted, setCtxTextInverted] = createSignal("#ffffff");
  const [ctxBrandBase,    setCtxBrandBase]    = createSignal("#6366f1");
  const [ctxBrandDark,    setCtxBrandDark]    = createSignal("#4f46e5");
  const [ctxFeatureBase,  setCtxFeatureBase]  = createSignal("#6366f1");
  const [ctxFeatureLighter,setCtxFeatureLighter]=createSignal("rgba(99,102,241,0.10)");
  const [ctxStrokeSolid,  setCtxStrokeSolid]  = createSignal("#6b7280");

  const contextVars = createMemo((): JSX.CSSProperties => ({
    "--background-normal-primary":   ctxBgPrimary(),
    "--background-normal-secondary": ctxBgSecondary(),
    "--background-inverted-primary": ctxBgInverted(),
    "--text-normal-primary":    ctxTextPrimary(),
    "--text-normal-secondary":  ctxTextSecondary(),
    "--text-normal-tertiary":   ctxTextTertiary(),
    "--text-inverted-primary":  ctxTextInverted(),
    "--brand-tbd-base":   ctxBrandBase(),
    "--brand-tbd-dark":   ctxBrandDark(),
    "--feature-base":     ctxFeatureBase(),
    "--feature-lighter":  ctxFeatureLighter(),
    "--stroke-solid":     ctxStrokeSolid(),
  }));

  const fontSize = () => TITLE_SIZES[textSizeKey()].size;
  const fontWeight = () => TITLE_WEIGHTS[textWeightKey()].weight;

  // Shared button shape (applied via CSS vars on the preview wrapper)
  const shapeVars = (): JSX.CSSProperties => ({
    "--btn-height": `${height()}px`,
    "--btn-radius": `${radius()}px`,
    "--btn-font-size": `${fontSize()}px`,
    "--btn-font-weight": String(fontWeight()),
  });

  // A button that reads shape from CSS vars (so all variants share one set)
  const BtnPreview = (p: { spec: BtnSpec; icon?: boolean }) => (
    <button
      class={`flex items-center justify-center transition-all active:scale-[0.98] ${p.spec.opacity ? "pointer-events-none" : (p.spec.hover ?? "")}`}
      style={{
        height: "var(--btn-height)",
        width: p.icon ? "var(--btn-height)" : undefined,
        "min-width": p.icon ? undefined : "120px",
        padding: p.icon ? "0" : "0 20px",
        "border-radius": "var(--btn-radius)",
        background: p.spec.bg,
        color: p.spec.text,
        "box-shadow": p.spec.border ? `inset 0 0 0 1px ${p.spec.border.replace("1px solid ", "")}` : "none",
        "font-size": "var(--btn-font-size)",
        "font-weight": "var(--btn-font-weight)",
        opacity: p.spec.opacity ? "0.4" : "1",
      }}
    >
      {p.icon ? <PhosphorIcon name="arrow-right" fontSize={20} /> : p.spec.label}
    </button>
  );

  // Config popup
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

  const getJson = () => JSON.stringify({
    telescopeCssVariables: {
      "--background-normal-primary":   ctxBgPrimary(),
      "--background-normal-secondary": ctxBgSecondary(),
      "--background-inverted-primary": ctxBgInverted(),
      "--text-normal-primary":   ctxTextPrimary(),
      "--text-normal-secondary": ctxTextSecondary(),
      "--text-normal-tertiary":  ctxTextTertiary(),
      "--text-inverted-primary": ctxTextInverted(),
      "--brand-tbd-base":   ctxBrandBase(),
      "--brand-tbd-dark":   ctxBrandDark(),
      "--feature-base":     ctxFeatureBase(),
      "--feature-lighter":  ctxFeatureLighter(),
      "--stroke-solid":     ctxStrokeSolid(),
    },
    buttonConfig: {
      height: `${height()}px`,
      borderRadius: `${radius()}px`,
      fontSize: `${fontSize()}px`,
      fontWeight: String(fontWeight()),
    },
  }, null, 2);

  const TITLE_SIZE_OPTIONS = (Object.keys(TITLE_SIZES) as TitleSizeKey[]).map((k) => ({
    label: TITLE_SIZES[k].label, value: k,
  }));
  const TITLE_WEIGHT_OPTIONS = (Object.keys(TITLE_WEIGHTS) as TitleWeightKey[]).map((k) => ({
    label: TITLE_WEIGHTS[k].label, value: k,
  }));

  const configAction = (
    <div class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
        onClick={() => {
          setHeight(44); setRadius(12); setTextSizeKey("t6"); setTextWeightKey("semibold");
          setCtxBgPrimary(LIGHT_CTX_DEFAULTS.bgPrimary); setCtxBgSecondary(LIGHT_CTX_DEFAULTS.bgSecondary);
          setCtxBgInverted("#111827"); setCtxBrandBase("#6366f1"); setCtxBrandDark("#4f46e5");
          setCtxFeatureBase("#6366f1"); setCtxFeatureLighter("rgba(99,102,241,0.10)");
          setCtxTextPrimary(LIGHT_CTX_DEFAULTS.textPrimary); setCtxTextSecondary(LIGHT_CTX_DEFAULTS.textSecondary);
          setCtxTextTertiary(LIGHT_CTX_DEFAULTS.textTertiary); setCtxTextInverted("#ffffff");
          setCtxStrokeSolid("#6b7280");
        }}
      >
        <PhosphorIcon name="arrow-ccw" fontSize={13} />
        <span>Reset</span>
      </button>
      <button
        ref={(el) => (configBtnRef = el)}
        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
        classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
        onClick={openConfig}
      >
        <PhosphorIcon name="sliders" fontSize={16} />
      </button>
    </div>
  );

  return (
    <div class="p-4 pb-20">
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">CSS Output</p>
              <CopyButton getText={getJson} label="Copy JSON" />
            </div>
            <div class="max-h-80 overflow-y-auto p-3">
              <For each={Object.entries({ ...contextVars(), ...shapeVars() })}>
                {([k, v]) => (
                  <div class="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{k}</span>
                    <span class="font-mono text-[11px] text-text-normal-primary">{String(v)}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>

      <Section title="Button Builder" action={configAction}>
        <div class="flex flex-col gap-6">

          {/* ── Preview — all variants against the brand bg ── */}
          <div
            class="overflow-hidden rounded-xl"
            style={{
              ...contextVars(),
              ...shapeVars(),
              background: ctxBgPrimary(),
              "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
            }}
          >
            {/* Brand variants */}
            <div class="flex flex-col gap-3 border-b p-5" style={{ "border-color": "var(--stroke-1)" }}>
              <p class="text-label-semi-bold text-text-normal-secondary">Brand</p>
              <div class="flex flex-wrap gap-3">
                <For each={BRAND_BUTTONS.filter(b => !b.opacity)}>
                  {(spec) => <BtnPreview spec={spec} />}
                </For>
                <BtnPreview spec={BRAND_BUTTONS.find(b => b.opacity)!} />
              </div>
            </div>
            {/* Neutral variants */}
            <div class="flex flex-col gap-3 p-5">
              <p class="text-label-semi-bold text-text-normal-secondary">Neutral & Semantic</p>
              <div class="flex flex-wrap gap-3">
                <For each={NEUTRAL_BUTTONS.filter(b => !b.opacity)}>
                  {(spec) => <BtnPreview spec={spec} />}
                </For>
                <BtnPreview spec={NEUTRAL_BUTTONS.find(b => b.opacity)!} />
              </div>
            </div>
          </div>

          {/* ── Controls ── */}
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-stroke-1 pt-4">

            {/* Left: Shape + Text style */}
            <div class="flex flex-col gap-4">
              <CtrlGroup title="Shape">
                <CtrlRow label="Height">
                  <SliderInput min={32} max={64} value={height()} onChange={setHeight} unit="px" />
                </CtrlRow>
                <CtrlRow label="Radius">
                  <SliderInput min={0} max={32} value={radius()} onChange={setRadius} unit="px" />
                </CtrlRow>
              </CtrlGroup>
              <CtrlGroup title="Text style">
                <CtrlRow label="Size">
                  <Segment value={textSizeKey()} onChange={setTextSizeKey} options={TITLE_SIZE_OPTIONS} />
                </CtrlRow>
                <CtrlRow label="Weight">
                  <Segment value={textWeightKey()} onChange={setTextWeightKey} options={TITLE_WEIGHT_OPTIONS} />
                </CtrlRow>
              </CtrlGroup>
            </div>

            {/* Right: Background & Text colors */}
            <div class="flex flex-col gap-4">
              <CtrlGroup title="Background">
                <CtrlRow label="Primary">
                  <ColorPickerCtrl value={ctxBgPrimary()} onChange={setCtxBgPrimary} />
                </CtrlRow>
                <CtrlRow label="Secondary">
                  <ColorPickerCtrl value={ctxBgSecondary()} onChange={setCtxBgSecondary} />
                </CtrlRow>
                <CtrlRow label="Inverted">
                  <ColorPickerCtrl value={ctxBgInverted()} onChange={setCtxBgInverted} />
                </CtrlRow>
              </CtrlGroup>
              <CtrlGroup title="Text">
                <CtrlRow label="Primary">
                  <ColorPickerCtrl value={ctxTextPrimary()} onChange={setCtxTextPrimary} />
                </CtrlRow>
                <CtrlRow label="Inverted">
                  <ColorPickerCtrl value={ctxTextInverted()} onChange={setCtxTextInverted} />
                </CtrlRow>
              </CtrlGroup>
              <CtrlGroup title="Brand">
                <CtrlRow label="Base">
                  <ColorPickerCtrl value={ctxBrandBase()} onChange={setCtxBrandBase} />
                </CtrlRow>
                <CtrlRow label="Dark">
                  <ColorPickerCtrl value={ctxBrandDark()} onChange={setCtxBrandDark} />
                </CtrlRow>
                <CtrlRow label="Feature">
                  <ColorPickerCtrl value={ctxFeatureBase()} onChange={setCtxFeatureBase} />
                </CtrlRow>
                <CtrlRow label="Stroke">
                  <ColorPickerCtrl value={ctxStrokeSolid()} onChange={setCtxStrokeSolid} />
                </CtrlRow>
              </CtrlGroup>
            </div>

          </div>
        </div>
      </Section>

      {/* ── Custom button ── */}
      <ButtonCustomSection />
    </div>
  );
}

// ─── Custom button section ────────────────────────────────────────────────────

type CustomButton = {
  key: string;
  label: string;
  telescopeCssVariables?: Record<string, string>;
  buttonConfig: {
    height: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
  };
};

const BTN_CUSTOMS_KEY = "hcp-btn-customs";
const BTN_INIT_KEY = "hcp-btn-customs-init-v1";

const DEFAULT_BTN_BRANDS: CustomButton[] = [
  {
    key: "btn-linkedin",
    label: "LinkedIn",
    telescopeCssVariables: {
      "--background-normal-primary":   "#ffffff",
      "--background-normal-secondary": "#f4f2ee",
      "--background-inverted-primary": "#1d2226",
      "--text-normal-primary":   "#000000",
      "--text-normal-secondary": "#ffffff",
      "--text-normal-tertiary":  "#666666",
      "--text-inverted-primary": "#ffffff",
      "--brand-tbd-base": "#0a66c2",
      "--brand-tbd-dark": "#004182",
      "--feature-base":   "#0a66c2",
      "--feature-lighter":"rgba(10, 102, 194, 0.1)",
      "--stroke-solid":   "#c9c9c9",
    },
    buttonConfig: { height: "48px", borderRadius: "9999px", fontSize: "16px", fontWeight: "600" },
  },
];

function loadBtnCustoms(): CustomButton[] {
  try {
    if (!localStorage.getItem(BTN_INIT_KEY)) {
      localStorage.setItem(BTN_CUSTOMS_KEY, JSON.stringify(DEFAULT_BTN_BRANDS));
      localStorage.setItem(BTN_INIT_KEY, "1");
      return DEFAULT_BTN_BRANDS;
    }
    const s = localStorage.getItem(BTN_CUSTOMS_KEY); return s ? JSON.parse(s) : [];
  }
  catch { return []; }
}
function saveBtnCustoms(list: CustomButton[]) {
  localStorage.setItem(BTN_CUSTOMS_KEY, JSON.stringify(list));
}

function ButtonCustomSection() {
  const [customs, setCustoms] = createSignal<CustomButton[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => setCustoms(loadBtnCustoms()));

  const add = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a name"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p !== "object" || p === null || Array.isArray(p)) {
        setParseError("Invalid JSON: expected an object"); return;
      }
      const cfg = (p["buttonConfig"] ?? {}) as Record<string, string>;
      const btn: CustomButton = {
        key: `btn-${Date.now()}`,
        label: name,
        telescopeCssVariables: p["telescopeCssVariables"] as Record<string, string> | undefined,
        buttonConfig: {
          height:       cfg["height"]       ?? "44px",
          borderRadius: cfg["borderRadius"] ?? "12px",
          fontSize:     cfg["fontSize"]     ?? "14px",
          fontWeight:   cfg["fontWeight"]   ?? "600",
        },
      };
      const updated = [...customs(), btn];
      setCustoms(updated); saveBtnCustoms(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const remove = (key: string) => {
    const updated = customs().filter((b) => b.key !== key);
    setCustoms(updated); saveBtnCustoms(updated);
  };

  const shapeVars = (b: CustomButton): JSX.CSSProperties => ({
    "--btn-height": b.buttonConfig.height,
    "--btn-radius": b.buttonConfig.borderRadius,
    "--btn-font-size": b.buttonConfig.fontSize,
    "--btn-font-weight": b.buttonConfig.fontWeight,
  });

  return (
    <div class="mt-8 flex flex-col gap-3 border-t border-stroke-1 pt-8">
      <Section
        title="Custom Button"
        subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response"
        action={<CopyButton getText={() => BUTTON_EXTRACTION_PROMPT} label="Copy Prompt" />}
      >
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-24 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
            placeholder={`{\n  "telescopeCssVariables": { "--background-normal-primary": "#...", "--brand-tbd-base": "#..." },\n  "buttonConfig": { "height": "44px", "borderRadius": "12px", "fontSize": "14px", "fontWeight": "600" }\n}`}
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
              placeholder="Button name…"
              value={nameInput()}
              onInput={(e) => setNameInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              class="shrink-0 rounded-lg bg-feature-base px-4 py-2 text-label-semi-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!jsonInput().trim() || !nameInput().trim()}
              onClick={add}
            >
              Add
            </button>
          </div>
        </div>
      </Section>

      <Show when={customs().length > 0}>
        <div class="flex flex-col gap-4 pt-2">
          <For each={customs()}>
            {(btn) => {
              const [cfgOpen, setCfgOpen] = createSignal(false);
              const [cfgPos, setCfgPos] = createSignal({ top: 0, right: 0 });
              let cfgBtnRef: HTMLButtonElement | undefined;

              const openCfg = () => {
                if (cfgBtnRef) {
                  const r = cfgBtnRef.getBoundingClientRect();
                  setCfgPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
                }
                setCfgOpen((v) => !v);
              };

              const cfgRows = () => [
                ...Object.entries(btn.telescopeCssVariables ?? {}),
                ...Object.entries(btn.buttonConfig),
              ].map(([k, v]) => ({ k, v }));

              return (
                <div class="flex flex-col gap-2">
                  <Show when={cfgOpen()}>
                    <Portal>
                      <div class="fixed inset-0 z-[300]" onClick={() => setCfgOpen(false)} />
                      <div
                        class="fixed z-[301] min-w-[300px] max-h-80 overflow-y-auto overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
                        style={{ top: `${cfgPos().top}px`, right: `${cfgPos().right}px` }}
                      >
                        <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
                          <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">{btn.label}</p>
                          <CopyButton
                            getText={() => JSON.stringify({ telescopeCssVariables: btn.telescopeCssVariables ?? {}, buttonConfig: btn.buttonConfig }, null, 2)}
                            label="Copy JSON"
                          />
                        </div>
                        <div class="p-3">
                          <For each={cfgRows()}>
                            {(row) => (
                              <div class="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                                <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{row.k}</span>
                                <span class="font-mono text-[11px] text-text-normal-primary">{row.v}</span>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </Portal>
                  </Show>

                  {/* Header */}
                  <div class="flex items-center justify-between">
                    <p class="text-label-semi-bold text-text-normal-primary">{btn.label}</p>
                    <div class="flex items-center gap-1">
                      <button
                        ref={(el) => (cfgBtnRef = el)}
                        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
                        classList={{ "bg-background-normal-secondary text-text-normal-primary": cfgOpen() }}
                        onClick={openCfg}
                      >
                        <PhosphorIcon name="code" fontSize={13} />
                        <span>Config</span>
                      </button>
                      <button
                        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                        onClick={() => remove(btn.key)}
                      >
                        <PhosphorIcon name="trash" fontSize={14} />
                      </button>
                    </div>
                  </div>

                  {/* Preview — identical to builder */}
                  <div
                    class="overflow-hidden rounded-xl"
                    style={{
                      ...(btn.telescopeCssVariables as JSX.CSSProperties | undefined),
                      ...shapeVars(btn),
                      background: btn.telescopeCssVariables?.["--background-normal-primary"] ?? "var(--background-normal-primary)",
                      "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                    }}
                  >
                    <div class="flex flex-col gap-3 border-b p-5" style={{ "border-color": "var(--stroke-1)" }}>
                      <p class="text-label-semi-bold text-text-normal-secondary">Brand</p>
                      <div class="flex flex-wrap gap-3">
                        <For each={BRAND_BUTTONS}>
                          {(spec) => (
                            <button
                              class={`flex items-center justify-center transition-all active:scale-[0.98] ${spec.opacity ? "pointer-events-none" : (spec.hover ?? "")}`}
                              style={{
                                height: "var(--btn-height)", "min-width": "100px", padding: "0 16px",
                                "border-radius": "var(--btn-radius)", background: spec.bg, color: spec.text,
                                "box-shadow": spec.border ? `inset 0 0 0 1px ${spec.border.replace("1px solid ", "")}` : "none",
                                "font-size": "var(--btn-font-size)", "font-weight": "var(--btn-font-weight)",
                                opacity: spec.opacity ? "0.4" : "1",
                              }}
                            >{spec.label}</button>
                          )}
                        </For>
                      </div>
                    </div>
                    <div class="flex flex-col gap-3 p-5">
                      <p class="text-label-semi-bold text-text-normal-secondary">Neutral & Semantic</p>
                      <div class="flex flex-wrap gap-3">
                        <For each={NEUTRAL_BUTTONS}>
                          {(spec) => (
                            <button
                              class={`flex items-center justify-center transition-all active:scale-[0.98] ${spec.opacity ? "pointer-events-none" : (spec.hover ?? "")}`}
                              style={{
                                height: "var(--btn-height)", "min-width": "100px", padding: "0 16px",
                                "border-radius": "var(--btn-radius)", background: spec.bg, color: spec.text,
                                "box-shadow": spec.border ? `inset 0 0 0 1px ${spec.border.replace("1px solid ", "")}` : "none",
                                "font-size": "var(--btn-font-size)", "font-weight": "var(--btn-font-weight)",
                                opacity: spec.opacity ? "0.4" : "1",
                              }}
                            >{spec.label}</button>
                          )}
                        </For>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}

// ─── Input playground ────────────────────────────────────────────────────────

/** A self-contained replica of the Telescope Input component using CSS vars */
function InputField(props: {
  label?: string;
  placeholder?: string;
  helperText?: string;
  state: "default" | "error" | "disabled";
  initialValue?: string;
  height: number;
  radius: number;
  strokeOn?: boolean;
}) {
  const [isFocused, setIsFocused] = createSignal(false);
  const [value, setValue] = createSignal(props.initialValue ?? "");

  const strokeOn = () => props.strokeOn !== false;

  const borderColor = () => {
    if (props.state === "error")    return "var(--error-base, #ef4444)";
    if (props.state === "disabled") return "transparent";
    if (!strokeOn())                return "transparent";
    if (isFocused())                return "var(--stroke-solid)";
    return "var(--stroke-2)";
  };
  // --sdk-input-bg lets the builder override bg independently of --background-normal-primary
  const bg = () => props.state === "disabled"
    ? "var(--background-normal-tertiary)"
    : "var(--sdk-input-bg, var(--background-normal-primary))";
  const shadow = () => isFocused() && props.state === "default"
    ? "none"
    : props.state === "default"
    ? "0px 1px 2px 0px rgba(10,13,20,0.03)"
    : "none";

  return (
    <div class="flex flex-col gap-1 w-full">
      <Show when={props.label}>
        <label class="text-para-3-medium" style={{ color: "var(--text-normal-primary)" }}>
          {props.label}
        </label>
      </Show>
      <div
        style={{
          height: `${props.height}px`,
          "border-radius": `${props.radius}px`,
          background: bg(),
          border: `1px solid ${borderColor()}`,
          "box-shadow": shadow(),
          display: "flex",
          "align-items": "center",
          padding: "0 12px",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          cursor: props.state === "disabled" ? "not-allowed" : "text",
        }}
      >
        <input
          class="text-para-2-regular w-full bg-transparent outline-none"
          style={{
            color: "var(--text-normal-primary)",
            cursor: props.state === "disabled" ? "not-allowed" : "text",
          }}
          placeholder={props.placeholder ?? "Enter value…"}
          value={value()}
          disabled={props.state === "disabled"}
          onInput={(e) => setValue(e.currentTarget.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <Show when={props.helperText}>
        <span
          class="text-label-regular"
          style={{ color: props.state === "error" ? "var(--error-base, #ef4444)" : "var(--text-normal-secondary)" }}
        >
          {props.helperText}
        </span>
      </Show>
    </div>
  );
}

type InputCustomBrand = {
  key: string;
  label: string;
  telescopeCssVariables?: Record<string, string>;
  inputConfig: { height: string; borderRadius: string; strokeOn?: boolean; inputBg?: string };
};

const INPUT_CUSTOMS_KEY = "hcp-input-customs";
const INPUT_INIT_KEY = "hcp-input-customs-init-v1";

const DEFAULT_INPUT_BRANDS: InputCustomBrand[] = [
  {
    key: "input-uber",
    label: "Uber",
    telescopeCssVariables: {
      "--sdk-input-bg":                "#F6F6F6",
      "--background-normal-primary":   "#FFFFFF",
      "--background-normal-tertiary":  "#E2E2E2",
      "--background-normal-secondary": "#FFFFFF",
      "--stroke-2":     "#F6F6F6",
      "--stroke-3":     "#E2E2E2",
      "--stroke-solid": "#000000",
      "--error-base":   "#E11900",
      "--text-normal-primary":   "#000000",
      "--text-normal-secondary": "#5E5E5E",
      "--text-normal-tertiary":  "#6B6B6B",
    },
    inputConfig: { height: "54px", borderRadius: "8px", strokeOn: false, inputBg: "#F6F6F6" },
  },
];

function loadInputCustoms(): InputCustomBrand[] {
  try {
    if (!localStorage.getItem(INPUT_INIT_KEY)) {
      localStorage.setItem(INPUT_CUSTOMS_KEY, JSON.stringify(DEFAULT_INPUT_BRANDS));
      localStorage.setItem(INPUT_INIT_KEY, "1");
      return DEFAULT_INPUT_BRANDS;
    }
    const s = localStorage.getItem(INPUT_CUSTOMS_KEY); return s ? JSON.parse(s) : [];
  }
  catch { return []; }
}
function saveInputCustoms(list: InputCustomBrand[]) {
  localStorage.setItem(INPUT_CUSTOMS_KEY, JSON.stringify(list));
}

function InputPlayground() {
  // — Shape —
  const [height, setHeight] = createSignal(44);
  const [radius, setRadius] = createSignal(12);
  const [strokeOn, setStrokeOn] = createSignal(true);

  // — Context colors —
  const [ctxInputBg,     setCtxInputBg]     = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgPrimary,   setCtxBgPrimary]   = createSignal(LIGHT_CTX_DEFAULTS.bgPrimary);
  const [ctxBgSecondary, setCtxBgSecondary] = createSignal(LIGHT_CTX_DEFAULTS.bgSecondary);
  const [ctxBgTertiary,  setCtxBgTertiary]  = createSignal("#f3f4f6");
  const [ctxStroke2,     setCtxStroke2]     = createSignal("#e5e7eb");
  const [ctxStroke3,     setCtxStroke3]     = createSignal("#d1d5db");
  const [ctxStrokeSolid, setCtxStrokeSolid] = createSignal("#6b7280");
  const [ctxErrorBase,   setCtxErrorBase]   = createSignal("#ef4444");
  const [ctxTextPrimary, setCtxTextPrimary] = createSignal(LIGHT_CTX_DEFAULTS.textPrimary);
  const [ctxTextSecondary,setCtxTextSecondary]=createSignal(LIGHT_CTX_DEFAULTS.textSecondary);
  const [ctxTextTertiary,setCtxTextTertiary]= createSignal(LIGHT_CTX_DEFAULTS.textTertiary);

  const contextVars = createMemo((): JSX.CSSProperties => ({
    "--sdk-input-bg":                ctxInputBg(),
    "--background-normal-primary":   ctxBgPrimary(),
    "--background-normal-secondary": ctxBgSecondary(),
    "--background-normal-tertiary":  ctxBgTertiary(),
    "--stroke-2":     ctxStroke2(),
    "--stroke-3":     ctxStroke3(),
    "--stroke-solid": ctxStrokeSolid(),
    "--error-base":   ctxErrorBase(),
    "--text-normal-primary":   ctxTextPrimary(),
    "--text-normal-secondary": ctxTextSecondary(),
    "--text-normal-tertiary":  ctxTextTertiary(),
  }));

  // Config popup
  const [configOpen, setConfigOpen] = createSignal(false);
  const [popupPos, setPopupPos] = createSignal({ top: 0, right: 0 });
  let configBtnRef: HTMLButtonElement | undefined;

  const openConfig = () => {
    if (configBtnRef) {
      const r = configBtnRef.getBoundingClientRect();
      setPopupPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setConfigOpen((v) => !v);
  };

  const getJson = () => JSON.stringify({
    telescopeCssVariables: Object.fromEntries(
      Object.entries(contextVars()).map(([k, v]) => [k, String(v)])
    ),
    inputConfig: {
      height: `${height()}px`,
      borderRadius: `${radius()}px`,
      strokeOn: strokeOn(),
      inputBg: ctxInputBg(),
    },
  }, null, 2);

  const configAction = (
    <div class="flex items-center gap-1">
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
        onClick={() => {
          setHeight(44); setRadius(12); setStrokeOn(true);
          setCtxInputBg(LIGHT_CTX_DEFAULTS.bgPrimary);
          setCtxBgPrimary(LIGHT_CTX_DEFAULTS.bgPrimary); setCtxBgSecondary(LIGHT_CTX_DEFAULTS.bgSecondary);
          setCtxBgTertiary("#f3f4f6"); setCtxStroke2("#e5e7eb"); setCtxStroke3("#d1d5db");
          setCtxStrokeSolid("#6b7280"); setCtxErrorBase("#ef4444");
          setCtxTextPrimary(LIGHT_CTX_DEFAULTS.textPrimary); setCtxTextSecondary(LIGHT_CTX_DEFAULTS.textSecondary);
          setCtxTextTertiary(LIGHT_CTX_DEFAULTS.textTertiary);
        }}
      >
        <PhosphorIcon name="arrow-ccw" fontSize={13} />
        <span>Reset</span>
      </button>
      <button
        ref={(el) => (configBtnRef = el)}
        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
        classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
        onClick={openConfig}
      >
        <PhosphorIcon name="sliders" fontSize={16} />
      </button>
    </div>
  );

  // Custom brands
  const [customs, setCustoms] = createSignal<InputCustomBrand[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => setCustoms(loadInputCustoms()));

  const addCustom = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a name"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p !== "object" || p === null) { setParseError("Invalid JSON"); return; }
      const cfg = (p["inputConfig"] ?? {}) as Record<string, unknown>;
      const entry: InputCustomBrand = {
        key: `input-${Date.now()}`,
        label: name,
        telescopeCssVariables: p["telescopeCssVariables"] as Record<string, string> | undefined,
        inputConfig: {
          height:       (cfg["height"] as string)       ?? "44px",
          borderRadius: (cfg["borderRadius"] as string) ?? "12px",
          strokeOn:     cfg["strokeOn"] !== false,
          inputBg:      (cfg["inputBg"] as string | undefined),
        },
      };
      const updated = [...customs(), entry];
      setCustoms(updated); saveInputCustoms(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) { setParseError(`JSON parse error: ${(e as Error).message}`); }
  };

  const removeCustom = (key: string) => {
    const updated = customs().filter((c) => c.key !== key);
    setCustoms(updated); saveInputCustoms(updated);
  };

  const INPUT_STATES: { state: "default" | "error" | "disabled"; label: string; initialValue?: string; helper?: string }[] = [
    { state: "default",  label: "Amount",        initialValue: "",       helper: "Enter amount in ₹" },
    { state: "default",  label: "Gift card code", initialValue: "GIFT50", helper: "Looks good!" },
    { state: "error",    label: "Phone number",  initialValue: "98765",  helper: "Enter a valid 10-digit number" },
    { state: "disabled", label: "Promo code",    initialValue: "SAVE10", helper: "Code applied" },
  ];

  return (
    <div class="p-4 pb-20">
      <Show when={configOpen()}>
        <Portal>
          <div class="fixed inset-0 z-[300]" onClick={() => setConfigOpen(false)} />
          <div
            class="fixed z-[301] min-w-[300px] max-h-80 overflow-y-auto overflow-hidden rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl"
            style={{ top: `${popupPos().top}px`, right: `${popupPos().right}px` }}
          >
            <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">CSS Output</p>
              <CopyButton getText={getJson} label="Copy JSON" />
            </div>
            <div class="p-3">
              <For each={Object.entries({ ...contextVars(), height: `${height()}px`, borderRadius: `${radius()}px` })}>
                {([k, v]) => (
                  <div class="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                    <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{k}</span>
                    <span class="font-mono text-[11px] text-text-normal-primary">{String(v)}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>

      <Section title="Input Builder" action={configAction}>
        <div class="flex flex-col gap-6">

          {/* ── Preview ── */}
          <div
            class="grid grid-cols-2 gap-5 rounded-xl p-6"
            style={{
              ...contextVars(),
              background: ctxBgSecondary(),
              "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
            }}
          >
            <For each={INPUT_STATES}>
              {(s) => (
                <InputField
                  label={s.label}
                  placeholder="Enter value…"
                  initialValue={s.initialValue}
                  helperText={s.helper}
                  state={s.state}
                  height={height()}
                  radius={radius()}
                  strokeOn={strokeOn()}
                />
              )}
            </For>
          </div>

          {/* ── Controls ── */}
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-stroke-1 pt-4">

            {/* Left: Shape */}
            <div class="flex flex-col gap-4">
              <CtrlGroup title="Shape">
                <CtrlRow label="Height">
                  <SliderInput min={32} max={56} value={height()} onChange={setHeight} unit="px" />
                </CtrlRow>
                <CtrlRow label="Radius">
                  <SliderInput min={0} max={24} value={radius()} onChange={setRadius} unit="px" />
                </CtrlRow>
              </CtrlGroup>

              <CtrlGroup title="Background">
                <CtrlRow label="Input">
                  <ColorPickerCtrl value={ctxInputBg()} onChange={setCtxInputBg} />
                </CtrlRow>
                <CtrlRow label="Surface">
                  <ColorPickerCtrl value={ctxBgSecondary()} onChange={setCtxBgSecondary} />
                </CtrlRow>
                <CtrlRow label="Disabled">
                  <ColorPickerCtrl value={ctxBgTertiary()} onChange={setCtxBgTertiary} />
                </CtrlRow>
              </CtrlGroup>
            </div>

            {/* Right: Colors */}
            <div class="flex flex-col gap-4">
              <CtrlGroup title="Border">
                <CtrlRow label="Stroke">
                  <ToggleSwitch value={strokeOn()} onChange={setStrokeOn} />
                </CtrlRow>
                <CtrlRow label="Default">
                  <ColorPickerCtrl value={ctxStroke2()} onChange={setCtxStroke2} />
                </CtrlRow>
                <CtrlRow label="Hover">
                  <ColorPickerCtrl value={ctxStroke3()} onChange={setCtxStroke3} />
                </CtrlRow>
                <CtrlRow label="Focus">
                  <ColorPickerCtrl value={ctxStrokeSolid()} onChange={setCtxStrokeSolid} />
                </CtrlRow>
                <CtrlRow label="Error">
                  <ColorPickerCtrl value={ctxErrorBase()} onChange={setCtxErrorBase} />
                </CtrlRow>
              </CtrlGroup>

              <CtrlGroup title="Text">
                <CtrlRow label="Primary">
                  <ColorPickerCtrl value={ctxTextPrimary()} onChange={setCtxTextPrimary} />
                </CtrlRow>
                <CtrlRow label="Secondary">
                  <ColorPickerCtrl value={ctxTextSecondary()} onChange={setCtxTextSecondary} />
                </CtrlRow>
                <CtrlRow label="Tertiary">
                  <ColorPickerCtrl value={ctxTextTertiary()} onChange={setCtxTextTertiary} />
                </CtrlRow>
              </CtrlGroup>
            </div>

          </div>
        </div>
      </Section>

      {/* ── Custom inputs ── */}
      <div class="mt-8 flex flex-col gap-3 border-t border-stroke-1 pt-8">
        <Section
          title="Custom Input"
          subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response"
          action={<CopyButton getText={() => INPUT_EXTRACTION_PROMPT} label="Copy Prompt" />}
        >
          <div class="flex flex-col gap-2.5">
            <textarea
              class="h-24 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
              placeholder={`{\n  "telescopeCssVariables": { "--background-normal-primary": "#...", "--stroke-2": "#..." },\n  "inputConfig": { "height": "44px", "borderRadius": "12px" }\n}`}
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
          <div class="flex flex-col gap-6 pt-2">
            <For each={customs()}>
              {(entry) => {
                const [cfgOpen, setCfgOpen] = createSignal(false);
                const [cfgPos, setCfgPos] = createSignal({ top: 0, right: 0 });
                let cfgRef: HTMLButtonElement | undefined;
                const openCfg = () => {
                  if (cfgRef) { const r = cfgRef.getBoundingClientRect(); setCfgPos({ top: r.bottom + 8, right: window.innerWidth - r.right }); }
                  setCfgOpen((v) => !v);
                };
                const h = () => parseInt(entry.inputConfig.height) || 44;
                const r = () => parseInt(entry.inputConfig.borderRadius) || 12;
                return (
                  <div class="flex flex-col gap-2">
                    <Show when={cfgOpen()}>
                      <Portal>
                        <div class="fixed inset-0 z-[300]" onClick={() => setCfgOpen(false)} />
                        <div class="fixed z-[301] min-w-[300px] max-h-80 overflow-y-auto rounded-xl border border-stroke-1 bg-background-normal-primary shadow-xl" style={{ top: `${cfgPos().top}px`, right: `${cfgPos().right}px` }}>
                          <div class="flex items-center justify-between border-b border-stroke-1 px-3 py-2">
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">{entry.label}</p>
                            <CopyButton getText={() => JSON.stringify({ telescopeCssVariables: entry.telescopeCssVariables ?? {}, inputConfig: entry.inputConfig }, null, 2)} label="Copy JSON" />
                          </div>
                          <div class="p-3">
                            <For each={[...Object.entries(entry.telescopeCssVariables ?? {}), ...Object.entries(entry.inputConfig)]}>
                              {([k, v]) => (
                                <div class="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 hover:bg-background-normal-secondary">
                                  <span class="shrink-0 font-mono text-[11px] text-text-normal-tertiary">{k}</span>
                                  <span class="font-mono text-[11px] text-text-normal-primary">{v}</span>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Portal>
                    </Show>
                    <div class="flex items-center justify-between">
                      <p class="text-label-semi-bold text-text-normal-primary">{entry.label}</p>
                      <div class="flex items-center gap-1">
                        <button ref={(el) => (cfgRef = el)} class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary" classList={{ "bg-background-normal-secondary text-text-normal-primary": cfgOpen() }} onClick={openCfg}>
                          <PhosphorIcon name="code" fontSize={13} /><span>Config</span>
                        </button>
                        <button class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400" onClick={() => removeCustom(entry.key)}>
                          <PhosphorIcon name="trash" fontSize={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-2 gap-5 rounded-xl p-6"
                      style={{
                        ...(entry.telescopeCssVariables as JSX.CSSProperties | undefined),
                        ...(entry.inputConfig.inputBg ? { "--sdk-input-bg": entry.inputConfig.inputBg } as JSX.CSSProperties : {}),
                        background: entry.telescopeCssVariables?.["--background-normal-secondary"] ?? "var(--background-normal-secondary)",
                        "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                      }}
                    >
                      <For each={INPUT_STATES}>
                        {(s) => <InputField label={s.label} placeholder="Enter value…" initialValue={s.initialValue} helperText={s.helper} state={s.state} height={h()} radius={r()} strokeOn={entry.inputConfig.strokeOn !== false} />}
                      </For>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
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

type PlaygroundTab = "categories" | "appbar" | "listing" | "button" | "input" | "basics";

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

// ─── Listing custom brands ────────────────────────────────────────────────────

type ListingCustomBrand = {
  key: string;
  label: string;
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

const LISTING_CUSTOMS_KEY = "hcp-listing-customs";

function loadListingCustoms(): ListingCustomBrand[] {
  try { const s = localStorage.getItem(LISTING_CUSTOMS_KEY); return s ? JSON.parse(s) : []; }
  catch { return []; }
}
function saveListingCustoms(list: ListingCustomBrand[]) {
  localStorage.setItem(LISTING_CUSTOMS_KEY, JSON.stringify(list));
}

function ListingCustomSection(props: { builderState: ReturnType<typeof createListingBuilderState> }) {
  const [customs, setCustoms] = createSignal<ListingCustomBrand[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => setCustoms(loadListingCustoms()));

  const add = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a brand name"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p !== "object" || p === null || Array.isArray(p)) {
        setParseError("Invalid JSON: expected an object"); return;
      }
      const brand: ListingCustomBrand = {
        key: `listing-${Date.now()}`,
        label: name,
        telescopeCssVariables: p["telescopeCssVariables"] as Record<string, string> | undefined,
        sdkCssVariables: p["sdkCssVariables"] as Record<string, string> | undefined,
      };
      const updated = [...customs(), brand];
      setCustoms(updated); saveListingCustoms(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const remove = (key: string) => {
    const updated = customs().filter((c) => c.key !== key);
    setCustoms(updated); saveListingCustoms(updated);
  };

  return (
    <>
      <Section
        title="Custom Brand"
        subtitle="Copy prompt and use it with screenshots or a URL to generate a JSON response"
        action={<CopyButton getText={() => LISTING_EXTRACTION_PROMPT} label="Copy Prompt" />}
      >
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-24 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
            placeholder={`{\n  "telescopeCssVariables": { "--background-normal-primary": "#..." },\n  "sdkCssVariables": { "--sdk-listing-image-radius": "16px", "--text-listing": "#..." }\n}`}
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
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              class="shrink-0 rounded-lg bg-feature-base px-4 py-2 text-label-semi-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!jsonInput().trim() || !nameInput().trim()}
              onClick={add}
            >
              Add
            </button>
          </div>
        </div>
      </Section>

      <Show when={customs().length > 0}>
        <Section title="Saved Brands">
          <div class="flex flex-col gap-6">
            <For each={customs()}>
              {(brand) => {
                const sdkVars = () => brand.sdkCssVariables ?? {};
                const imageRadius = () => sdkVars()["--sdk-listing-image-radius"] ?? `${props.builderState.imageRadius()}px`;

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

                const allVarRows = () => [
                  ...Object.entries(brand.telescopeCssVariables ?? {}),
                  ...Object.entries(brand.sdkCssVariables ?? {}),
                ].map(([name, value]) => ({ name, value }));

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
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-text-normal-tertiary">{brand.label}</p>
                            <CopyButton
                              getText={() => JSON.stringify({
                                telescopeCssVariables: brand.telescopeCssVariables ?? {},
                                sdkCssVariables: brand.sdkCssVariables ?? {},
                              }, null, 2)}
                              label="Copy JSON"
                            />
                          </div>
                          <div class="p-3">
                            <For each={allVarRows()}>
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

                    {/* Header */}
                    <div class="flex items-center justify-between">
                      <p class="text-label-semi-bold text-text-normal-primary">{brand.label}</p>
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
                          onClick={() => remove(brand.key)}
                        >
                          <PhosphorIcon name="trash" fontSize={14} />
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div
                      class="overflow-hidden rounded-xl"
                      style={{
                        ...(brand.telescopeCssVariables as JSX.CSSProperties | undefined),
                        ...(brand.sdkCssVariables as JSX.CSSProperties | undefined),
                        background: "var(--background-normal-primary)",
                        "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                      }}
                    >
                      <div class="flex gap-3 overflow-x-auto px-4 py-4 no-scrollbar">
                        <For each={(listingDataRaw as ListingItem[]).slice(0, 5)}>
                          {(item) => (
                            <SdkListingCard
                              title={item.title}
                              tags={item.tags}
                              discountPercent={item.discountPercentage}
                              imageUrl={item.imageUrl}
                              style={{
                                width: "140px",
                                "--sdk-listing-image-radius": imageRadius(),
                              } as JSX.CSSProperties}
                            />
                          )}
                        </For>
                      </div>
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

function ListingPlayground() {
  const state = createListingBuilderState();
  return (
    <div class="flex flex-col gap-16 p-4 pb-20">
      <ListingBuilderSection state={state} />
      <ListingCustomSection builderState={state} />
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
            <p class="text-title-5-semi-bold text-text-normal-primary">UI Config</p>
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
              { key: "button" as PlaygroundTab, label: "Button" },
              { key: "input" as PlaygroundTab, label: "Input" },
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
        <Show when={tab() === "button"}>
          <ButtonPlayground />
        </Show>
        <Show when={tab() === "input"}>
          <InputPlayground />
        </Show>
        <Show when={tab() === "basics"}>
          <BasicsPlayground darkMode={darkMode} />
        </Show>
      </div>
    </div>
  );
}
