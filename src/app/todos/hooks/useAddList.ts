import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddList(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}
