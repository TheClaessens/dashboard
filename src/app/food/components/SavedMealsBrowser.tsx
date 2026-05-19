"use client";

import { type FC, useState } from "react";
import { useSavedMeals } from "@/app/food/hooks/useSavedMeals";
import { useRelogSavedMeal } from "@/app/food/hooks/useRelogSavedMeal";
import type { SavedMeal, SavedMealItem } from "@/lib/schemas/food";

interface SavedMealsBrowserProps {
  date: string;
}

interface RelogFormProps {
  savedMeal: SavedMeal;
  date: string;
  onDone: () => void;
}

const RelogForm: FC<RelogFormProps> = ({ savedMeal, date, onDone }) => {
  const { mutate, isPending } = useRelogSavedMeal(date);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(savedMeal.items.map((item) => [item.id, item.defaultQuantity]))
  );

  function updateQuantity(id: string, value: number) {
    setQuantities((prev) => ({ ...prev, [id]: value }));
  }

  function scaleItem(item: SavedMealItem, quantity: number) {
    const factor = quantity / item.defaultQuantity;
    return {
      name: item.name,
      quantity,
      calories: Math.round(item.calories * factor * 10) / 10,
      protein: Math.round(item.protein * factor * 10) / 10,
      carbs: Math.round(item.carbs * factor * 10) / 10,
      fat: Math.round(item.fat * factor * 10) / 10,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = savedMeal.items.map((item) => scaleItem(item, quantities[item.id] ?? item.defaultQuantity));
    mutate({ savedMeal, items }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <ul className="space-y-1">
        {savedMeal.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex-1 text-zinc-700 dark:text-zinc-300">{item.name}</span>
            <input
              type="number"
              min={1}
              value={quantities[item.id] ?? item.defaultQuantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="w-20 rounded border border-zinc-300 px-2 py-0.5 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-xs text-zinc-400">g</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Logging…" : "Log meal"}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-zinc-400 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
};

export const SavedMealsBrowser: FC<SavedMealsBrowserProps> = ({ date }) => {
  const { data: savedMeals = [], isLoading } = useSavedMeals();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return null;

  if (savedMeals.length === 0) {
    return (
      <p className="text-sm text-zinc-400">No saved meals yet. Save a meal as a template to reuse it.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Saved meals</h2>
      <ul className="space-y-2">
        {savedMeals.map((meal) => (
          <li key={meal.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{meal.name}</span>
              <button
                onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
                className="text-xs text-blue-600 hover:underline"
              >
                {expanded === meal.id ? "Cancel" : "Use"}
              </button>
            </div>
            {expanded === meal.id && (
              <div className="mt-2">
                <RelogForm savedMeal={meal} date={date} onDone={() => setExpanded(null)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
