import type { ReactNode } from "react";

import { ArrowRightIcon, SpinnerIcon } from "./icons";

export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-size-[200%_100%] text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-500 hover:bg-position-[100%_0] hover:shadow-xl hover:shadow-violet-600/35 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75"
    >
      {/* A light sweep on hover. */}
      <span
        aria-hidden
        className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/20 blur-md transition-all duration-700 group-hover:left-[115%]"
      />
      {pending ? (
        <>
          <SpinnerIcon />
          {pendingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
