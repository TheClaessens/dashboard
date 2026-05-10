import { describe, it, expect } from "vitest";
import { createTodoSchema, sortByDueDate } from "@/lib/schemas/todo";

describe("createTodoSchema", () => {
  it("accepts a valid title", () => {
    const result = createTodoSchema.safeParse({ title: "Buy groceries" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createTodoSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = createTodoSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts optional listId and dueDate", () => {
    const result = createTodoSchema.safeParse({
      title: "Task",
      listId: "550e8400-e29b-41d4-a716-446655440000",
      dueDate: "2026-05-20",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null listId (no list selected)", () => {
    const result = createTodoSchema.safeParse({ title: "Task", listId: null });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from title", () => {
    const result = createTodoSchema.safeParse({ title: "  Buy milk  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Buy milk");
  });
});

describe("sortByDueDate", () => {
  const make = (id: number, dueDate: string | null) => ({
    id: String(id),
    title: `Todo ${id}`,
    dueDate,
    completedAt: null,
    listId: null,
    createdAt: new Date(),
  });

  it("sorts ascending by due date", () => {
    const todos = [make(1, "2026-05-20"), make(2, "2026-05-10"), make(3, "2026-05-15")];
    expect(sortByDueDate(todos).map((t) => t.id)).toEqual(["2", "3", "1"]);
  });

  it("places nulls after dated todos", () => {
    const todos = [make(1, null), make(2, "2026-05-10"), make(3, null)];
    const sorted = sortByDueDate(todos);
    expect(sorted[0].id).toBe("2");
    expect(sorted[1].dueDate).toBeNull();
    expect(sorted[2].dueDate).toBeNull();
  });

  it("returns empty array unchanged", () => {
    expect(sortByDueDate([])).toEqual([]);
  });
});
