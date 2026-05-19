"use client";

import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddFoodItem } from "@/app/food/hooks/useAddFoodItem";
import { useFoodSearch } from "@/app/food/hooks/useFoodSearch";
import { scaleMacros } from "@/lib/food";
import { addFoodItemSchema, quantitySchema, type AddFoodItemInput } from "@/lib/schemas/food";
import type { FoodSearchResult } from "@/lib/open-food-facts";

interface FoodSearchInputProps {
  mealId: string;
  date: string;
  onDone: () => void;
}

interface ManualEntryFormProps {
  mealId: string;
  date: string;
  onDone: () => void;
  onBack: () => void;
}

const ManualEntryForm: FC<ManualEntryFormProps> = ({ mealId, date, onDone, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AddFoodItemInput>({
    resolver: zodResolver(addFoodItemSchema),
  });
  const { mutate: addItem, isPending } = useAddFoodItem(mealId, date);

  const onSubmit = (data: AddFoodItemInput) => addItem(data, { onSuccess: onDone });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <input
          {...register("name")}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="Food name"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
          <div key={field}>
            <input
              {...register(field, { valueAsNumber: true })}
              type="number"
              className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            />
            {errors[field] && <p className="text-xs text-red-500">{errors[field]?.message}</p>}
          </div>
        ))}
      </div>
      <div>
        <input
          {...register("quantity", { valueAsNumber: true })}
          type="number"
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="Quantity (g)"
        />
        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Add
        </button>
        <button type="button" onClick={onBack} className="text-sm text-zinc-500 underline">
          Search instead
        </button>
      </div>
    </form>
  );
};

interface SearchResultsProps {
  results: FoodSearchResult[];
  onSelect: (r: FoodSearchResult) => void;
}

const SearchResults: FC<SearchResultsProps> = ({ results, onSelect }) => (
  <ul className="max-h-40 divide-y divide-zinc-100 overflow-y-auto rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700">
    {results.map((r) => (
      <li key={r.offId}>
        <button
          onClick={() => onSelect(r)}
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">{r.name}</span>
          <span className="ml-2 text-xs text-zinc-400">
            {r.calories}kcal · {r.protein}g P · {r.carbs}g C · {r.fat}g F per 100g
          </span>
        </button>
      </li>
    ))}
  </ul>
);

interface QuantityFormProps {
  selected: FoodSearchResult;
  mealId: string;
  date: string;
  onDone: () => void;
}

const QuantityForm: FC<QuantityFormProps> = ({ selected, mealId, date, onDone }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(quantitySchema),
    defaultValues: { quantity: 100 },
  });
  const { mutate: addItem, isPending } = useAddFoodItem(mealId, date);

  const onSubmit = ({ quantity }: { quantity: number }) => {
    const scaled = scaleMacros(
      { calories: selected.calories, protein: selected.protein, carbs: selected.carbs, fat: selected.fat },
      quantity
    );
    addItem({ name: selected.name, quantity, ...scaled }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
      <div>
        <input
          {...register("quantity", { valueAsNumber: true })}
          type="number"
          className="w-24 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          placeholder="g"
        />
        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
      </div>
      <span className="flex-1 self-center text-xs text-zinc-500">g of {selected.name}</span>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
};

export const FoodSearchInput: FC<FoodSearchInputProps> = ({ mealId, date, onDone }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const { data: results = [], isFetching } = useFoodSearch(query);

  return (
    <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      {manualMode && (
        <ManualEntryForm mealId={mealId} date={date} onDone={onDone} onBack={() => setManualMode(false)} />
      )}

      {!manualMode && (
        <>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Search food..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            />
            {isFetching && <span className="self-center text-xs text-zinc-400">…</span>}
          </div>

          {results.length > 0 && !selected && (
            <SearchResults results={results} onSelect={(r) => { setSelected(r); setQuery(r.name); }} />
          )}

          {selected && <QuantityForm selected={selected} mealId={mealId} date={date} onDone={onDone} />}

          <button onClick={() => setManualMode(true)} className="text-xs text-zinc-400 underline">
            Enter manually
          </button>
        </>
      )}
    </div>
  );
};
