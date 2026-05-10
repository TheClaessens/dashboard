"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddList } from "@/app/todos/hooks/useAddList";
import { createListSchema, type CreateListInput } from "@/lib/schemas/todo";

export const AddListForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateListInput>({
    resolver: zodResolver(createListSchema),
    defaultValues: { name: "" },
  });
  const { mutate, isPending } = useAddList();

  const onSubmit = (data: CreateListInput) => mutate(data.name, { onSuccess: () => reset() });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <div className="flex-1">
        <Input {...register("name")} placeholder="New list…" />
        {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={isPending}>Add list</Button>
    </form>
  );
};
