"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { z } from "zod";

import { AuthError, type FieldErrors } from "@/services/auth";

type FormValues = Record<string, string | boolean>;

type Options<Values extends FormValues, Output> = {
  initialValues: Values;
  schema: z.ZodType<Output>;
  onSubmit: (data: Output, helpers: { reset: () => void }) => Promise<void>;
};

/** A short shake draws the eye to a rejected form. */
function shake(form: HTMLFormElement) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  form.animate?.(
    [0, -8, 7, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
    { duration: 380, easing: "ease-out" },
  );
}

export function useForm<Values extends FormValues, Output>({
  initialValues,
  schema,
  onSubmit,
}: Options<Values, Output>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const initial = useRef(initialValues);

  function reset() {
    setValues(initial.current);
    setErrors({});
    setFormError(undefined);
  }

  // Next.js keeps hidden pages alive. Clear on leave so that passwords do not linger.
  useLayoutEffect(
    () => () => {
      setValues(initial.current);
      setErrors({});
      setFormError(undefined);
    },
    [],
  );

  /** Validates, shows the errors and focuses the first one. Null when invalid. */
  function check<Result>(form: HTMLFormElement, using: z.ZodType<Result>) {
    setFormError(undefined);
    const parsed = using.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return { data: parsed.data };
    }
    const found: FieldErrors = {};
    for (const issue of parsed.error.issues) found[String(issue.path[0])] ??= issue.message;
    setErrors(found);
    form.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
    shake(form);
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const result = check(form, schema);
    if (!result) return;

    submitting.current = true;
    setPending(true);
    try {
      await onSubmit(result.data, { reset });
    } catch (error) {
      if (error instanceof AuthError) {
        setErrors(error.fieldErrors);
        setFormError(error.message);
      } else {
        console.error(error);
        setFormError("Something went wrong. Please try again.");
      }
      shake(form);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function setValue<Name extends keyof Values>(name: Name, value: Values[Name]) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  /** Props for a text-like input. */
  function field<Name extends keyof Values & string>(name: Name) {
    return {
      name,
      value: values[name] as string,
      error: errors[name],
      onChange: (event: { target: { value: string } }) =>
        setValue(name, event.target.value as Values[Name]),
    };
  }

  /** Props for a checkbox. */
  function checkbox<Name extends keyof Values & string>(name: Name) {
    return {
      name,
      checked: values[name] as boolean,
      error: errors[name],
      onChange: (event: { target: { checked: boolean } }) =>
        setValue(name, event.target.checked as Values[Name]),
    };
  }

  return {
    values,
    errors,
    formError,
    pending,
    field,
    checkbox,
    check,
    reset,
    // method="post" keeps passwords out of the URL if submitted before the page is ready.
    formProps: { onSubmit: handleSubmit, method: "post", noValidate: true } as const,
  };
}
