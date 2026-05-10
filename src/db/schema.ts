import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  dueDate: text("due_date"),
  completedAt: timestamp("completed_at"),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
