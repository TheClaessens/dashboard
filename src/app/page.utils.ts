import { db } from "@/lib/db";
import { todos, meals, foodItems } from "@/db/schema";
import { isNull, eq } from "drizzle-orm";
import { sortByDueDate } from "@/lib/schemas/todo";
import { getCalendarEvents } from "@/lib/google-calendar";
import { getTodayEvents } from "@/lib/schemas/calendar";
import { sumMacros } from "@/lib/food";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";
import type { Macros } from "@/lib/schemas/food";

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

export async function getTodayMacros(): Promise<Macros> {
  const date = new Date().toLocaleDateString("en-CA");
  const todayMeals = await db.select().from(meals).where(eq(meals.date, date));
  const allItems = (
    await Promise.all(todayMeals.map((m) => db.select().from(foodItems).where(eq(foodItems.mealId, m.id))))
  ).flat();
  return sumMacros(allItems);
}
