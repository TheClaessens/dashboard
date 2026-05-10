"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTodos } from "./hooks/useTodos";
import { useLists } from "./hooks/useLists";
import { useAddTodo } from "./hooks/useAddTodo";
import { useAddList } from "./hooks/useAddList";
import { useToggleTodo } from "./hooks/useToggleTodo";
import { useDeleteTodo } from "./hooks/useDeleteTodo";
import type { Todo } from "@/lib/schemas/todo";

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

function TodoItem({ todo }: { todo: Todo }) {
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  return (
    <li className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
      <Checkbox
        checked={!!todo.completedAt}
        onCheckedChange={() => toggleTodo.mutate(todo)}
      />
      <span className={`flex-1 text-sm ${todo.completedAt ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"}`}>
        {todo.title}
      </span>
      {todo.dueDate && <span className="text-xs text-zinc-400">{todo.dueDate}</span>}
      <button
        onClick={() => deleteTodo.mutate(todo.id)}
        className="text-zinc-300 hover:text-red-400 text-xs"
      >
        ✕
      </button>
    </li>
  );
}

export default function TodosPage() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newListName, setNewListName] = useState("");

  const { data: todos = [], isLoading: todosLoading } = useTodos(selectedListId);
  const { data: lists = [] } = useLists();
  const addTodo = useAddTodo(selectedListId, () => setNewTitle(""));
  const addList = useAddList(() => setNewListName(""));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Todos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant={!selectedListId ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedListId(null)}>
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
        <Button onClick={() => newTitle.trim() && addTodo.mutate(newTitle)} disabled={addTodo.isPending}>
          Add
        </Button>
      </div>

      {todosLoading && <LoadingState />}
      {!todosLoading && todos.length === 0 && <EmptyState />}
      {!todosLoading && todos.length > 0 && (
        <ul className="space-y-2">
          {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
        </ul>
      )}

      <div className="mt-8 flex gap-2">
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newListName.trim() && addList.mutate(newListName)}
          placeholder="New list…"
        />
        <Button variant="outline" onClick={() => newListName.trim() && addList.mutate(newListName)} disabled={addList.isPending}>
          Add list
        </Button>
      </div>
    </div>
  );
}
