import { NextResponse } from "next/server";
import { getActivities, getWellness } from "@/lib/intervals-icu";

export async function GET() {
  const today = new Date().toLocaleDateString("en-CA");
  try {
    const [activities, wellness] = await Promise.all([
      getActivities(60),
      getWellness(today),
    ]);
    return NextResponse.json({ activities, wellness });
  } catch {
    return NextResponse.json({ activities: [], wellness: null });
  }
}
