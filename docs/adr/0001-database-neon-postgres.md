# Database: Neon (serverless PostgreSQL) with Drizzle ORM

Owned Modules need persistent storage. We chose Neon (serverless PostgreSQL) on its free tier because the app is a personal project with low traffic and no budget for infrastructure. Neon's free tier is generous enough (0.5 GB storage, no auto-pause), works seamlessly with Vercel's serverless functions, and gives us real PostgreSQL semantics. Drizzle ORM is used over Prisma for its lighter footprint and better TypeScript inference.

## Considered Options

- **Turso (SQLite)** — also free, simpler, but PostgreSQL is more portable and better supported across hosting options.
- **Supabase** — free tier pauses after 7 days of inactivity, which is unsuitable for a personal app checked sporadically.
