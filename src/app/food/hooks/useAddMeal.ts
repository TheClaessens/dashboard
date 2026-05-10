import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateMealInput } from "@/lib/schemas/food";

export function useAddMeal(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMealInput) => {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create meal");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food", date] }),
  });
}
