export const dynamic = "force-dynamic";

import { type FC } from "react";
import Link from "next/link";
import { formatEventTime } from "@/lib/schemas/calendar";
import { getUpcomingTodos, getTodayCalendarEvents, getTodayMacros } from "@/app/page.utils";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";
import type { Macros } from "@/lib/schemas/food";

interface TodosWidgetProps {
  items: Todo[];
}

const TodosWidget: FC<TodosWidgetProps> = ({ items }) => (
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

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const CalendarWidget: FC<CalendarWidgetProps> = ({ events }) => (
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

interface FoodWidgetProps {
  macros: Macros;
}

const FoodWidget: FC<FoodWidgetProps> = ({ macros }) => {
  const hasData = macros.calories > 0;
  return (
    <Link href="/food" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Food</h2>
      {!hasData && <p className="text-sm text-zinc-400">Nothing logged today.</p>}
      {hasData && (
        <div className="space-y-1">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">{Math.round(macros.calories)}</span> kcal
          </p>
          <div className="flex gap-3 text-xs text-zinc-400">
            <span>P {Math.round(macros.protein)}g</span>
            <span>C {Math.round(macros.carbs)}g</span>
            <span>F {Math.round(macros.fat)}g</span>
          </div>
        </div>
      )}
    </Link>
  );
};

interface PlaceholderWidgetProps {
  label: string;
}

const PlaceholderWidget: FC<PlaceholderWidgetProps> = ({ label }) => (
  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-400 text-sm">
    {label} widget coming soon
  </div>
);

export default async function DashboardPage() {
  const [upcomingTodos, todayEvents, todayMacros] = await Promise.all([
    getUpcomingTodos(),
    getTodayCalendarEvents(),
    getTodayMacros(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodosWidget items={upcomingTodos} />
        <CalendarWidget events={todayEvents} />
        <FoodWidget macros={todayMacros} />
        <PlaceholderWidget label="Health" />
      </div>
    </div>
  );
}
