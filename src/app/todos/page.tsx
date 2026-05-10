"use client";

import { useEffect, useState } from "react";
import type { Todo, List } from "@/db/schema";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newListName, setNewListName] = useState("");

  async function load() {
    const url = selectedListId ? `/api/todos?listId=${selectedListId}` : "/api/todos";
    const [todosRes, listsRes] = await Promise.all([fetch(url), fetch("/api/lists")]);
    setTodos(await todosRes.json());
    setLists(await listsRes.json());
  }

  useEffect(() => { load(); }, [selectedListId]);

  async function addTodo() {
    if (!newTitle.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, listId: selectedListId }),
    });
    setNewTitle("");
    load();
  }

  async function toggleTodo(todo: Todo) {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: todo.status === "open" ? "done" : "open" }),
    });
    load();
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    load();
  }

  async function addList() {
    if (!newListName.trim()) return;
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newListName }),
    });
    setNewListName("");
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Todos</h1>

      {/* List filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedListId(null)}
          className={`rounded-full px-3 py-1 text-sm ${!selectedListId ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}
        >
          All
        </button>
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setSelectedListId(list.id)}
            className={`rounded-full px-3 py-1 text-sm ${selectedListId === list.id ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}
          >
            {list.name}
          </button>
        ))}
      </div>

      {/* Add todo */}
      <div className="flex gap-2 mb-6">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="New todo…"
          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        />
        <button
          onClick={addTodo}
          className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium"
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      {todos.length === 0 ? (
        <p className="text-sm text-zinc-400">No todos yet.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
              <input
                type="checkbox"
                checked={todo.status === "done"}
                onChange={() => toggleTodo(todo)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className={`flex-1 text-sm ${todo.status === "done" ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="text-xs text-zinc-400">{todo.dueDate}</span>
              )}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-zinc-300 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add list */}
      <div className="mt-8 flex gap-2">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addList()}
          placeholder="New list…"
          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        />
        <button
          onClick={addList}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Add list
        </button>
      </div>
    </div>
  );
}
