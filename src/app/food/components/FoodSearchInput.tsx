"use client";

import { useState } from "react";
import { useAddFoodItem } from "@/app/food/hooks/useAddFoodItem";
import { useFoodSearch } from "@/app/food/hooks/useFoodSearch";
import { scaleMacros } from "@/lib/food";
import type { FoodSearchResult } from "@/lib/open-food-facts";

function ManualEntryForm({ mealId, date, onDone }: { mealId: string; date: string; onDone: () => void }) {
  const [quantity, setQuantity] = useState("100");
  const [fields, setFields] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const { mutate: addItem, isPending } = useAddFoodItem(mealId, date);

  function handleAdd() {
    const q = parseFloat(quantity);
    addItem(
      {
        name: fields.name,
        quantity: q,
        calories: parseFloat(fields.calories) || 0,
        protein: parseFloat(fields.protein) || 0,
        carbs: parseFloat(fields.carbs) || 0,
        fat: parseFloat(fields.fat) || 0,
      },
      { onSuccess: onDone }
    );
  }

  return (
    <div className="space-y-2">
      <input
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
        placeholder="Food name"
        value={fields.name}
        onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-2">
        {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
          <input
            key={field}
            type="number"
            className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={fields[field]}
            onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))}
          />
        ))}
      </div>
      <input
        type="number"
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
        placeholder="Quantity (g)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={isPending || !fields.name || !quantity}
        className="w-full rounded bg-blue-600 text-white text-sm px-3 py-1 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}

function SearchResults({
  results,
  onSelect,
}: {
  results: FoodSearchResult[];
  onSelect: (r: FoodSearchResult) => void;
}) {
  return (
    <ul className="rounded border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-40 overflow-y-auto">
      {results.map((r) => (
        <li key={r.offId}>
          <button
            onClick={() => onSelect(r)}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="font-medium">{r.name}</span>
            <span className="text-zinc-400 ml-2 text-xs">
              {r.calories}kcal · {r.protein}g P · {r.carbs}g C · {r.fat}g F per 100g
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function FoodSearchInput({
  mealId,
  date,
  onDone,
}: {
  mealId: string;
  date: string;
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const { data: results = [], isFetching } = useFoodSearch(query);
  const { mutate: addItem, isPending } = useAddFoodItem(mealId, date);

  function handleAdd() {
    if (!selected) return;
    const q = parseFloat(quantity);
    const scaled = scaleMacros(
      { calories: selected.calories, protein: selected.protein, carbs: selected.carbs, fat: selected.fat },
      q
    );
    addItem({ name: selected.name, quantity: q, ...scaled }, { onSuccess: onDone });
  }

  return (
    <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
      {manualMode ? (
        <>
          <ManualEntryForm mealId={mealId} date={date} onDone={onDone} />
          <button onClick={() => setManualMode(false)} className="text-xs text-zinc-400 underline">
            Search instead
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
              placeholder="Search food..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            />
            {isFetching && <span className="text-xs text-zinc-400 self-center">…</span>}
          </div>

          {results.length > 0 && !selected && (
            <SearchResults results={results} onSelect={(r) => { setSelected(r); setQuery(r.name); }} />
          )}

          {selected && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="w-24 rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
                placeholder="g"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <span className="text-xs text-zinc-500 flex-1">g of {selected.name}</span>
              <button
                onClick={handleAdd}
                disabled={isPending || !quantity}
                className="rounded bg-blue-600 text-white text-sm px-3 py-1 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          <button onClick={() => setManualMode(true)} className="text-xs text-zinc-400 underline">
            Enter manually
          </button>
        </>
      )}
    </div>
  );
}
