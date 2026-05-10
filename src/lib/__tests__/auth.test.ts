import { describe, it, expect, beforeEach } from "vitest";
import { isAllowedEmail, isAuthorized } from "@/lib/auth-helpers";

describe("isAllowedEmail", () => {
  beforeEach(() => {
    process.env.ALLOWED_EMAIL = "thomasclssns01@gmail.com";
  });

  it("allows the configured email", () => {
    expect(isAllowedEmail("thomasclssns01@gmail.com")).toBe(true);
  });

  it("rejects a different email", () => {
    expect(isAllowedEmail("someone@else.com")).toBe(false);
  });

  it("rejects null", () => {
    expect(isAllowedEmail(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isAllowedEmail(undefined)).toBe(false);
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
