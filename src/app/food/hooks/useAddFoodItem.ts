import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddFoodItemInput } from "@/lib/schemas/food";

export function useAddFoodItem(mealId: string, date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddFoodItemInput) => {
      const res = await fetch(`/api/meals/${mealId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add food item");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food", date] }),
  });
}
