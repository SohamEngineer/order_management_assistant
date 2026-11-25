import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted">Two short steps and you are ready to go.</p>
      </div>
      <SignupForm />
    </div>
  );
}
