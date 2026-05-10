"use client";

import { type FC, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTodos } from "@/app/todos/hooks/useTodos";
import { useLists } from "@/app/todos/hooks/useLists";
import { useToggleTodo } from "@/app/todos/hooks/useToggleTodo";
import { useDeleteTodo } from "@/app/todos/hooks/useDeleteTodo";
import { AddTodoForm } from "@/app/todos/components/AddTodoForm";
import { AddListForm } from "@/app/todos/components/AddListForm";
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

interface TodoItemProps {
  todo: Todo;
}

const TodoItem: FC<TodoItemProps> = ({ todo }) => {
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
};

export default function TodosPage() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { data: todos = [], isLoading: todosLoading } = useTodos(selectedListId);
  const { data: lists = [] } = useLists();

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

      <AddTodoForm selectedListId={selectedListId} />

      {todosLoading && <LoadingState />}
      {!todosLoading && todos.length === 0 && <EmptyState />}
      {!todosLoading && todos.length > 0 && (
        <ul className="space-y-2">
          {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
        </ul>
      )}

      <div className="mt-8">
        <AddListForm />
      </div>
    </div>
  );
}
