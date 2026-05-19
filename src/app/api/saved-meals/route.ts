import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { savedMeals, savedMealItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSavedMealSchema, savedMealItemSchema } from "@/lib/schemas/food";
import { z } from "zod";

const createSavedMealWithItemsSchema = createSavedMealSchema.extend({
  items: z.array(savedMealItemSchema).min(1, "At least one item is required"),
});

export async function GET() {
  try {
    const all = await db.select().from(savedMeals).orderBy(savedMeals.createdAt);
    const result = await Promise.all(
      all.map(async (meal) => {
        const items = await db.select().from(savedMealItems).where(eq(savedMealItems.savedMealId, meal.id));
        return { ...meal, items };
      })
    );
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[saved-meals]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSavedMealWithItemsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const { name, items } = parsed.data;
    const [meal] = await db.insert(savedMeals).values({ name }).returning();
    const insertedItems = await db
      .insert(savedMealItems)
      .values(items.map((item) => ({ ...item, savedMealId: meal.id })))
      .returning();
    return Response.json({ ...meal, items: insertedItems }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[saved-meals POST]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
