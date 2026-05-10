import { useQuery } from "@tanstack/react-query";
import type { Meal } from "@/lib/schemas/food";

export function useFoodLog(date: string) {
  return useQuery<Meal[]>({
    queryKey: ["food", date],
    queryFn: async () => {
      const res = await fetch(`/api/food?date=${date}`);
      if (!res.ok) throw new Error("Failed to load food log");
      return res.json();
    },
  });
}
