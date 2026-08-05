# Architecture notes

## Current shape

This repo is the **Noon Capital dapp** (EVM AppKit, Starknet, Sui) with a shared chain registry and co-located feature modules.

Product surfaces are **separate routes and shells** — buy/sell (DEX), mint/redeem, stake/unstake/withdraw, and bridge must not be folded into one another:

| Surface                 | Routes                            | Pure math / CTA                        | Providers / hooks                       |
| ----------------------- | --------------------------------- | -------------------------------------- | --------------------------------------- |
| Buy / Sell              | `/swap/buy`, `/swap/sell`         | `_shared` + `swap/lib`                 | `features/buy`, `features/sell`         |
| Mint / Redeem           | `/mint`, `/redeem`                | `features/mint-redeem`                 | `features/mint`, `features/redeem`      |
| Stake / Unstake / Claim | `/stake`, `/unstake`, `/withdraw` | `features/stake-unstake`               | `features/stake`, `features/unstake`, … |
| Bridge                  | `/bridge`                         | `features/bridge` (`route`, `primary`) | EVM / Starknet / Sui bridge contexts    |

Thin route screens live under `src/pages/<surface>/`; presentational panels under `src/mock/`. See `src/pages/README.md` and `src/mock/README.md`.

## State ownership

| Layer                                        | Owns                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **TanStack Query** (`src/lib/query.ts`)      | Server/chain reads, caching, background refetch. Cleared for user-scoped keys by `WalletQuerySync` on account change. |
| **Wallet sessions** (`src/hooks/connection`) | Live SDK connection (`useWalletSession` / family / target / read-only). Wallet SDKs are the only signing authority.   |
| **Zustand** (`src/state`)                    | UI-only: `selectedChainId` (active-chain), points estimator assumptions. Never treat as connected.                    |

## Layout conventions

| Path                          | Responsibility                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `src/chains/`                 | Chain metadata + AppKit network objects                                            |
| `src/config/`                 | Protocol deployments (contracts, tokens, pools)                                    |
| `src/features/<domain>/`      | Domain hooks, providers, libs (co-located)                                         |
| `src/features/_shared/`       | Trade form controller, amounts, display, pay/receive precision                     |
| `src/features/mint-redeem/`   | Mint/redeem preview + CTA + submit-args (pure)                                     |
| `src/features/stake-unstake/` | Stake/unstake CTA + submit-args + withdraw-claim (pure)                            |
| `src/features/bridge/`        | Route rules, CTA, Hyperlane/LZ libs + family providers                             |
| `src/layout/AppShell`         | Shared chrome (max-width 1600px): in-flow sidebar beside header+main, footer below |
| `src/components/shell/`       | Shell chrome (`AppSidebar` 4px/5px insets, header, footer, network, …)             |
| `src/pages/`                  | Route shells + flows (wire hooks → UI props)                                       |
| `src/mock/`                   | Presentational panels; `_shared` product tabs + `StandardTradeFlowView`            |
| `src/hooks/connection/`       | Wallet sessions — prefer `useWalletSession` / `useReadOnlySession`                 |
| `src/hooks/on-chain/`         | Balances / allowances / gas (return `0` when disabled)                             |
| `src/hooks/query/`            | `useChainQuery` / `useApiQuery` envelopes                                          |
| `src/lib/wallet-session.ts`   | Pure chain resolution + connection builders                                        |
| `src/lib/format.ts`           | Display clip / Intl / `toTruncatedTokenUnits` for calldata                         |
| `src/lib/env/`                | Zod-validated env → grouped `appEnv`                                               |
| `src/lib/query-keys.ts`       | Central TanStack Query key factory                                                 |
| `src/lib/evm-submit.ts`       | Shared EVM write + receipt (`canWriteSession` gated)                               |
| `src/lib/abis/`               | Contract ABIs (`evm/` / `starknet/`)                                               |
| `src/state/`                  | Zustand stores                                                                     |
| `src/wallet/<family>/`        | `config`, `provider`, `reader` (see `src/wallet/README.md`)                        |
| `src/providers/`              | `AppProviders` (+ `WalletQuerySync`)                                               |

## Wallet sessions

```ts
useWalletSession() // active chain + matching family
useEvmTargetSession(mainnet.id) // mint / redeem / stake / unstake
useEvmFamilySession() // buy / sell on wallet chain
useStarknetFamilySession() / useSuiFamilySession()
useReadOnlySession(chainId, address) // bridge destination — never isConnected
canWriteSession(connection) // gate all writes
```

Rules:

- Zustand `selectedChainId` is the dapp product network (default **Ethereum**, persisted across pages)
- EVM: wallet network drives the dapp while in EVM mode; dapp picks also call `switchChain`
- Starknet / Sui: choose from the dapp; wallet EVM switches do not override those
- Session `address` is cleared on disconnect
- Destination balances use read-only sessions (no `isConnected` required)
- `WalletQuerySync` clears user-scoped React Query caches on account change and syncs EVM wallet→dapp chain

