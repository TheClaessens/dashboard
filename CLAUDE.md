@AGENTS.md

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`TheClaessens/dashboard`). See `docs/agents/issue-tracker.md`.

### Triage labels

Using the five default triage label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Coding standards

### TypeScript

- All forms use `react-hook-form` + `zodResolver` — no manual `useState` form patterns
- All prop-accepting components typed as `const Comp: FC<CompProps> = ...` with a named `interface CompProps`
- Schema files (`src/lib/schemas/`) contain Zod schemas and inferred types only — no utility functions
- Utility functions that operate on domain types live in `src/lib/<domain>.ts` (e.g. `src/lib/food.ts`)
- Inline filter predicates extracted as named type guard functions: `function isXxx(x: unknown): x is Xxx`
- No ternary expressions (`? :`) inside JSX — use `&&` short-circuit instead
- All imports use `@/` absolute paths, never relative

### Naming

- Functions that call the DB or an external API use a `get` prefix
- Pure computation helpers (no I/O) use a descriptive noun or `derive` prefix
- Server-side data-fetching helpers for a page live in `page.utils.ts` next to the page

### File structure

- Large pages extract logic into `components/` subdirectory and `page.utils.ts`
- `src/lib/schemas/<domain>.ts` — Zod + types only
- `src/lib/<domain>.ts` — utility functions for a domain
- `src/app/<module>/hooks/` — TanStack Query hooks
- `src/app/<module>/components/` — components used by a module

### Linting

- `pnpm lint` must pass with zero errors before committing
- `typescript-eslint` strict + stylistic presets are enabled
- `eslint-plugin-tailwindcss` enforces class ordering (auto-fixable with `pnpm lint --fix`)
- `no-contradicting-classname` and `no-custom-classname` are disabled (alpha plugin false positives)

### Dates

- Use `toLocaleDateString("en-CA")` for YYYY-MM-DD strings in local timezone — never `toISOString().slice(0, 10)`
