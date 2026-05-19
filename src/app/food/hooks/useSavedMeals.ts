import { useQuery } from "@tanstack/react-query";
import type { SavedMeal } from "@/lib/schemas/food";

export function useSavedMeals() {
  return useQuery<SavedMeal[]>({
    queryKey: ["saved-meals"],
    queryFn: async () => {
      const res = await fetch("/api/saved-meals");
      if (!res.ok) throw new Error("Failed to load saved meals");
      return res.json();
    },
  });
}
