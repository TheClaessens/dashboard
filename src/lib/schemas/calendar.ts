import { z } from "zod";

const eventDateSchema = z.union([
  z.object({ dateTime: z.string() }),
  z.object({ date: z.string() }),
]);

export const calendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional().default("(No title)"),
  start: eventDateSchema,
  end: eventDateSchema,
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;

function getEventDate(d: CalendarEvent["start"]): string {
  return "dateTime" in d ? d.dateTime.slice(0, 10) : d.date;
}

function isAllDay(event: CalendarEvent): boolean {
  return "date" in event.start;
}

export function getTodayEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  return events.filter((e) => getEventDate(e.start) === today);
}

export function getWeekEvents(events: CalendarEvent[], weekStart: Date): CalendarEvent[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return events.filter((e) => {
    const d = new Date(getEventDate(e.start));
    return d >= weekStart && d < weekEnd;
  });
}

export function formatEventTime(event: CalendarEvent): string {
  if (isAllDay(event)) return "All day";
  const start = "dateTime" in event.start ? new Date(event.start.dateTime) : null;
  const end = "dateTime" in event.end ? new Date(event.end.dateTime) : null;
  if (!start || !end) return "All day";
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}
