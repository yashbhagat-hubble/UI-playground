export type AppbarTheme = {
  key: string;
  label: string;
  appbarCssVariables?: Record<string, string>;
  appbarConfig?: {
    backIcon?: "arrow" | "caret";
    titleAlign?: "left" | "center";
  };
};

const themeModules = import.meta.glob<AppbarTheme>("./appbar-themes/*.json", {
  eager: true,
  import: "default",
});

export const appbarThemes: AppbarTheme[] = Object.values(themeModules);
