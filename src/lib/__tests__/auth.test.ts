import { describe, it, expect, beforeEach } from "vitest";
import { isValidCredentials, isAuthorized } from "@/lib/auth-helpers";

describe("isValidCredentials", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "thomasclssns01@gmail.com";
    process.env.ADMIN_PASSWORD = "correct-password";
  });

  it("accepts correct email and password", () => {
    expect(isValidCredentials("thomasclssns01@gmail.com", "correct-password")).toBe(true);
  });

  it("rejects wrong password", () => {
    expect(isValidCredentials("thomasclssns01@gmail.com", "wrong-password")).toBe(false);
  });

  it("rejects wrong email", () => {
    expect(isValidCredentials("other@email.com", "correct-password")).toBe(false);
  });

  it("rejects null email", () => {
    expect(isValidCredentials(null, "correct-password")).toBe(false);
  });

  it("rejects null password", () => {
    expect(isValidCredentials("thomasclssns01@gmail.com", null)).toBe(false);
  });
});

describe("isAuthorized", () => {
  it("authorizes a request with a session", () => {
    expect(isAuthorized({ user: { email: "thomasclssns01@gmail.com" } })).toBe(true);
  });

  it("rejects a request with no session", () => {
    expect(isAuthorized(null)).toBe(false);
  });
});
