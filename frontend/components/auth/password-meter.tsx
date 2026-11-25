import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PASSWORD_RULES, passwordScore } from "@/lib/schemas";

const LEVELS = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-rose-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

export function PasswordMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div aria-hidden className="flex flex-1 gap-1.5">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                step <= score ? LEVELS[score].color : "bg-border",
              )}
            />
          ))}
        </div>
        <p aria-live="polite" className="w-14 text-right text-xs font-semibold text-muted">
          {LEVELS[score].label}
        </p>
      </div>
      <ul className="grid gap-1 text-xs sm:grid-cols-2">
        {PASSWORD_RULES.map(({ label, test }) => {
          const met = test(password);
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                met ? "text-success" : "text-muted",
              )}
            >
              {met ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <span aria-hidden className="mx-1 size-1.5 rounded-full bg-current" />
              )}
              {label}
              <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
