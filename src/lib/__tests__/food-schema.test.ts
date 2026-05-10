import { describe, it, expect } from "vitest";
import { createMealSchema, addFoodItemSchema } from "@/lib/schemas/food";

describe("createMealSchema", () => {
  it("rejects empty name", () => {
    const result = createMealSchema.safeParse({ name: "", date: "2026-05-10" });
    expect(result.success).toBe(false);
  });

  it("rejects missing date", () => {
    const result = createMealSchema.safeParse({ name: "Breakfast" });
    expect(result.success).toBe(false);
  });

  it("accepts valid meal", () => {
    const result = createMealSchema.safeParse({ name: "Breakfast", date: "2026-05-10" });
    expect(result.success).toBe(true);
  });
});

const validItem = { name: "Chicken", quantity: 150, calories: 165, protein: 31, carbs: 0, fat: 3.6 };

describe("addFoodItemSchema", () => {
  it("rejects zero quantity", () => {
    const result = addFoodItemSchema.safeParse({ ...validItem, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = addFoodItemSchema.safeParse({ ...validItem, quantity: -50 });
    expect(result.success).toBe(false);
  });

  it("accepts valid food item", () => {
    const result = addFoodItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });
});
