import { describe, it, expect } from "vitest";
import { deriveForm, formatSleepDuration } from "@/lib/health";


describe("deriveForm", () => {
  it("returns CTL minus ATL", () => {
    expect(deriveForm(80, 90)).toBe(-10);
  });

  it("returns positive when CTL exceeds ATL", () => {
    expect(deriveForm(75, 60)).toBe(15);
  });

  it("returns zero when equal", () => {
    expect(deriveForm(50, 50)).toBe(0);
  });
});

describe("formatSleepDuration", () => {
  it("formats whole hours and minutes", () => {
    expect(formatSleepDuration(7 * 3600 + 30 * 60)).toBe("7h 30m");
  });

  it("formats zero minutes correctly", () => {
    expect(formatSleepDuration(8 * 3600)).toBe("8h 0m");
  });

  it("formats sub-hour durations", () => {
    expect(formatSleepDuration(45 * 60)).toBe("0h 45m");
  });
});
