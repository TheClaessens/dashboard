import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Meal } from "@/lib/schemas/food";
import { deriveSavedMealItems } from "@/lib/food";

export function useSaveMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ meal, name }: { meal: Meal; name: string }) => {
      const res = await fetch("/api/saved-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, items: deriveSavedMealItems(meal) }),
      });
      if (!res.ok) throw new Error("Failed to save meal");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-meals"] }),
  });
}
