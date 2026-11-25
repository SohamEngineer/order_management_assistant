import { BoxIcon, CheckIcon, SparkIcon, TruckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

import { Logo } from "./logo";

const glass = "rounded-2xl border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur-xl";

const TRACKING = [
  { label: "Placed", icon: CheckIcon, done: true },
  { label: "Packed", icon: BoxIcon, done: true },
  { label: "On the way", icon: TruckIcon, done: true },
  { label: "Delivered", icon: CheckIcon, done: false },
];

/** A decorative picture of the product. All of its content is made up. */
function ProductPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md pt-2 pb-10">
      <div className={cn(glass, "animate-float p-5")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/60">Sample order</p>
            <p className="font-bold">Order #1042</p>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
            On the way
          </span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full animate-progress rounded-full bg-linear-to-r from-cyan-400 to-emerald-300" />
        </div>
        <ul className="mt-4 grid grid-cols-4 gap-2">
          {TRACKING.map(({ label, icon: StepIcon, done }) => (
            <li key={label} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  done
                    ? "bg-white/15 text-white"
                    : "border border-dashed border-white/25 text-white/40",
                )}
              >
                <StepIcon className="size-4" />
              </span>
              <span className={cn("text-[0.68rem]", done ? "text-white/80" : "text-white/45")}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={cn(
          glass,
          "absolute -right-3 bottom-0 flex max-w-64 animate-float items-center gap-3 p-3.5 [animation-delay:-3s] xl:-right-8",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-500">
          <SparkIcon className="size-4" />
        </span>
        <p className="text-xs leading-relaxed text-white/85">
          <strong className="block text-white">Assistant</strong>2 orders need your attention.
        </p>
      </div>
    </div>
  );
}

export function Showcase() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#090c1f] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:gap-10 xl:p-14">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[28rem] animate-drift rounded-full bg-indigo-600/45 blur-3xl" />
        <div className="absolute top-1/3 -right-32 size-[26rem] animate-drift rounded-full bg-fuchsia-600/30 blur-3xl [animation-delay:-6s]" />
        <div className="absolute -bottom-40 left-1/4 size-[26rem] animate-drift rounded-full bg-cyan-500/25 blur-3xl [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[44px_44px]" />
      </div>

      <Logo className="relative" />

      <div className="relative flex flex-col gap-10">
        <div>
          {/* Not a heading: the page's own title must be the first one. */}
          <p className="max-w-lg text-4xl leading-tight font-extrabold tracking-tight text-balance xl:text-5xl">
            Every order,{" "}
            <span className="bg-linear-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              under control.
            </span>
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Track, update and resolve customer orders from one calm workspace.
          </p>
        </div>
        <ProductPreview />
      </div>

      <ul className="relative flex flex-wrap gap-2 text-xs font-semibold text-white/80">
        {["Order tracking", "Status updates", "Smart assistance"].map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
          >
            <CheckIcon className="size-3.5 text-emerald-300" />
            {feature}
          </li>
        ))}
      </ul>
    </aside>
  );
}
