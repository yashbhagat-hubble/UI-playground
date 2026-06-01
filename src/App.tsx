/**
 * Card Design System Playground — standalone build
 */

import { createMemo, createSignal, For, JSX, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { PhosphorIcon } from "./components/PhosphorIcon";
import { SdkCategoryCard } from "./components/SdkCategoryCard";
import { brandThemes, designVariantOverrides } from "./data/brand_themes_registry";
import { EXTRACTION_PROMPT } from "./data/extraction_prompt";
import { MOCK_CATEGORIES, categoryIconMap, categoryEmoji, type MockCategory } from "./utils/categories";
import { formatDiscountPercent } from "./utils/number";

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

// ─── Theme tabs ───────────────────────────────────────────────────────────────

type ThemeKey = "default" | string;

const SHOWCASE_KEYS = ["phonepe", "googlepay", "cred", "instamart", "blinkit", "uber"];
const THEME_TABS: { key: ThemeKey; label: string }[] = [
  { key: "default", label: "Default" },
  ...SHOWCASE_KEYS.map((key) => {
    const theme = brandThemes.find((t) => t.key === key);
    return { key, label: theme?.label ?? key };
  }),
];

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

type ConfigModalData = {
  label: string;
  defaultIconStyle?: "icon" | "emoji";
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

// ─── Layout primitive ─────────────────────────────────────────────────────────

function Section(props: {
  title: string;
  children: JSX.Element;
  class?: string;
  action?: JSX.Element;
}) {
  return (
    <div class={`flex flex-col overflow-hidden rounded-2xl border border-stroke-1 bg-background-normal-primary ${props.class ?? ""}`}>
      <div class="flex items-center justify-between border-b border-stroke-1 px-4 py-3">
        <p class="text-label-semi-bold uppercase tracking-widest text-text-normal-tertiary">
          {props.title}
        </p>
        <Show when={props.action}>{props.action}</Show>
      </div>
      <div class="p-4">{props.children}</div>
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
    <div class="flex flex-wrap items-center gap-1">
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
    activeThemeKey, loadTheme, resetCtxToMode,
  };
}

type CardBuilderState = ReturnType<typeof createCardBuilderState>;

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
    <button
      ref={(el) => (configBtnRef = el)}
      class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-secondary"
      classList={{ "bg-background-normal-secondary text-text-normal-primary": configOpen() }}
      onClick={openConfig}
      title="CSS Variables"
    >
      <PhosphorIcon name="sliders" fontSize={16} />
    </button>
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
                getText={() =>
                  JSON.stringify(
                    Object.fromEntries(cssVarRows().map((r) => [r.name, r.value])),
                    null,
                    2
                  )
                }
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

      <Section title="Card Builder" action={configAction}>
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
            <button
              class="flex size-7 items-center justify-center rounded-lg text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary"
              onClick={props.onClose}
            >
              <PhosphorIcon name="x" fontSize={16} />
            </button>
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

// ─── Theme showcase ───────────────────────────────────────────────────────────

function ThemeShowcaseSection(props: {
  darkMode: () => boolean;
  cardCssVars: () => JSX.CSSProperties;
  onOpenConfig: (data: ConfigModalData) => void;
  categories: MockCategory[];
}) {
  onMount(() => {
    THEME_TABS.forEach((theme) => {
      if (theme.key === "default") return;
      const url = designVariantOverrides[theme.key]?.fontImportUrl;
      if (!url || document.querySelector(`link[href="${url}"]`)) return;
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = url;
      document.head.appendChild(link);
    });
  });

  return (
    <Section title="Themes">
      <div class="flex flex-col gap-4">
        <For each={THEME_TABS}>
          {(theme) => {
            const override = theme.key !== "default" ? designVariantOverrides[theme.key] : undefined;
            return (
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <p class="text-label-semi-bold text-text-normal-primary">{theme.label}</p>
                  <button
                    class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
                    onClick={() => props.onOpenConfig({
                      label: theme.label,
                      defaultIconStyle: override?.defaultIconStyle,
                      telescopeCssVariables: override?.telescopeCssVariables,
                      sdkCssVariables: override?.sdkCssVariables,
                    })}
                  >
                    <PhosphorIcon name="code" fontSize={13} />
                    <span>Config</span>
                  </button>
                </div>
                <div
                  class="rounded-xl"
                  style={{
                    ...props.cardCssVars(),
                    ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
                    ...(override?.telescopeCssVariables as JSX.CSSProperties | undefined),
                    ...(override?.sdkCssVariables as JSX.CSSProperties | undefined),
                    ...collapseInvisibleContainer(override?.sdkCssVariables),
                    background: "var(--background-normal-primary)",
                    "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                    padding: "40px",
                  }}
                >
                  <div class="flex flex-wrap gap-2">
                    <For each={props.categories.slice(0, 5)}>
                      {(cat) => {
                        const IconComponent = categoryIconMap[cat.categoryName];
                        const useEmoji = override?.defaultIconStyle === "emoji";
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
          }}
        </For>
      </div>
    </Section>
  );
}

// ─── Custom brands ────────────────────────────────────────────────────────────

const CUSTOM_BRANDS_STORAGE_KEY = "hubble-playground-custom-brands";

type CustomBrand = {
  key: string; label: string;
  defaultIconStyle?: "icon" | "emoji";
  fontImportUrl?: string;
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

function loadCustomBrandsFromStorage(): CustomBrand[] {
  try {
    const stored = localStorage.getItem(CUSTOM_BRANDS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CustomBrand[]) : [];
  } catch { return []; }
}

function persistCustomBrands(brands: CustomBrand[]) {
  localStorage.setItem(CUSTOM_BRANDS_STORAGE_KEY, JSON.stringify(brands));
}

function CustomBrandsSection(props: {
  darkMode: () => boolean;
  cardCssVars: () => JSX.CSSProperties;
  onOpenConfig: (data: ConfigModalData) => void;
  categories: MockCategory[];
}) {
  const [customBrands, setCustomBrands] = createSignal<CustomBrand[]>([]);
  const [jsonInput, setJsonInput] = createSignal("");
  const [nameInput, setNameInput] = createSignal("");
  const [parseError, setParseError] = createSignal<string | null>(null);

  onMount(() => setCustomBrands(loadCustomBrandsFromStorage()));

  const saveBrand = () => {
    const name = nameInput().trim();
    if (!name) { setParseError("Enter a brand name before saving"); return; }
    const raw = jsonInput().trim();
    if (!raw) { setParseError("Paste a JSON config first"); return; }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setParseError("Invalid JSON: expected an object"); return;
      }
      const brand: CustomBrand = {
        key: `custom-${Date.now()}`, label: name,
        defaultIconStyle: parsed["defaultIconStyle"] as "icon" | "emoji" | undefined,
        fontImportUrl: parsed["fontImportUrl"] as string | undefined,
        telescopeCssVariables: parsed["telescopeCssVariables"] as Record<string, string> | undefined,
        sdkCssVariables: parsed["sdkCssVariables"] as Record<string, string> | undefined,
      };
      const updated = [...customBrands(), brand];
      setCustomBrands(updated);
      persistCustomBrands(updated);
      setJsonInput(""); setNameInput(""); setParseError(null);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
    }
  };

  const deleteBrand = (key: string) => {
    const updated = customBrands().filter((b) => b.key !== key);
    setCustomBrands(updated); persistCustomBrands(updated);
  };

  const copyPromptAction = (
    <CopyButton getText={() => EXTRACTION_PROMPT} label="Copy Prompt" />
  );

  return (
    <Section title="Custom Brands" action={copyPromptAction}>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2.5">
          <textarea
            class="h-28 w-full resize-none rounded-lg border border-stroke-1 bg-background-normal-secondary px-3 py-2 font-mono text-[11px] leading-relaxed text-text-normal-primary placeholder:text-text-normal-tertiary focus:border-stroke-2 focus:outline-none"
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
              onKeyDown={(e) => e.key === "Enter" && saveBrand()}
            />
            <button
              class="shrink-0 rounded-lg bg-feature-base px-4 py-2 text-label-semi-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!jsonInput().trim() || !nameInput().trim()}
              onClick={saveBrand}
            >
              Save
            </button>
          </div>
        </div>

        <Show when={customBrands().length > 0}>
          <div class="flex flex-col gap-4 border-t border-stroke-1 pt-4">
            <For each={customBrands()}>
              {(brand) => (
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <p class="text-label-semi-bold text-text-normal-primary">{brand.label}</p>
                    <div class="flex items-center gap-1">
                      <button
                        class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-normal-tertiary transition-colors hover:bg-background-normal-secondary hover:text-text-normal-primary"
                        onClick={() => props.onOpenConfig({
                          label: brand.label,
                          defaultIconStyle: brand.defaultIconStyle,
                          telescopeCssVariables: brand.telescopeCssVariables,
                          sdkCssVariables: brand.sdkCssVariables,
                        })}
                      >
                        <PhosphorIcon name="code" fontSize={13} />
                        <span>Config</span>
                      </button>
                      <button
                        class="flex size-6 items-center justify-center rounded-md text-text-normal-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete brand"
                        onClick={() => deleteBrand(brand.key)}
                      >
                        <PhosphorIcon name="trash" fontSize={14} />
                      </button>
                    </div>
                  </div>
                  <div
                    class="rounded-xl"
                    style={{
                      ...props.cardCssVars(),
                      ...(props.darkMode() ? DARK_TELESCOPE_VARS : {}),
                      ...(brand.telescopeCssVariables as JSX.CSSProperties | undefined),
                      ...(brand.sdkCssVariables as JSX.CSSProperties | undefined),
                      ...collapseInvisibleContainer(brand.sdkCssVariables),
                      background: "var(--background-normal-primary)",
                      "box-shadow": "inset 0 0 0 1px var(--stroke-1)",
                      padding: "40px",
                    }}
                  >
                    <div class="flex flex-wrap gap-2">
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
              )}
            </For>
          </div>
        </Show>
      </div>
    </Section>
  );
}

// ─── Playground grid ──────────────────────────────────────────────────────────

function PlaygroundGrid(props: { darkMode: () => boolean }) {
  const state = createCardBuilderState();
  const [configModalData, setConfigModalData] = createSignal<ConfigModalData | null>(null);

  return (
    <>
      <Show when={configModalData()}>
        {(data) => <ConfigModal data={data()} onClose={() => setConfigModalData(null)} />}
      </Show>
      <div class="flex flex-col gap-3 p-4 pb-16">
        <CardBuilderSection state={state} categories={MOCK_CATEGORIES} />
        <CustomBrandsSection
          darkMode={props.darkMode}
          cardCssVars={state.cardCssVars}
          onOpenConfig={setConfigModalData}
          categories={MOCK_CATEGORIES}
        />
        <ThemeShowcaseSection
          darkMode={props.darkMode}
          cardCssVars={state.cardCssVars}
          onOpenConfig={setConfigModalData}
          categories={MOCK_CATEGORIES}
        />
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = createSignal(false);

  onMount(() => document.documentElement.classList.toggle("dark", false));

  const outerStyle = createMemo(
    (): JSX.CSSProperties => (darkMode() ? DARK_TELESCOPE_VARS : {})
  );

  return (
    <div
      class="flex min-h-dvh w-full justify-center bg-background-normal-primary"
      style={outerStyle()}
    >
      <div class="w-full max-w-[900px]">
        <div class="sticky top-0 z-[200] flex items-center justify-between border-b border-stroke-1 bg-background-normal-primary px-5 py-3">
          <div class="flex flex-col gap-0.5">
            <p class="text-title-5-semi-bold text-text-normal-primary">Design Playground</p>
            <p class="text-label-regular text-text-normal-tertiary">
              Card design system · CSS variable explorer
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
        <PlaygroundGrid darkMode={darkMode} />
      </div>
    </div>
  );
}
