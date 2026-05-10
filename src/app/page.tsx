export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { todos, meals, foodItems } from "@/db/schema";
import { isNull, eq } from "drizzle-orm";
import { sortByDueDate } from "@/lib/schemas/todo";
import { sumMacros } from "@/lib/schemas/food";
import type { Todo } from "@/lib/schemas/todo";
import type { Macros } from "@/lib/schemas/food";

async function getUpcomingTodos(): Promise<Todo[]> {
  const open = await db.select().from(todos).where(isNull(todos.completedAt));
  return sortByDueDate(open).slice(0, 3);
}

async function getTodayMacros(): Promise<Macros> {
  const date = new Date().toLocaleDateString("en-CA");
  const todayMeals = await db.select().from(meals).where(eq(meals.date, date));
  const allItems = (
    await Promise.all(todayMeals.map((m) => db.select().from(foodItems).where(eq(foodItems.mealId, m.id))))
  ).flat();
  return sumMacros(allItems);
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

function FoodWidget({ macros }: { macros: Macros }) {
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
}

function PlaceholderWidget({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-400 text-sm">
      {label} widget coming soon
    </div>
  );
}

export default async function DashboardPage() {
  const [upcomingTodos, todayMacros] = await Promise.all([
    getUpcomingTodos(),
    getTodayMacros(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodosWidget items={upcomingTodos} />
        <PlaceholderWidget label="Calendar" />
        <FoodWidget macros={todayMacros} />
        <PlaceholderWidget label="Health" />
      </div>
    </div>
  );
}
