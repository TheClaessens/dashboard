"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Todo, List } from "@/lib/schemas/todo";

async function fetchTodos(listId: string | null): Promise<Todo[]> {
  const url = listId ? `/api/todos?listId=${listId}` : "/api/todos";
  const res = await fetch(url);
  return res.json();
}

async function fetchLists(): Promise<List[]> {
  const res = await fetch("/api/lists");
  return res.json();
}

function LoadingState() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return <p className="text-sm text-zinc-400">No todos yet. Add one above.</p>;
}

export default function TodosPage() {
  const queryClient = useQueryClient();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newListName, setNewListName] = useState("");

  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["todos", selectedListId],
    queryFn: () => fetchTodos(selectedListId),
  });

  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: fetchLists,
  });

  const addTodo = useMutation({
    mutationFn: (title: string) =>
      fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, listId: selectedListId }),
      }),
    onSuccess: () => {
      setNewTitle("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const toggleTodo = useMutation({
    mutationFn: (todo: Todo) =>
      fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: todo.completedAt ? null : new Date().toISOString(),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteTodo = useMutation({
    mutationFn: (id: string) => fetch(`/api/todos/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const addList = useMutation({
    mutationFn: (name: string) =>
      fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      setNewListName("");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Todos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={!selectedListId ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedListId(null)}
        >
          All
        </Badge>
        {lists.map((list) => (
          <Badge
            key={list.id}
            variant={selectedListId === list.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedListId(list.id)}
          >
            {list.name}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newTitle.trim() && addTodo.mutate(newTitle)}
          placeholder="New todo…"
        />
        <Button
          onClick={() => newTitle.trim() && addTodo.mutate(newTitle)}
          disabled={addTodo.isPending}
        >
          Add
        </Button>
      </div>

      {todosLoading && <LoadingState />}

      {!todosLoading && todos.length === 0 && <EmptyState />}

      {!todosLoading && todos.length > 0 && (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
            >
              <Checkbox
                checked={!!todo.completedAt}
                onCheckedChange={() => toggleTodo.mutate(todo)}
              />
              <span
                className={`flex-1 text-sm ${todo.completedAt ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"}`}
              >
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="text-xs text-zinc-400">{todo.dueDate}</span>
              )}
              <button
                onClick={() => deleteTodo.mutate(todo.id)}
                className="text-zinc-300 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-2">
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newListName.trim() && addList.mutate(newListName)}
          placeholder="New list…"
        />
        <Button
          variant="outline"
          onClick={() => newListName.trim() && addList.mutate(newListName)}
          disabled={addList.isPending}
        >
          Add list
        </Button>
      </div>
    </div>
  );
}
