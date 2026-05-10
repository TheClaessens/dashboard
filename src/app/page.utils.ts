import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { isNull } from "drizzle-orm";
import { sortByDueDate } from "@/lib/schemas/todo";
import { getCalendarEvents } from "@/lib/google-calendar";
import { getTodayEvents } from "@/lib/schemas/calendar";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";

export async function getUpcomingTodos(): Promise<Todo[]> {
  const open = await db.select().from(todos).where(isNull(todos.completedAt));
  return sortByDueDate(open).slice(0, 3);
}

export async function getTodayCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const events = await getCalendarEvents(start, end);
    return getTodayEvents(events);
  } catch {
    return [];
  }
}