## Trade form conventions

All amount-entry products share `_shared` primitives (see `src/features/_shared/README.md`):

| Concern              | Helper                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| Form state           | `useTradeFormController`                                               |
| EVM quote sync       | `useSyncAmountOut`                                                     |
| Starknet quote sync  | `useSyncPreviewOut` (requires non-empty `route`)                       |
| Session reset        | `useResetOnSessionChange`                                              |
| Pay / receive digits | `trade-input-format` — pay ≤**6dp**, receive display ≤**2dp** (trunc.) |
| Half / Max           | `useTradeAmountHandlers` / `getTradeMaxAmount` (native gas reserve)    |
| Confirm / USD labels | `trade-display` (`formatUsd`, `formatTokenAmount`, …)                  |
| Submit float → units | `toTruncatedTokenUnits` (`lib/format`) — caps frac digits at 12        |

### Product-specific rules

- **Buy / sell**: confirm shows ~1% min received (`amountOut * 0.99` display); submit uses `slippageAdjustedAmount(..., 1)` bigint math.
- **Mint / redeem**: off-chain price quote → UI “Slippage 0%” and `minAmountOut === amountOut`.
- **Unstake**: `withdraw(assets, …)` must use previewed **USN out**, not sUSN share `amountIn`.
- **Bridge**: UI is 1:1 send/receive; LZ/Sui OFT still sets `minAmountLd` with the shared 1% haircut. Pair allow-list + kill switches live in `features/bridge/route.ts`.

## Env / analytics

Validated in `src/lib/env` as **`appEnv`**. See `.env.example` and `src/lib/env/README.md`.

| Variable                                         | Runtime role                                |
| ------------------------------------------------ | ------------------------------------------- |
| `VITE_API_BASE_URL`                              | Noon backend API base                       |
| `VITE_WALLETCONNECT_PROJECT_ID`                  | Required in production (AppKit fail-closed) |
| `VITE_STARKNET_INFURA_API_KEY`                   | Builds Infura RPC when URL unset            |
| `VITE_STARKNET_RPC_URL`                          | Optional Starknet RPC override (wins)       |
| `VITE_ETHEREUM_RPC_URL` / `BASE` / `SUI` / `TAC` | Optional protocol RPC overrides             |
| `VITE_GA_MEASUREMENT_ID`                         | Optional; injected into `index.html` only   |

## Starknet RPC / wallet provider

`appEnv.rpc.starknet` is the single Starknet JSON-RPC URL for:

| Consumer                                     | Role                                      |
| -------------------------------------------- | ----------------------------------------- |
| `src/wallet/starknet/provider.tsx`           | `jsonRpcProvider({ rpc: () => nodeUrl })` |
| `src/chains/registry.ts` (`starknetMainnet`) | Chain metadata RPC list                   |
| `src/config/chains/starknet.ts`              | Protocol config `rpcUrl`                  |

Resolution order: explicit `VITE_STARKNET_RPC_URL` → Infura URL from key → public Blast.

Use one Starknet RPC for wallet and readers — do not split providers.

## Production CSP (`vercel.json`)

Deployed headers include a strict `Content-Security-Policy`. `connect-src` must allow:

- Noon API (`https://back.noon.capital` by default)
- Starknet Infura (`https://starknet-mainnet.infura.io`)
- Public Starknet fallbacks used by the app (Blast; Lava if needed)
- Any host used by `VITE_*_RPC_URL` overrides

Local Vite does not apply this CSP — regressions show up on Vercel. See `src/lib/env/vercel-csp.test.ts`.

## Chain readers

`createChainReader` / `getChainReader` (`src/wallet/readers.ts`) work **without** a connected wallet.

| Family   | Native balance                                 |
| -------- | ---------------------------------------------- |
| EVM      | `eth_getBalance` via viem                      |
| Sui      | `suix_getBalance` via Mysten JSON-RPC          |
| Starknet | Stub `0n` — use token `balanceOf` for ETH/STRK |

## When adding product features

- Keep product surfaces separate (do not merge mint/stake/bridge into buy/sell)
- Put domain logic under `src/features/<domain>/`; pure CTA/math in sibling pure modules when practical
- Reuse `useChainQuery` / `useApiQuery` / `queryKeys`
- Use `_shared` trade helpers for amount UX; gate writes with `canWriteSession`
- Prefer `submitEvmWrite` for EVM; keep `src/pages/` thin
- Never ask users for private keys / seed phrases
- Gate user-scoped API fetches with `isAddressValid`
- Document new `VITE_*` keys in `.env.example`, README, and `src/lib/env`
- Allowlist new production RPC/API hosts in `vercel.json` `connect-src` (+ CSP test)

## Testing

See **`docs/TESTING.md`** for coverage gates, key suites, and UI-value conventions.
