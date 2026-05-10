import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddTodo(listId: string | null, onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, listId }),
      }),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
