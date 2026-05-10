import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { updateTodoSchema } from "@/lib/schemas/todo";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateTodoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [todo] = await db
    .update(todos)
    .set({
      ...(parsed.data.completedAt !== undefined && {
        completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : null,
      }),
      ...(parsed.data.dueDate !== undefined && { dueDate: parsed.data.dueDate }),
      ...(parsed.data.listId !== undefined && { listId: parsed.data.listId }),
    })
    .where(eq(todos.id, id))
    .returning();
  if (!todo) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(todo);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(todos).where(eq(todos.id, id));
  return new Response(null, { status: 204 });
}
