import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { lists } from "@/db/schema";
import { createListSchema } from "@/lib/schemas/todo";

export async function GET() {
  const rows = await db.select().from(lists);
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [list] = await db.insert(lists).values({ name: parsed.data.name }).returning();
  return Response.json(list, { status: 201 });
}
