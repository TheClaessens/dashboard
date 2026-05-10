export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { isNull } from "drizzle-orm";
import { sortByDueDate } from "@/lib/schemas/todo";
import { getCalendarEvents } from "@/lib/google-calendar";
import { getTodayEvents, formatEventTime } from "@/lib/schemas/calendar";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";

async function getUpcomingTodos(): Promise<Todo[]> {
  const open = await db.select().from(todos).where(isNull(todos.completedAt));
  return sortByDueDate(open).slice(0, 3);
}

async function getTodayCalendarEvents(): Promise<CalendarEvent[]> {
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

function TodosWidget({ items }: { items: Todo[] }) {
  return (
    <Link href="/todos" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Todos</h2>
      {items.length === 0 && <p className="text-sm text-zinc-400">No open todos.</p>}
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((todo) => (
            <li key={todo.id} className="text-sm text-zinc-600 dark:text-zinc-400 flex justify-between">
              <span>{todo.title}</span>
              {todo.dueDate && <span className="text-xs text-zinc-400">{todo.dueDate}</span>}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

function CalendarWidget({ events }: { events: CalendarEvent[] }) {
  return (
    <Link href="/calendar" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Today</h2>
      {events.length === 0 && <p className="text-sm text-zinc-400">Nothing scheduled today.</p>}
      {events.length > 0 && (
        <ul className="space-y-1">
          {events.map((event) => (
            <li key={event.id} className="text-sm text-zinc-600 dark:text-zinc-400 flex justify-between gap-2">
              <span className="truncate">{event.summary}</span>
              <span className="text-xs text-zinc-400 shrink-0">{formatEventTime(event)}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

function PlaceholderWidget({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-400 text-sm">
      {label} widget coming soon
    </div>
  );
}

export default async function DashboardPage() {
  const [upcomingTodos, todayEvents] = await Promise.all([
    getUpcomingTodos(),
    getTodayCalendarEvents(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodosWidget items={upcomingTodos} />
        <CalendarWidget events={todayEvents} />
        <PlaceholderWidget label="Food" />
        <PlaceholderWidget label="Health" />
      </div>
    </div>
  );
}
