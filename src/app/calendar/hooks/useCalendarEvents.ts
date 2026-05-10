import { useQuery } from "@tanstack/react-query";
import type { CalendarEvent } from "@/lib/schemas/calendar";

async function fetchCalendarEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  });
  const res = await fetch(`/api/calendar?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export function useCalendarEvents(timeMin: Date, timeMax: Date) {
  return useQuery({
    queryKey: ["calendar", timeMin.toISOString(), timeMax.toISOString()],
    queryFn: () => fetchCalendarEvents(timeMin, timeMax),
  });
}
