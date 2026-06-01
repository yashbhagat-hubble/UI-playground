export type BrandTheme = {
  key: string;
  label: string;
  defaultIconStyle?: "icon" | "emoji";
  fontImportUrl?: string;
  telescopeCssVariables?: Record<string, string>;
  sdkCssVariables?: Record<string, string>;
};

const themeModules = import.meta.glob<BrandTheme>("./brand-themes/*.json", {
  eager: true,
  import: "default",
});

export const brandThemes: BrandTheme[] = Object.values(themeModules);

export const designVariantOverrides: Record<
  string,
  {
    telescopeCssVariables?: Record<string, string>;
    sdkCssVariables?: Record<string, string>;
    fontImportUrl?: string;
    defaultIconStyle?: "icon" | "emoji";
  }
> = Object.fromEntries(
  brandThemes.map((theme) => [
    theme.key,
    {
      telescopeCssVariables: theme.telescopeCssVariables,
      sdkCssVariables: theme.sdkCssVariables,
      fontImportUrl: theme.fontImportUrl,
      defaultIconStyle: theme.defaultIconStyle,
    },
  ])
);
