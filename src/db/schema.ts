import { pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodItems = pgTable("food_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  mealId: uuid("meal_id").references(() => meals.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
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
