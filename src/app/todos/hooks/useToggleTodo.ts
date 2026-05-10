import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Todo } from "@/lib/schemas/todo";

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
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
}
