import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { foodItems } from "@/db/schema";
import { addFoodItemSchema } from "@/lib/schemas/food";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: mealId } = await params;
  try {
    const body = await req.json();
    const parsed = addFoodItemSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const [item] = await db.insert(foodItems).values({ ...parsed.data, mealId }).returning();
    return Response.json(item, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[meals/items]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: mealId } = await params;
  const { searchParams } = req.nextUrl;
  const itemId = searchParams.get("itemId");
  if (!itemId) return Response.json({ error: "itemId required" }, { status: 400 });

  try {
    const { eq, and } = await import("drizzle-orm");
    await db.delete(foodItems).where(and(eq(foodItems.id, itemId), eq(foodItems.mealId, mealId)));
    return new Response(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
