import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { savedMeals, savedMealItems, meals, foodItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const relogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  items: z.array(
    z.object({
      name: z.string().trim().min(1),
      quantity: z.number().positive(),
      calories: z.number().nonnegative(),
      protein: z.number().nonnegative(),
      carbs: z.number().nonnegative(),
      fat: z.number().nonnegative(),
    })
  ).min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: savedMealId } = await params;

  try {
    const [savedMeal] = await db.select().from(savedMeals).where(eq(savedMeals.id, savedMealId));
    if (!savedMeal) return Response.json({ error: "Saved meal not found" }, { status: 404 });

    const body = await req.json();
    const parsed = relogSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { date, items } = parsed.data;
    const [meal] = await db.insert(meals).values({ name: savedMeal.name, date }).returning();
    const insertedItems = await db
      .insert(foodItems)
      .values(items.map((item) => ({ ...item, mealId: meal.id })))
      .returning();

    return Response.json({ ...meal, items: insertedItems }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[saved-meals/relog]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: savedMealId } = await params;
  try {
    const [savedMeal] = await db.select().from(savedMeals).where(eq(savedMeals.id, savedMealId));
    if (!savedMeal) return Response.json({ error: "Saved meal not found" }, { status: 404 });
    const items = await db.select().from(savedMealItems).where(eq(savedMealItems.savedMealId, savedMealId));
    return Response.json({ ...savedMeal, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
