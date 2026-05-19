"use client";

import { type FC, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/widget";
import { useTodos } from "@/app/todos/hooks/useTodos";
import { useLists } from "@/app/todos/hooks/useLists";
import { useToggleTodo } from "@/app/todos/hooks/useToggleTodo";
import { useAddTodo } from "@/app/todos/hooks/useAddTodo";
import { groupTodos, type TodoGroup } from "@/lib/todo";
import type { Todo, List } from "@/lib/schemas/todo";

const LIST_COLORS: Record<string, string> = {
  Work:     "var(--m-calendar)",
  Personal: "var(--m-food)",
  Reading:  "var(--m-todos)",
  Health:   "var(--m-health)",
};

function deriveListColor(name: string): string {
  return LIST_COLORS[name] ?? "var(--m-todos)";
}

// ── TodoRow ───────────────────────────────────────────────────

interface TodoRowProps {
  todo: Todo;
  lists: List[];
  divider: boolean;
}

const TodoRow: FC<TodoRowProps> = ({ todo, lists, divider }) => {
  const toggleTodo = useToggleTodo();
  const isDone = todo.completedAt !== null;
  const listName = lists.find((l) => l.id === todo.listId)?.name;

  return (
    <li
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderBottom: divider ? "1px solid var(--border)" : "none",
        transition: "background 120ms ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--card-2)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <button
        onClick={() => toggleTodo.mutate(todo)}
        style={{
          width: 20, height: 20, borderRadius: 999, flexShrink: 0,
          border: `1.5px solid ${isDone ? "var(--m-food)" : "var(--border-strong)"}`,
          background: isDone ? "var(--m-food)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {isDone && <Icon name="check" size={12} color="var(--background)" strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          color: isDone ? "var(--muted-foreground)" : "var(--foreground)",
          textDecoration: isDone ? "line-through" : "none",
          textDecorationColor: "var(--subtle-foreground)",
        }}>{todo.title}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 2, fontSize: 11, color: "var(--subtle-foreground)" }}>
          {listName && <span style={{ color: deriveListColor(listName) }}># {listName}</span>}
          {todo.dueDate && <span>· {todo.dueDate}</span>}
        </div>
      </div>
    </li>
  );
};

// ── AddTodoInline ─────────────────────────────────────────────

interface AddTodoInlineProps {
  selectedListId: string | null;
}

const AddTodoInline: FC<AddTodoInlineProps> = ({ selectedListId }) => {
  const [draft, setDraft] = useState("");
  const addTodo = useAddTodo(selectedListId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    addTodo.mutate(draft);
    setDraft("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 14, marginBottom: 14, transition: "border-color 160ms ease",
      }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--m-todos-bd)"; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
    >
      <span style={{ width: 18, height: 18, borderRadius: 999, border: "1.5px dashed var(--border-strong)", flexShrink: 0 }} />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a todo…"
        style={{ flex: 1, background: "transparent", border: 0, outline: 0, fontSize: 14, color: "var(--foreground)" }}
      />
      <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--card-2)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>↵</kbd>
    </form>
  );
};

const GROUP_ORDER: TodoGroup[] = ["Today", "Tomorrow", "This week", "Someday", "Done"];

// ── Page ──────────────────────────────────────────────────────

export default function TodosPage() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const { data: allTodos = [], isLoading } = useTodos(selectedListId);
  const { data: lists = [] } = useLists();

  const open = allTodos.filter((t) => t.completedAt === null);
  const done = allTodos.filter((t) => t.completedAt !== null);
  const visible = showDone ? done : open;
  const groups = groupTodos(visible);

  return (
    <div>
      <PageHeader
        title="Todos"
        icon="todos"
        color="var(--m-todos)"
        subtitle={`${open.length} open · ${done.length} done`}
        actions={
          <>
            <div style={{ display: "flex", background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 999, padding: 2 }}>
              <button
                onClick={() => setShowDone(false)}
                style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: !showDone ? "var(--m-todos)" : "transparent",
                  color: !showDone ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >Open</button>
              <button
                onClick={() => setShowDone(true)}
                style={{
                  padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: showDone ? "var(--m-todos)" : "transparent",
                  color: showDone ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >Done</button>
            </div>
          </>
        }
      />

      <div className="split-2col">
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18,
          padding: 8, position: "sticky", top: 16,
        }}>
          <button
            onClick={() => setSelectedListId(null)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: selectedListId === null ? "var(--card-2)" : "transparent",
              color: selectedListId === null ? "var(--foreground)" : "var(--muted-foreground)",
              textAlign: "left", cursor: "pointer",
            }}
          >
            <span className="dot" style={{ background: "var(--m-todos)" }} />
            <span style={{ flex: 1 }}>All</span>
            <span style={{ fontSize: 11, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>{allTodos.length}</span>
          </button>
          {lists.map((list: List) => {
            const color = deriveListColor(list.name);
            const count = allTodos.filter((t) => t.listId === list.id).length;
            return (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                  background: selectedListId === list.id ? "var(--card-2)" : "transparent",
                  color: selectedListId === list.id ? "var(--foreground)" : "var(--muted-foreground)",
                  textAlign: "left", cursor: "pointer",
                }}
              >
                <span className="dot" style={{ background: color }} />
                <span style={{ flex: 1 }}>{list.name}</span>
                <span style={{ fontSize: 11, color: "var(--subtle-foreground)", fontFamily: "var(--font-mono, ui-monospace)" }}>{count}</span>
              </button>
            );
          })}
          <div style={{ borderTop: "1px solid var(--border)", margin: "8px 4px" }} />
        </div>

        <div>
          <AddTodoInline selectedListId={selectedListId} />

          {isLoading && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, height: 120, animation: "pulse 1.5s infinite" }} />
          )}

          {!isLoading && visible.length === 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 4px" }}>
                {showDone ? "Nothing done yet" : "All caught up"}
              </p>
              <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", margin: 0 }}>
                {showDone ? "Completed todos will appear here." : "Add a todo above to get started."}
              </p>
            </div>
          )}

          {!isLoading && GROUP_ORDER.map((label) => {
            const items = groups[label];
            if (!items || items.length === 0) return null;
            return (
              <section key={label} style={{ marginBottom: 22 }}>
                <h3 style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--subtle-foreground)",
                  margin: "0 6px 8px", display: "flex", alignItems: "center", gap: 6,
                }}>
                  {label}
                  <span style={{ opacity: 0.7 }}>· {items.length}</span>
                </h3>
                <ul style={{
                  listStyle: "none", margin: 0, padding: 0,
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 14, overflow: "hidden",
                }}>
                  {items.map((todo, i) => (
                    <TodoRow key={todo.id} todo={todo} lists={lists} divider={i < items.length - 1} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
