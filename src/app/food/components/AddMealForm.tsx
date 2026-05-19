"use client";

import { type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddMeal } from "@/app/food/hooks/useAddMeal";
import { createMealSchema, type CreateMealInput } from "@/lib/schemas/food";

interface AddMealFormProps {
  date: string;
  onDone: () => void;
}

export const AddMealForm: FC<AddMealFormProps> = ({ date, onDone }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateMealInput>({
    resolver: zodResolver(createMealSchema),
    defaultValues: { name: "", date },
  });
  const { mutate, isPending } = useAddMeal(date);

  const onSubmit = (data: CreateMealInput) => mutate(data, { onSuccess: onDone });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <div className="flex-1">
        <input
          {...register("name")}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Meal name (e.g. Breakfast)"
          autoFocus
        />
        {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={onDone} className="text-sm text-zinc-500">
        Cancel
      </button>
    </form>
  );
};
