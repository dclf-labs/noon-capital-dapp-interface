# Features

Domain modules co-locate hooks, React context providers, and feature-specific libs.

Product surfaces stay **separate** (dedicated routes under `src/pages/` — see `src/pages/README.md`).

| Feature              | Contents                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| `mint` / `redeem`    | Form providers + txn hooks (Ethereum target session)                          |
| `mint-redeem`        | Pure CTA / preview / submit-args — [README](./mint-redeem/README.md)          |
| `stake` / `unstake`  | Form providers + txn hooks (Ethereum target session)                          |
| `stake-unstake`      | Pure CTA / submit-args / withdraw-claim — [README](./stake-unstake/README.md) |
| `buy` / `sell`       | EVM + Starknet providers; shared swap preview / spender                       |
| `bridge`             | Hyperlane / LayerZero (EVM, Starknet, Sui) — [README](./bridge/README.md)     |
| `vault` / `withdraw` | Vault reads + withdraw helpers                                                |
| `governance`         | Open staking / vesting / power                                                |
| `api`                | Protocol + points HTTP hooks (`apiFetch` + `useApiQuery`)                     |
| `swap`               | Shared DEX quotes, spender, slippage (`lib/amounts.ts`)                       |
| `shell`              | Account drawer, network selectors, wallet modals                              |
| `_shared`            | Trade form controller, USD/presets, display — [README](./_shared/README.md)   |

## Conventions

- **Query keys**: `@/lib/query-keys` (`queryKeys.domain.action(...)`)
- **Chain reads**: `useChainQuery` from `@/hooks/query/useChainQuery`
- **API reads**: `apiFetch` + `useApiQuery` (gate with `isAddressValid`)
- **Env**: `appEnv` from `@/lib/env` — never raw `import.meta.env` in features
- **Wallet sessions**: `useEvmTargetSession` / `useEvmFamilySession` / `useStarknetFamilySession` / `useReadOnlySession`
- **Writes**: `canWriteSession(connection)` before submits; prefer `submitEvmWrite` for EVM
- **Trade forms**: `useTradeFormController` + `useSyncAmountOut` / `useSyncPreviewOut` + `useResetOnSessionChange`
- **UI values**: providers expose `amountInUsd`, `isInsufficientBalance`, `isApproved`; use `useTradeInputModel` / `useTradePriceModel` + `trade-display` — no amount×price or half/max math in components (see `_shared/README.md`)
- **Pay / receive precision**: `trade-input-format` — pay ≤6dp, receive display ≤2dp (stored receive stays 6dp)
- **Submit units**: `toTruncatedTokenUnits` from `@/lib/format` (float-dust safe)
- **Buy/sell**: share `usePreviewSwap` / `usePreviewEkuboSwap` / `getSwapSpender`; min-out via `slippageAdjustedAmount`
- **Config helpers**: `getToken` / pools from `@/config`

Shared cross-feature code:

- `src/hooks/connection` — wallet sessions (`useWalletSession`, `WalletQuerySync`)
- `src/hooks/on-chain` — balances, allowances, gas (zero when disabled / unsupported)
- `src/hooks/ui` — debounce, mobile, controlled state
- `src/hooks/query` — shared query envelopes
- `src/state` — Zustand (`useActiveChainStore`, `usePointsEstimatorAssumptionsStore`)
- `src/lib/wallet-session.ts` — pure session builders + `canWriteSession`

## Docs

- `docs/ARCHITECTURE.md` — layout, sessions, product rules
- `docs/TESTING.md` — coverage gate + key suites
