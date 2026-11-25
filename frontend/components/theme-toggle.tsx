"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { resolveTheme, THEME_KEY } from "@/lib/theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme,
    () => undefined,
  );

  // React resets <html> attributes when it remounts in development.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolveTheme();
  }, []);

  const next = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // The choice then lasts until the page is closed.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted shadow-sm transition hover:border-accent hover:text-accent"
    >
      {/* CSS picks the icon, so the server markup is right for both themes. */}
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}
