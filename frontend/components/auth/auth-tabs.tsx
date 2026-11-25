"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/cn";

const TABS = [
  { segment: "login", href: "/login", label: "Sign in" },
  { segment: "signup", href: "/signup", label: "Create account" },
] as const;

/** Switches between the two pages. It lives in the layout, so the pill can slide. */
export function AuthTabs() {
  const active = useSelectedLayoutSegment();
  return (
    <nav
      aria-label="Account"
      className="relative grid grid-cols-2 rounded-2xl border border-border bg-surface p-1 shadow-sm"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30 transition-transform duration-300 ease-out",
          active === "signup" && "translate-x-full",
        )}
      />
      {TABS.map(({ segment, href, label }) => (
        <Link
          key={segment}
          href={href}
          aria-current={active === segment ? "page" : undefined}
          className={cn(
            "relative rounded-xl py-2.5 text-center text-sm font-bold transition-colors",
            active === segment ? "text-white" : "text-muted hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
