import { z } from "zod";

export const createMealSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const addFoodItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export const macrosSchema = z.object({
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export type Macros = z.infer<typeof macrosSchema>;

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type AddFoodItemInput = z.infer<typeof addFoodItemSchema>;

export type FoodItem = {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
};

export type Meal = {
  id: string;
  name: string;
  date: string;
  createdAt: Date;
  items: FoodItem[];
};
