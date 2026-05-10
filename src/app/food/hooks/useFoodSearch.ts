import { useQuery } from "@tanstack/react-query";
import type { FoodSearchResult } from "@/lib/open-food-facts";

export function useFoodSearch(query: string) {
  return useQuery<FoodSearchResult[]>({
    queryKey: ["food-search", query],
    queryFn: async () => {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}
