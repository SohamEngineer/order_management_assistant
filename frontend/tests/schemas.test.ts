import { describe, expect, it } from "vitest";

import { loginSchema, passwordScore, signupSchema } from "@/lib/schemas";

const account = {
  name: "Asha Rao",
  email: "asha@example.com",
  password: "sample-pass-1",
  confirmPassword: "sample-pass-1",
  acceptTerms: true,
};

const failedFields = (result: { error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path[0]);

describe("loginSchema", () => {
  it("normalizes the email", () => {
    const parsed = loginSchema.parse({
      email: "  Asha@Example.COM ",
      password: "x",
      remember: false,
    });
    expect(parsed.email).toBe("asha@example.com");
  });

  it.each(["", "asha", "asha@", "@example.com"])("rejects the email %j", (email) => {
    const result = loginSchema.safeParse({ email, password: "x", remember: false });
    expect(failedFields(result)).toEqual(["email"]);
  });
});

describe("signupSchema", () => {
  it("accepts a complete account", () => {
    expect(signupSchema.safeParse(account).success).toBe(true);
  });

  it.each(["short1", "onlyletters", "1234567890"])("rejects the password %j", (password) => {
    const result = signupSchema.safeParse({ ...account, password, confirmPassword: password });
    expect(failedFields(result)).toEqual(["password"]);
  });

  it("requires matching passwords", () => {
    const result = signupSchema.safeParse({ ...account, confirmPassword: "different-1" });
    expect(failedFields(result)).toEqual(["confirmPassword"]);
  });

  it("requires the terms to be accepted", () => {
    const result = signupSchema.safeParse({ ...account, acceptTerms: false });
    expect(failedFields(result)).toEqual(["acceptTerms"]);
  });
});

describe("passwordScore", () => {
  it.each([
    ["", 0],
    ["abc", 1],
    ["abcdefgh", 1],
    ["abcdefg1", 2],
    ["Abcdefg1", 3],
    ["Abcdefg1!", 4],
  ])("scores %j as %i", (password, score) => {
    expect(passwordScore(password)).toBe(score);
  });
});
