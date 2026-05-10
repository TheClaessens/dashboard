import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { isValidTodoInput } from "@/lib/todo-helpers";

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
  if (!isValidTodoInput(body.title)) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }
  const [todo] = await db
    .insert(todos)
    .values({ title: body.title.trim(), listId: body.listId ?? null, dueDate: body.dueDate ?? null })
    .returning();
  return Response.json(todo, { status: 201 });
}
