import { NextRequest } from "next/server";
import { getCalendarEvents } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");

  if (!timeMin || !timeMax) {
    return Response.json({ error: "timeMin and timeMax are required" }, { status: 400 });
  }

  try {
    const events = await getCalendarEvents(new Date(timeMin), new Date(timeMax));
    return Response.json(events);
  } catch {
    return Response.json({ error: "Failed to fetch calendar events" }, { status: 502 });
  }
}
