"use client";

import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MacroSummary } from "@/app/food/components/MacroSummary";
import { FoodSearchInput } from "@/app/food/components/FoodSearchInput";
import { useSaveMeal } from "@/app/food/hooks/useSaveMeal";
import { createSavedMealSchema, type CreateSavedMealInput, type Meal } from "@/lib/schemas/food";

interface MealCardProps {
  meal: Meal;
  date: string;
}

interface SaveNameFormProps {
  meal: Meal;
  onDone: () => void;
}

const SaveNameForm: FC<SaveNameFormProps> = ({ meal, onDone }) => {
  const { mutate, isPending } = useSaveMeal();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateSavedMealInput>({
    resolver: zodResolver(createSavedMealSchema),
    defaultValues: { name: meal.name },
  });

  const onSubmit = (data: CreateSavedMealInput) => {
    mutate({ meal, name: data.name }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
      <input
        {...register("name")}
        placeholder="Saved meal name"
        className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onDone} className="text-xs text-zinc-400 hover:underline">
        Cancel
      </button>
    </form>
  );
};

export const MealCard: FC<MealCardProps> = ({ meal, date }) => {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{meal.name}</h3>
        <div className="flex items-center gap-3">
          {meal.items.length > 0 && !saving && (
            <button onClick={() => setSaving(true)} className="text-xs text-zinc-500 hover:underline">
              Save as template
            </button>
          )}
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-xs text-blue-600 hover:underline"
          >
            {adding ? "Cancel" : "+ Food item"}
          </button>
        </div>
      </div>

      {meal.items.length === 0 && !adding && (
        <p className="text-sm text-zinc-400">No food items yet.</p>
      )}

      {meal.items.length > 0 && (
        <ul className="space-y-1">
          {meal.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                {item.name} <span className="text-xs text-zinc-400">({item.quantity}g)</span>
              </span>
              <span className="text-xs text-zinc-400">{Math.round(item.calories)}kcal</span>
            </li>
          ))}
        </ul>
      )}

      {meal.items.length > 0 && <MacroSummary items={meal.items} />}

      {saving && <SaveNameForm meal={meal} onDone={() => setSaving(false)} />}

      {adding && <FoodSearchInput mealId={meal.id} date={date} onDone={() => setAdding(false)} />}
    </div>
  );
};
