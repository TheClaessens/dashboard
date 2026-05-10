# TanStack Query (React Query) for client-side data fetching, refetch-after-mutation pattern

Client-side data fetching in Owned Module detail pages uses TanStack Query (`@tanstack/react-query`). Mutations call the API route, then invalidate the relevant query key to trigger a refetch — no optimistic updates.

Chosen over raw `fetch` + `useEffect` because it handles loading/error states, cache invalidation, and deduplication without boilerplate. Chosen over SWR for its first-class mutation support and wider ecosystem. Optimistic updates are deferred until a specific interaction feels sluggish enough to justify the rollback complexity.
