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

export const createSavedMealSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const savedMealItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  defaultQuantity: z.number().positive("Quantity must be greater than 0"),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export const quantitySchema = z.object({
  quantity: z.number().positive("Quantity must be greater than 0"),
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
export type CreateSavedMealInput = z.infer<typeof createSavedMealSchema>;
export type SavedMealItemInput = z.infer<typeof savedMealItemSchema>;

export interface SavedMealItem {
  id: string;
  savedMealId: string;
  name: string;
  defaultQuantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  createdAt: Date;
  items: SavedMealItem[];
}

export interface FoodItem {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface Meal {
  id: string;
  name: string;
  date: string;
  createdAt: Date;
  items: FoodItem[];
}
