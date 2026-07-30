# Shared hooks

Cross-feature hooks live here. Domain logic belongs under `src/features/<domain>/`.

| Path          | Role                                                           |
| ------------- | -------------------------------------------------------------- |
| `connection/` | Multichain wallet connection facades                           |
| `on-chain/`   | Balances, allowances, gas (EVM / Starknet / Sui)               |
| `ui/`         | Debounce, mobile breakpoint, controlled / data / in-view state |
| `query/`      | Shared TanStack envelopes (`useChainQuery`, `useApiQuery`)     |

## Query envelopes

- **`useChainQuery`** — on-chain / quote reads (refetch-on-focus, interval from protocol config)
- **`useApiQuery`** — Noon backend reads (quiet refetch defaults, `retry: 2`)
- Prefer `enabled: isAddressValid(address)` for any user-scoped API path
- Prefer `queryKeys.*` from `@/lib/query-keys` for every `queryKey`

See `src/features/README.md` for mint, bridge, buy/sell, api, shell, and other domains.
`src/state/` holds Zustand stores (active chain, points estimator assumptions).
