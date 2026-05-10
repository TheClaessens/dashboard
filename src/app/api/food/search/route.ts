import { NextRequest } from "next/server";
import { searchFoods } from "@/lib/open-food-facts";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");

  if (!q) {
    return Response.json({ error: "q is required" }, { status: 400 });
  }

  try {
    const results = await searchFoods(q);
    return Response.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[food/search]", message);
    return Response.json({ error: message }, { status: 502 });
  }
}
