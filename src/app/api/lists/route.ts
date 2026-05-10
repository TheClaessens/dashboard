import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { lists } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(lists);
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const [list] = await db.insert(lists).values({ name: body.name.trim() }).returning();
  return Response.json(list, { status: 201 });
}
