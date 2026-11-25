"use client";

import {
  useId,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from "./icons";

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
      <AlertIcon className="mt-0.5 size-4" />
      {message}
    </p>
  );
}

type InputFieldProps = Omit<ComponentProps<"input">, "placeholder" | "id"> & {
  label: string;
  icon: ReactNode;
  error?: string;
  trailing?: ReactNode;
};

/** Input with a leading icon and a label that floats once there is text or focus. */
export function InputField({ label, icon, error, trailing, className, ...props }: InputFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <div className="relative">
        <input
          {...props}
          id={id}
          // A blank placeholder lets CSS detect whether the field is empty.
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "peer h-14 w-full rounded-xl border border-border bg-field pt-5 pb-1 pl-11 text-[0.95rem] transition",
            "hover:border-accent/40 focus:border-accent focus:ring-4 focus:ring-accent/15 focus-visible:outline-none",
            "aria-invalid:border-danger aria-invalid:focus:ring-danger/15",
            trailing ? "pr-12" : "pr-3",
          )}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted transition peer-focus:text-accent"
        >
          {icon}
        </span>
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-2 left-11 text-xs font-semibold text-muted transition-all",
            "peer-placeholder-shown:top-[1.1rem] peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-accent",
          )}
        >
          {label}
        </label>
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

/** Password input with a show button and a Caps Lock warning. */
export function PasswordField(props: Omit<InputFieldProps, "icon" | "trailing" | "type">) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // Never leave a password readable on a page kept in the background.
  useLayoutEffect(
    () => () => {
      setVisible(false);
      setCapsLock(false);
    },
    [],
  );

  const detectCapsLock = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <InputField
        {...props}
        type={visible ? "text" : "password"}
        icon={<LockIcon />}
        onKeyDown={detectCapsLock}
        onKeyUp={detectCapsLock}
        onBlur={() => setCapsLock(false)}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="rounded-lg p-2 text-muted transition hover:bg-accent/10 hover:text-accent"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
      />
      <p role="status" className={cn("text-sm text-warning", capsLock && "mt-1.5")}>
        {capsLock ? "Caps Lock is on" : ""}
      </p>
    </div>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "id"> & {
  label: ReactNode;
  error?: string;
};

export function Checkbox({ label, error, ...props }: CheckboxProps) {
  const id = useId();
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            {...props}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? id : undefined}
            className="peer size-5 cursor-pointer appearance-none rounded-md border border-border bg-field transition checked:border-indigo-600 checked:bg-indigo-600 aria-invalid:border-danger"
          />
          <CheckIcon className="pointer-events-none absolute inset-0.5 size-4 scale-50 text-white opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100" />
        </span>
        <span className="text-muted">{label}</span>
      </label>
      {error && <FieldError id={id} message={error} />}
    </div>
  );
}
