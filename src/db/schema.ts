import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const todoStatusEnum = pgEnum("todo_status", ["open", "done"]);

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  status: todoStatusEnum("status").default("open").notNull(),
  dueDate: text("due_date"),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type List = typeof lists.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type NewList = typeof lists.$inferInsert;
