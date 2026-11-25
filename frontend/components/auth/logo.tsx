import { BoxIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { config } from "@/lib/config";

export function Logo({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
        <BoxIcon />
      </span>
      <span className="max-w-36 text-sm leading-tight font-extrabold tracking-tight sm:max-w-none sm:text-base">
        {config.appName}
      </span>
    </p>
  );
}
