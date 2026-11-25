import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to continue to your orders.</p>
      </div>
      <LoginForm />
    </div>
  );
}
