/**
 * CONNECT YOUR BACKEND HERE. The forms call only `login` and `signup`.
 *
 * Replace the two bodies with requests to your API, then set `isDemoMode` to false
 * and redirect after success. To show a server message, throw an `AuthError`, e.g.
 *
 *   throw new AuthError("That email is already registered.", { email: "Already in use." });
 *
 * Keep the session in a secure, HttpOnly cookie set by the server, not in localStorage.
 */

export type FieldErrors = Partial<Record<string, string>>;

export class AuthError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export type Credentials = { email: string; password: string; remember: boolean };
export type NewAccount = { name: string; email: string; password: string };

export const isDemoMode = true;

/** Waits like a network request would. Nothing is sent or stored. */
const simulateRequest = () => new Promise<void>((resolve) => setTimeout(resolve, 900));

export const login: (credentials: Credentials) => Promise<void> = simulateRequest;

export const signup: (account: NewAccount) => Promise<void> = simulateRequest;
