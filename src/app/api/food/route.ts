import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { meals, foodItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");

  if (!date) {
    return Response.json({ error: "date is required" }, { status: 400 });
  }

  try {
    const mealsForDate = await db.select().from(meals).where(eq(meals.date, date));
    const result = await Promise.all(
      mealsForDate.map(async (meal) => {
        const items = await db.select().from(foodItems).where(eq(foodItems.mealId, meal.id));
        return { ...meal, items };
      })
    );
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[food]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
