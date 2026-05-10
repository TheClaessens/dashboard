"use client";

import { type FC, useState } from "react";
import { MacroSummary } from "@/app/food/components/MacroSummary";
import { FoodSearchInput } from "@/app/food/components/FoodSearchInput";
import type { Meal } from "@/lib/schemas/food";

interface MealCardProps {
  meal: Meal;
  date: string;
}

export const MealCard: FC<MealCardProps> = ({ meal, date }) => {
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
              <span>
                {item.name} <span className="text-zinc-400 text-xs">({item.quantity}g)</span>
              </span>
              <span className="text-xs text-zinc-400">{Math.round(item.calories)}kcal</span>
            </li>
          ))}
        </ul>
      )}

      {meal.items.length > 0 && <MacroSummary items={meal.items} />}

      {adding && <FoodSearchInput mealId={meal.id} date={date} onDone={() => setAdding(false)} />}
    </div>
  );
};
