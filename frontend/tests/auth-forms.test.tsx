// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import * as auth from "@/services/auth";

vi.mock("@/services/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof auth>()),
  login: vi.fn(),
  signup: vi.fn(),
}));

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => {
  vi.mocked(auth.login).mockReset().mockResolvedValue();
  vi.mocked(auth.signup).mockReset().mockResolvedValue();
});
afterEach(cleanup);

describe("LoginForm", () => {
  it("shows errors and does not submit an empty form", () => {
    render(<LoginForm />);
    click("Sign in");

    expect(screen.getByText("Enter your email address.")).toBeDefined();
    expect(screen.getByText("Enter your password.")).toBeDefined();
    expect(document.activeElement).toBe(screen.getByLabelText("Email address"));
    expect(auth.login).not.toHaveBeenCalled();
  });

  it("submits valid details once", async () => {
    render(<LoginForm />);
    type("Email address", "Asha@example.com");
    type("Password", "sample-pass-1");
    click("Sign in");

    await screen.findByText("Your details look good");
    expect(auth.login).toHaveBeenCalledExactlyOnceWith({
      email: "asha@example.com",
      password: "sample-pass-1",
      remember: true,
    });
  });

  it("shows the message from a rejected sign in", async () => {
    vi.mocked(auth.login).mockRejectedValue(new auth.AuthError("Email or password is incorrect."));
    render(<LoginForm />);
    type("Email address", "asha@example.com");
    type("Password", "wrong-pass-1");
    click("Sign in");

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Email or password is incorrect."),
    );
  });

  it("can reveal the password", () => {
    render(<LoginForm />);
    click("Show password");
    expect(screen.getByLabelText("Password").getAttribute("type")).toBe("text");
  });
});

describe("SignupForm", () => {
  function completeFirstStep() {
    type("Full name", "Asha Rao");
    type("Email address", "asha@example.com");
    click("Continue");
  }

  function completeSecondStep() {
    type("Password", "sample-pass-1");
    type("Confirm password", "sample-pass-1");
    fireEvent.click(screen.getByRole("checkbox"));
    click("Create account");
  }

  it("stays on step one until the details are valid", () => {
    render(<SignupForm />);
    click("Continue");

    expect(screen.getByText("Enter your full name.")).toBeDefined();
    expect(screen.queryByLabelText("Confirm password")).toBeNull();
  });

  it("keeps entered details when going back", () => {
    render(<SignupForm />);
    completeFirstStep();
    expect(document.activeElement).toBe(screen.getByLabelText("Password"));
    click("Back");

    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe("Asha Rao");
  });

  it("creates the account without sending the confirmation or terms fields", async () => {
    render(<SignupForm />);
    completeFirstStep();
    completeSecondStep();

    await screen.findByText("Nice to meet you, Asha");
    expect(auth.signup).toHaveBeenCalledExactlyOnceWith({
      name: "Asha Rao",
      email: "asha@example.com",
      password: "sample-pass-1",
    });
  });

  async function submitWithRejectedEmail() {
    vi.mocked(auth.signup).mockRejectedValue(
      new auth.AuthError("That email is already registered.", { email: "Already in use." }),
    );
    render(<SignupForm />);
    completeFirstStep();
    completeSecondStep();
    await screen.findByText("Already in use.");
  }

  it("stays on step one while a rejected email is being corrected", async () => {
    await submitWithRejectedEmail();

    // Typing clears the error, which must not jump back to step two.
    type("Email address", "asha.rao@example.com");

    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(screen.queryByLabelText("Confirm password")).toBeNull();
  });

  it("focuses the rejected email field", async () => {
    await submitWithRejectedEmail();

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Email address")),
    );
  });
});
