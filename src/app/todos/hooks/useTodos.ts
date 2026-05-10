import { useQuery } from "@tanstack/react-query";
import type { Todo } from "@/lib/schemas/todo";

async function fetchTodos(listId: string | null): Promise<Todo[]> {
  const url = listId ? `/api/todos?listId=${listId}` : "/api/todos";
  const res = await fetch(url);
  return res.json();
}

export function useTodos(listId: string | null) {
  return useQuery({
    queryKey: ["todos", listId],
    queryFn: () => fetchTodos(listId),
  });
}
