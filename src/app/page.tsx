export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sortByDueDate } from "@/lib/todo-helpers";
import type { Todo } from "@/db/schema";

async function getUpcomingTodos(): Promise<Todo[]> {
  const open = await db.select().from(todos).where(eq(todos.status, "open"));
  return sortByDueDate(open).slice(0, 3);
}

function TodosWidget({ items }: { items: Todo[] }) {
  return (
    <Link href="/todos" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Todos</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">No open todos.</p>
      ) : (
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

function PlaceholderWidget({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-400 text-sm">
      {label} widget coming soon
    </div>
  );
}

export default async function DashboardPage() {
  const upcomingTodos = await getUpcomingTodos();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodosWidget items={upcomingTodos} />
        <PlaceholderWidget label="Calendar" />
        <PlaceholderWidget label="Food" />
        <PlaceholderWidget label="Health" />
      </div>
    </div>
  );
}
