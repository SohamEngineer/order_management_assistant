/** Form validation. The backend must validate the same rules again. */
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address."));

export const PASSWORD_RULES = [
  { label: "8 or more characters", test: (value: string) => value.length >= 8 },
  { label: "At least one letter", test: (value: string) => /[A-Za-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
] as const;

export const newPasswordSchema = z
  .string()
  .max(128, "Use at most 128 characters.")
  .refine(
    (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
    "Meet all the password rules below.",
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});

/** Step one of sign up. */
export const signupDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Use at most 80 characters."),
  email: emailSchema,
});

export const signupSchema = signupDetailsSchema
  .extend({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptTerms: z.boolean().refine(Boolean, "Accept the terms to continue."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

/** 0 (empty) to 4 (strong). Guidance only: the rules above decide what is allowed. */
export function passwordScore(password: string) {
  if (!password) return 0;
  if (password.length < 8) return 1;
  const points = [
    /\d/.test(password),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 14,
  ].filter(Boolean).length;
  return 1 + points;
}
