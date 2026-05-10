import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { createTodoSchema } from "@/lib/schemas/todo";

export async function GET(req: NextRequest) {
  const listId = req.nextUrl.searchParams.get("listId");
  const rows = await db
    .select()
    .from(todos)
    .where(listId ? eq(todos.listId, listId) : undefined);
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: parsed.data.title, listId: parsed.data.listId ?? null, dueDate: parsed.data.dueDate ?? null })
    .returning();
  return Response.json(todo, { status: 201 });
}
