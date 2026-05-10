import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchFoods } from "@/lib/open-food-facts";

const mockProduct = {
  code: "abc123",
  product_name: "Chicken Breast",
  nutriments: {
    "energy-kcal_100g": 165,
    proteins_100g: 31,
    carbohydrates_100g: 0,
    fat_100g: 3.6,
  },
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("searchFoods", () => {
  it("returns parsed food results from OFF API response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ products: [mockProduct] }),
    } as unknown as Response);

    const results = await searchFoods("chicken");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      name: "Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    });
  });

  it("returns empty array when no products found", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ products: [] }),
    } as unknown as Response);

    const results = await searchFoods("xyz_nonexistent");
    expect(results).toEqual([]);
  });
});
