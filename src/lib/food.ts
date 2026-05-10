import type { Macros, FoodItem } from "@/lib/schemas/food";

export function scaleMacros(per100g: Macros, quantity: number): Macros {
  const factor = quantity / 100;
  return {
    calories: Math.round(per100g.calories * factor * 10) / 10,
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
  };
}

export function sumMacros(items: Pick<FoodItem, "calories" | "protein" | "carbs" | "fat">[]): Macros {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
