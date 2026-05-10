# Zod as the single source of truth for types and validation

Zod schemas are the canonical definition for all data shapes in the app — API request bodies, API response shapes, and form inputs. TypeScript types are inferred from Zod schemas via `z.infer<>` rather than written by hand or inferred from Drizzle. Drizzle's `$inferSelect` types are used internally within the DB layer but not exported to the rest of the app.

This gives one place to update when a shape changes and eliminates the risk of drift between validation logic and type definitions.
