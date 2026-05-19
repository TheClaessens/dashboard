import type { Todo } from "@/lib/schemas/todo";

export type TodoGroup = "Today" | "Tomorrow" | "This week" | "Someday" | "Done";

export function deriveTodoGroup(todo: Todo): TodoGroup {
  if (todo.completedAt !== null) return "Done";
  if (!todo.dueDate) return "Someday";

  const today = new Date().toLocaleDateString("en-CA");
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA");
  const weekEnd = new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-CA");

  if (todo.dueDate <= today) return "Today";
  if (todo.dueDate <= tomorrow) return "Tomorrow";
  if (todo.dueDate <= weekEnd) return "This week";
  return "Someday";
}

export function groupTodos(todos: Todo[]): Record<TodoGroup, Todo[]> {
  const groups: Record<TodoGroup, Todo[]> = {
    Today: [], Tomorrow: [], "This week": [], Someday: [], Done: [],
  };
  for (const todo of todos) {
    groups[deriveTodoGroup(todo)].push(todo);
  }
  return groups;
}
