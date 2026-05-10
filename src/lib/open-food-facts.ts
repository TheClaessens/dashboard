export type FoodSearchResult = {
  offId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    search_terms: query,
    action: "process",
    json: "1",
    fields: "code,product_name,nutriments",
    page_size: "10",
  });
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
    headers: { "User-Agent": "PersonalDashboard/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Open Food Facts API error: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new Error(`Open Food Facts returned unexpected content type: ${contentType}`);
  }

  const data = await res.json();
  const products: unknown[] = data.products ?? [];
  return products
    .filter(
      (p): p is { code: string; product_name: string; nutriments: Record<string, number> } =>
        typeof p === "object" &&
        p !== null &&
        "product_name" in p &&
        typeof (p as Record<string, unknown>).product_name === "string" &&
        (p as Record<string, unknown>).product_name !== "" &&
        "nutriments" in p
    )
    .map((p) => ({
      offId: p.code,
      name: p.product_name,
      calories: p.nutriments["energy-kcal_100g"] ?? 0,
      protein: p.nutriments["proteins_100g"] ?? 0,
      carbs: p.nutriments["carbohydrates_100g"] ?? 0,
      fat: p.nutriments["fat_100g"] ?? 0,
    }));
}
