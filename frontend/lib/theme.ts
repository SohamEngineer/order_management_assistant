export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/** The saved choice, otherwise the device setting. */
export function resolveTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be blocked. Fall through to the device setting.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Runs in <head> before the first paint, so the wrong theme never flashes. */
export const themeScript = `(function(){var t;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)})()`;
