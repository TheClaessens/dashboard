import { useQuery } from "@tanstack/react-query";
import type { List } from "@/lib/schemas/todo";

async function fetchLists(): Promise<List[]> {
  const res = await fetch("/api/lists");
  return res.json();
}

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: fetchLists,
  });
}
