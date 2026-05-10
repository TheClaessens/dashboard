import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [todo] = await db
    .update(todos)
    .set({
      ...(body.status !== undefined && { status: body.status }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
      ...(body.listId !== undefined && { listId: body.listId }),
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
