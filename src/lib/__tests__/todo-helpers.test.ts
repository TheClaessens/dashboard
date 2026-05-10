import { describe, it, expect } from "vitest";
import { isValidTodoInput, sortByDueDate } from "@/lib/todo-helpers";

describe("isValidTodoInput", () => {
  it("accepts a non-empty title", () => {
    expect(isValidTodoInput("Buy groceries")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidTodoInput("")).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(isValidTodoInput("   ")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidTodoInput(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidTodoInput(undefined)).toBe(false);
  });
});

describe("sortByDueDate", () => {
  const make = (id: number, dueDate: string | null) => ({
    id,
    title: `Todo ${id}`,
    status: "open" as const,
    dueDate,
    listId: null,
  });

  it("sorts ascending by due date", () => {
    const todos = [make(1, "2026-05-20"), make(2, "2026-05-10"), make(3, "2026-05-15")];
    const sorted = sortByDueDate(todos);
    expect(sorted.map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it("places nulls after dated todos", () => {
    const todos = [make(1, null), make(2, "2026-05-10"), make(3, null)];
    const sorted = sortByDueDate(todos);
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].dueDate).toBeNull();
    expect(sorted[2].dueDate).toBeNull();
  });

  it("returns empty array unchanged", () => {
    expect(sortByDueDate([])).toEqual([]);
  });
});
