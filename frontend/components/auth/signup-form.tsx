"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";

import { Checkbox, InputField, PasswordField } from "@/components/ui/fields";
import { FormAlert } from "@/components/ui/form-alert";
import { ArrowLeftIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";
import { signupDetailsSchema, signupSchema } from "@/lib/schemas";
import { useForm } from "@/lib/use-form";
import { AuthError, isDemoMode, signup } from "@/services/auth";

import { PasswordMeter } from "./password-meter";
import { SuccessPanel } from "./success-panel";

const STEPS = ["Your details", "Secure account"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-2 gap-3" aria-label="Sign up progress">
      {STEPS.map((label, index) => (
        <li key={label} aria-current={index === current ? "step" : undefined}>
          <span aria-hidden className="block h-1.5 overflow-hidden rounded-full bg-border">
            <span
              className={cn(
                "block h-full rounded-full bg-linear-to-r from-indigo-600 to-violet-500 transition-all duration-500",
                index <= current ? "w-full" : "w-0",
              )}
            />
          </span>
          <span
            className={cn(
              "mt-2 block text-xs font-semibold",
              index === current ? "text-foreground" : "text-muted",
            )}
          >
            {index + 1}. {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function SignupForm() {
  const [step, setStep] = useState(0);
  const [createdFor, setCreatedFor] = useState<string>();
  const formElement = useRef<HTMLFormElement>(null);
  // Focus moves only after the person changes step, never on first load.
  const focusPending = useRef(false);

  useLayoutEffect(
    () => () => {
      setStep(0);
      setCreatedFor(undefined);
    },
    [],
  );

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    schema: signupSchema,
    onSubmit: async ({ name, email, password }, { reset }) => {
      try {
        await signup({ name, email, password });
      } catch (error) {
        // A complaint about step one brings it back, and it stays until Continue.
        if (error instanceof AuthError && (error.fieldErrors.name || error.fieldErrors.email)) {
          goTo(0);
        }
        throw error;
      }
      reset();
      setStep(0);
      setCreatedFor(name);
    },
  });

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    const fields = formElement.current;
    // A rejected field comes first, otherwise the first field of the step.
    const target =
      fields?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      fields?.querySelector<HTMLElement>(`[name="${step ? "password" : "name"}"]`);
    target?.focus();
  }, [step]);

  function goTo(next: number) {
    focusPending.current = true;
    setStep(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (step === 1) return form.formProps.onSubmit(event);
    event.preventDefault();
    if (form.check(event.currentTarget, signupDetailsSchema)) goTo(1);
  }

  if (createdFor) {
    return (
      <SuccessPanel
        title={`Nice to meet you, ${createdFor.split(" ")[0]}`}
        actionLabel="Start again"
        onAction={() => setCreatedFor(undefined)}
      >
        {isDemoMode
          ? "No backend is connected yet, so no account was created. Nothing was sent or saved."
          : "Your account is ready."}
      </SuccessPanel>
    );
  }

  return (
    <form
      {...form.formProps}
      onSubmit={handleSubmit}
      ref={formElement}
      className="flex flex-col gap-5"
    >
      <Stepper current={step} />
      {form.formError && <FormAlert message={form.formError} />}

      <div key={step} className="flex animate-rise flex-col gap-4">
        {step === 0 ? (
          <>
            <InputField
              label="Full name"
              autoComplete="name"
              icon={<UserIcon />}
              {...form.field("name")}
            />
            <InputField
              label="Email address"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              icon={<MailIcon />}
              {...form.field("email")}
            />
          </>
        ) : (
          <>
            {/* Tells password managers which account the new password belongs to. */}
            <input
              type="email"
              autoComplete="username"
              value={form.values.email}
              readOnly
              tabIndex={-1}
              aria-hidden
              className="sr-only"
            />
            <PasswordField
              label="Password"
              autoComplete="new-password"
              {...form.field("password")}
            />
            <PasswordMeter password={form.values.password} />
            <PasswordField
              label="Confirm password"
              autoComplete="new-password"
              {...form.field("confirmPassword")}
            />
            <Checkbox
              label="I agree to the terms of service and privacy policy"
              {...form.checkbox("acceptTerms")}
            />
          </>
        )}
      </div>

      <div className="flex gap-3">
        {step === 1 && (
          <button
            type="button"
            onClick={() => goTo(0)}
            disabled={form.pending}
            className="flex h-13 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </button>
        )}
        <SubmitButton pending={form.pending} pendingLabel="Creating account…">
          {step === 0 ? "Continue" : "Create account"}
        </SubmitButton>
      </div>
    </form>
  );
}
