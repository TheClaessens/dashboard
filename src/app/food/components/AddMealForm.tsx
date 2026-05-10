"use client";

import { useState } from "react";
import { useAddMeal } from "@/app/food/hooks/useAddMeal";

export function AddMealForm({ date, onDone }: { date: string; onDone: () => void }) {
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
