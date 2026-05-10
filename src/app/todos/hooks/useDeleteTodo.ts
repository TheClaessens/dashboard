import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/todos/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });
}
