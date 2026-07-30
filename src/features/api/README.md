# API feature

Backend-facing hooks for Noon (`points`, username, protocol stats, quests, …).

## Conventions

- Base URL comes from **`appEnv.api.baseUrl`** (`src/lib/env`). Never hardcode hosts.
- Prefer [`lib/api-fetch.ts`](./lib/api-fetch.ts) for new GETs/POSTs (`apiFetch`, `ApiError`, `apiAddressPath`).
- Gate user-scoped requests with `isAddressValid` so paths never include `undefined`.
- Query keys live in `src/lib/query-keys.ts` — reuse `useApiQuery` / `queryKeys` instead of inventing ad-hoc keys.

## Env

See `.env.example` → `VITE_API_BASE_URL` and `src/lib/env/README.md`.

## Tests

- `lib/api-fetch.test.ts` — base URL prefixing, `ApiError`, address path helper
