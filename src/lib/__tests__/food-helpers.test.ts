import { describe, it, expect } from "vitest";
import { sumMacros, scaleMacros } from "@/lib/food";

describe("sumMacros", () => {
  it("returns zeros for empty list", () => {
    expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it("sums macros across multiple food items", () => {
    const items = [
      { calories: 200, protein: 10, carbs: 30, fat: 5 },
      { calories: 150, protein: 20, carbs: 10, fat: 8 },
    ];
    expect(sumMacros(items)).toEqual({ calories: 350, protein: 30, carbs: 40, fat: 13 });
  });
});

describe("scaleMacros", () => {
  it("scales per-100g values to the logged quantity", () => {
    const per100g = { calories: 200, protein: 20, carbs: 10, fat: 8 };
    expect(scaleMacros(per100g, 150)).toEqual({ calories: 300, protein: 30, carbs: 15, fat: 12 });
  });
});
