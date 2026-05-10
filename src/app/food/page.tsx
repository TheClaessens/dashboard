"use client";

import { useState } from "react";
import { useFoodLog } from "./hooks/useFoodLog";
import { useAddMeal } from "./hooks/useAddMeal";
import { useAddFoodItem } from "./hooks/useAddFoodItem";
import { useFoodSearch } from "./hooks/useFoodSearch";
import { sumMacros, scaleMacros } from "@/lib/schemas/food";
import type { Meal, FoodItem } from "@/lib/schemas/food";
import type { FoodSearchResult } from "@/lib/open-food-facts";

function today() {
  return new Date().toLocaleDateString("en-CA");
}

function MacroRow({ label, value, unit = "g" }: { label: string; value: number; unit?: string }) {
  return (
    <span className="text-sm text-zinc-600 dark:text-zinc-400">
      <span className="font-medium">{label}</span> {Math.round(value * 10) / 10}{unit}
    </span>
  );
}

function MacroSummary({ items }: { items: Pick<FoodItem, "calories" | "protein" | "carbs" | "fat">[] }) {
  const totals = sumMacros(items);
  return (
    <div className="flex flex-wrap gap-4">
      <MacroRow label="Calories" value={totals.calories} unit="kcal" />
      <MacroRow label="Protein" value={totals.protein} />
      <MacroRow label="Carbs" value={totals.carbs} />
      <MacroRow label="Fat" value={totals.fat} />
    </div>
  );
}

function FoodSearchInput({
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
  const [manual, setManual] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });

  const { data: results = [], isFetching } = useFoodSearch(query);
  const { mutate: addItem, isPending } = useAddFoodItem(mealId, date);

  function handleSelectResult(r: FoodSearchResult) {
    setSelected(r);
    setQuery(r.name);
  }

  function handleAdd() {
    if (!selected) return;
    const q = parseFloat(quantity);
    const scaled = scaleMacros(
      { calories: selected.calories, protein: selected.protein, carbs: selected.carbs, fat: selected.fat },
      q
    );
    addItem({ name: selected.name, quantity: q, ...scaled }, { onSuccess: onDone });
  }

  function handleManualAdd() {
    const q = parseFloat(quantity);
    addItem(
      {
        name: manual.name,
        quantity: q,
        calories: parseFloat(manual.calories) || 0,
        protein: parseFloat(manual.protein) || 0,
        carbs: parseFloat(manual.carbs) || 0,
        fat: parseFloat(manual.fat) || 0,
      },
      { onSuccess: onDone }
    );
  }

  if (manualMode) {
    return (
      <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <input
          className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
          placeholder="Food name"
          value={manual.name}
          onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
            <input
              key={field}
              type="number"
              className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={manual[field]}
              onChange={(e) => setManual((m) => ({ ...m, [field]: e.target.value }))}
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
        <div className="flex gap-2">
          <button
            onClick={handleManualAdd}
            disabled={isPending || !manual.name || !quantity}
            className="flex-1 rounded bg-blue-600 text-white text-sm px-3 py-1 disabled:opacity-50"
          >
            Add
          </button>
          <button onClick={() => setManualMode(false)} className="text-sm text-zinc-500 underline">
            Search instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
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
        <ul className="rounded border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-40 overflow-y-auto">
          {results.map((r) => (
            <li key={r.offId}>
              <button
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className="font-medium">{r.name}</span>
                <span className="text-zinc-400 ml-2 text-xs">{r.calories}kcal · {r.protein}g P · {r.carbs}g C · {r.fat}g F per 100g</span>
              </button>
            </li>
          ))}
        </ul>
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
          <span className="text-xs text-zinc-500">g of {selected.name}</span>
          <button
            onClick={handleAdd}
            disabled={isPending || !quantity}
            className="ml-auto rounded bg-blue-600 text-white text-sm px-3 py-1 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <button onClick={() => setManualMode(true)} className="text-xs text-zinc-400 underline">
        Enter manually
      </button>
    </div>
  );
}

function MealCard({ meal, date }: { meal: Meal; date: string }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{meal.name}</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {adding ? "Cancel" : "+ Food item"}
        </button>
      </div>

      {meal.items.length === 0 && !adding && (
        <p className="text-sm text-zinc-400">No food items yet.</p>
      )}

      {meal.items.length > 0 && (
        <ul className="space-y-1">
          {meal.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>{item.name} <span className="text-zinc-400 text-xs">({item.quantity}g)</span></span>
              <span className="text-xs text-zinc-400">{Math.round(item.calories)}kcal</span>
            </li>
          ))}
        </ul>
      )}

      {meal.items.length > 0 && (
        <MacroSummary items={meal.items} />
      )}

      {adding && (
        <FoodSearchInput mealId={meal.id} date={date} onDone={() => setAdding(false)} />
      )}
    </div>
  );
}

function AddMealForm({ date, onDone }: { date: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const { mutate, isPending } = useAddMeal(date);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({ name: name.trim(), date }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm bg-white dark:bg-zinc-900"
        placeholder="Meal name (e.g. Breakfast)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="rounded bg-blue-600 text-white text-sm px-4 py-1.5 disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={onDone} className="text-sm text-zinc-500">
        Cancel
      </button>
    </form>
  );
}

export default function FoodPage() {
  const date = today();
  const { data: meals = [], isLoading } = useFoodLog(date);
  const [addingMeal, setAddingMeal] = useState(false);

  const allItems = meals.flatMap((m) => m.items);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Food</h1>
        <span className="text-sm text-zinc-400">{date}</span>
      </div>

      {allItems.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Today&apos;s totals</h2>
          <MacroSummary items={allItems} />
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && meals.length === 0 && !addingMeal && (
        <p className="text-sm text-zinc-400">No meals logged today.</p>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} date={date} />
          ))}
        </div>
      )}

      {addingMeal ? (
        <AddMealForm date={date} onDone={() => setAddingMeal(false)} />
      ) : (
        <button
          onClick={() => setAddingMeal(true)}
          className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-500 hover:border-zinc-400 w-full"
        >
          + Add meal
        </button>
      )}
    </div>
  );
}
