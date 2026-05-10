import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  listId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
});

export const updateTodoSchema = z.object({
  completedAt: z.string().datetime().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  listId: z.string().uuid().nullable().optional(),
});

export const createListSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;

export type Todo = {
  id: string;
  title: string;
  dueDate: string | null;
  completedAt: Date | null;
  listId: string | null;
  createdAt: Date;
};

export type List = {
  id: string;
  name: string;
  createdAt: Date;
};

type TodoWithDueDate = Pick<Todo, "dueDate" | "completedAt"> & { id: string; [key: string]: unknown };

export function sortByDueDate<T extends TodoWithDueDate>(todos: T[]): T[] {
  return [...todos].sort((a, b) => {
    if (a.dueDate === null && b.dueDate === null) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
