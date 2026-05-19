import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SavedMeal } from "@/lib/schemas/food";

interface RelogItem {
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useRelogSavedMeal(date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ savedMeal, items }: { savedMeal: SavedMeal; items: RelogItem[] }) => {
      const res = await fetch(`/api/saved-meals/${savedMeal.id}/relog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, items }),
      });
      if (!res.ok) throw new Error("Failed to relog saved meal");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["food", date] }),
  });
}
