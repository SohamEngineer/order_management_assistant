"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function SuccessPanel({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  // The form is gone, so move focus to the result for keyboard and screen reader users.
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="flex animate-rise flex-col items-center gap-4 py-4 text-center">
      <svg viewBox="0 0 72 72" aria-hidden="true" className="size-20 text-success">
        <circle cx="36" cy="36" r="34" fill="currentColor" opacity="0.12" />
        <circle
          cx="36"
          cy="36"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          pathLength="1"
          strokeDasharray="1"
          className="animate-draw"
        />
        <path
          d="m25 37 8 8 15-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          strokeDasharray="1"
          className="animate-draw [animation-delay:0.55s]"
        />
      </svg>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-bold focus-visible:outline-none">
        {title}
      </h2>
      <div className="text-sm text-muted">{children}</div>
      <button
        type="button"
        onClick={onAction}
        className="mt-2 h-11 rounded-xl border border-border px-5 text-sm font-semibold transition hover:border-accent hover:text-accent"
      >
        {actionLabel}
      </button>
    </div>
  );
}
