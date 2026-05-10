"use client";

import { type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddTodo } from "@/app/todos/hooks/useAddTodo";
import { createTodoSchema, type CreateTodoInput } from "@/lib/schemas/todo";

interface AddTodoFormProps {
  selectedListId: string | null;
}

export const AddTodoForm: FC<AddTodoFormProps> = ({ selectedListId }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: { title: "", listId: selectedListId ?? undefined },
  });
  const { mutate, isPending } = useAddTodo(selectedListId);

  const onSubmit = (data: CreateTodoInput) => mutate(data.title, { onSuccess: () => reset() });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-6">
      <div className="flex-1">
        <Input {...register("title")} placeholder="New todo…" />
        {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title.message}</p>}
      </div>
      <Button type="submit" disabled={isPending}>Add</Button>
    </form>
  );
};
