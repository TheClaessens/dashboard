import type { CalendarEvent } from "@/lib/schemas/calendar";

export function deriveWeekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7; // Sunday=0 → 7, keeps Mon-first convention
  d.setDate(d.getDate() - dayOfWeek + 1);
  return d;
}

export function deriveWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function eventStartDate(event: CalendarEvent): string {
  if ("date" in event.start) return event.start.date;
  return new Date(event.start.dateTime).toLocaleDateString("en-CA");
}
