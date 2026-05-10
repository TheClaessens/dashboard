export function isValidTodoInput(title: unknown): boolean {
  if (typeof title !== "string") return false;
  return title.trim().length > 0;
}

interface TodoWithDueDate { dueDate: string | null; [key: string]: unknown }

export function sortByDueDate<T extends TodoWithDueDate>(todos: T[]): T[] {
  return [...todos].sort((a, b) => {
    if (a.dueDate === null && b.dueDate === null) return 0;
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
