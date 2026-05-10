"use client";

import { useState } from "react";
import { useFoodLog } from "@/app/food/hooks/useFoodLog";
import { MacroSummary } from "@/app/food/components/MacroSummary";
import { MealCard } from "@/app/food/components/MealCard";
import { AddMealForm } from "@/app/food/components/AddMealForm";

function today() {
  return new Date().toLocaleDateString("en-CA");
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
