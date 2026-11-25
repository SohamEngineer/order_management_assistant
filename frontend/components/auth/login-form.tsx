"use client";

import { useLayoutEffect, useState } from "react";

import { Checkbox, InputField, PasswordField } from "@/components/ui/fields";
import { FormAlert } from "@/components/ui/form-alert";
import { MailIcon } from "@/components/ui/icons";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginSchema } from "@/lib/schemas";
import { useForm } from "@/lib/use-form";
import { isDemoMode, login } from "@/services/auth";

import { SuccessPanel } from "./success-panel";

export function LoginForm() {
  const [done, setDone] = useState(false);
  useLayoutEffect(() => () => setDone(false), []);

  const form = useForm({
    initialValues: { email: "", password: "", remember: true },
    schema: loginSchema,
    onSubmit: async (credentials, { reset }) => {
      await login(credentials);
      reset();
      setDone(true);
    },
  });

  if (done) {
    return (
      <SuccessPanel
        title="Your details look good"
        actionLabel="Back to sign in"
        onAction={() => setDone(false)}
      >
        {isDemoMode
          ? "No backend is connected yet, so you are not signed in. Nothing was sent or saved."
          : "You are signed in."}
      </SuccessPanel>
    );
  }

  return (
    <form {...form.formProps} className="flex flex-col gap-4">
      {form.formError && <FormAlert message={form.formError} />}
      <InputField
        label="Email address"
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        icon={<MailIcon />}
        {...form.field("email")}
      />
      <PasswordField label="Password" autoComplete="current-password" {...form.field("password")} />
      <Checkbox label="Keep me signed in on this device" {...form.checkbox("remember")} />
      <SubmitButton pending={form.pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
