import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { meals } from "@/db/schema";
import { createMealSchema } from "@/lib/schemas/food";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createMealSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const [meal] = await db.insert(meals).values(parsed.data).returning();
    return Response.json(meal, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[meals]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
