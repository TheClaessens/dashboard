export const dynamic = "force-dynamic";

import { type FC } from "react";
import Link from "next/link";
import { formatEventTime } from "@/lib/schemas/calendar";
import { getUpcomingTodos, getTodayCalendarEvents, getTodayMacros, getLatestActivity } from "@/app/page.utils";
import { deriveForm } from "@/lib/health";
import type { Todo } from "@/lib/schemas/todo";
import type { CalendarEvent } from "@/lib/schemas/calendar";
import type { Macros } from "@/lib/schemas/food";
import type { Activity } from "@/lib/intervals-icu";

interface TodosWidgetProps {
  items: Todo[];
}

const TodosWidget: FC<TodosWidgetProps> = ({ items }) => (
  <Link href="/todos" className="block rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
    <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Todos</h2>
    {items.length === 0 && <p className="text-sm text-zinc-400">No open todos.</p>}
    {items.length > 0 && (
      <ul className="space-y-1">
        {items.map((todo) => (
          <li key={todo.id} className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
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
  <Link href="/calendar" className="block rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
    <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Today</h2>
    {events.length === 0 && <p className="text-sm text-zinc-400">Nothing scheduled today.</p>}
    {events.length > 0 && (
      <ul className="space-y-1">
        {events.map((event) => (
          <li key={event.id} className="flex justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="truncate">{event.summary}</span>
            <span className="shrink-0 text-xs text-zinc-400">{formatEventTime(event)}</span>
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
    <Link href="/food" className="block rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Food</h2>
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

interface HealthWidgetProps {
  activity: Activity | null;
}

const HealthWidget: FC<HealthWidgetProps> = ({ activity }) => (
  <Link href="/health" className="block rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
    <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Health</h2>
    {!activity && <p className="text-sm text-zinc-400">No training data.</p>}
    {activity && (
      <div className="flex gap-4">
        <div>
          <p className="text-xs text-zinc-400">Fitness</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{Math.round(activity.ctl)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Fatigue</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{Math.round(activity.atl)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Form</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{Math.round(deriveForm(activity.ctl, activity.atl))}</p>
        </div>
      </div>
    )}
  </Link>
);

export default async function DashboardPage() {
  const [upcomingTodos, todayEvents, todayMacros, latestActivity] = await Promise.all([
    getUpcomingTodos(),
    getTodayCalendarEvents(),
    getTodayMacros(),
    getLatestActivity(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodosWidget items={upcomingTodos} />
        <CalendarWidget events={todayEvents} />
        <FoodWidget macros={todayMacros} />
        <HealthWidget activity={latestActivity} />
      </div>
    </div>
  );
}
