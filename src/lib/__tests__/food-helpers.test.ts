import { describe, it, expect } from "vitest";
import { sumMacros, scaleMacros, deriveSavedMealItems } from "@/lib/food";

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

const mealWithItems = {
  id: "meal-1",
  name: "Breakfast",
  date: "2026-05-19",
  createdAt: new Date(),
  items: [
    { id: "item-1", mealId: "meal-1", name: "Oatmeal", quantity: 100, calories: 68, protein: 2.4, carbs: 12, fat: 1.4, createdAt: new Date() },
    { id: "item-2", mealId: "meal-1", name: "Banana", quantity: 120, calories: 107, protein: 1.3, carbs: 27, fat: 0.4, createdAt: new Date() },
  ],
};

describe("deriveSavedMealItems", () => {
  it("maps each food item to a saved meal item with defaultQuantity", () => {
    const result = deriveSavedMealItems(mealWithItems);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "Oatmeal", defaultQuantity: 100, calories: 68, protein: 2.4, carbs: 12, fat: 1.4 });
    expect(result[1]).toEqual({ name: "Banana", defaultQuantity: 120, calories: 107, protein: 1.3, carbs: 27, fat: 0.4 });
  });

  it("returns empty array for a meal with no food items", () => {
    const result = deriveSavedMealItems({ ...mealWithItems, items: [] });
    expect(result).toEqual([]);
  });
});
