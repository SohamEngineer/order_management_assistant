import { AuthTabs } from "@/components/auth/auth-tabs";
import { Logo } from "@/components/auth/logo";
import { Showcase } from "@/components/auth/showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import { isDemoMode } from "@/services/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <Showcase />
      <main className="relative flex flex-col overflow-hidden px-4 py-4 sm:px-8 sm:py-6">
        {/* Soft colour behind the card. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-32 size-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 size-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        </div>

        <header className="relative flex items-center justify-between gap-3">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 py-8">
          <AuthTabs />
          <div className="rounded-3xl border border-border bg-surface/85 p-5 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl sm:p-8 dark:shadow-black/40">
            {children}
          </div>
          {isDemoMode && (
            <p className="text-center text-xs text-muted">
              Design preview: no backend is connected, so nothing you type is sent or saved.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
