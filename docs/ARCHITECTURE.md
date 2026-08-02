# Architecture notes

## Current shape

This repo is a **multichain wallet foundation** (EVM AppKit, Starknet, Sui) with a shared chain registry and co-located feature modules (mint, redeem, stake, buy/sell, bridge, …).

## State ownership

| Layer                                        | Owns                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **TanStack Query** (`src/lib/query.ts`)      | Server/chain reads, caching, background refetch. Cleared for user-scoped keys by `WalletQuerySync` on account change. |
| **Wallet sessions** (`src/hooks/connection`) | Live SDK connection (`useWalletSession` / family / target / read-only). Wallet SDKs are the only signing authority.   |
| **Zustand** (`src/state`)                    | UI-only: `selectedChainId` (active-chain), points estimator assumptions. Never treat as connected.                    |

## Layout conventions

| Path                        | Responsibility                                                     |
| --------------------------- | ------------------------------------------------------------------ |
| `src/chains/`               | Chain metadata + AppKit network objects                            |
| `src/config/`               | Protocol deployments (contracts, tokens, pools)                    |
| `src/features/<domain>/`    | Domain hooks, providers, libs (co-located)                         |
| `src/features/_shared/`     | Trade form controller + session reset                              |
| `src/hooks/connection/`     | Wallet sessions — prefer `useWalletSession` / `useReadOnlySession` |
| `src/hooks/on-chain/`       | Balances / allowances / gas (return `0` when disabled)             |
| `src/hooks/query/`          | `useChainQuery` / `useApiQuery` envelopes                          |
| `src/lib/wallet-session.ts` | Pure chain resolution + connection builders                        |
| `src/lib/env/`              | Zod-validated env → grouped `appEnv`                               |
| `src/lib/query-keys.ts`     | Central TanStack Query key factory                                 |
| `src/lib/evm-submit.ts`     | Shared EVM write + receipt (`canWriteSession` gated)               |
| `src/lib/abis/`             | Contract ABIs (`evm/` / `starknet/`)                               |
| `src/state/`                | Zustand stores                                                     |
| `src/wallet/<family>/`      | `config`, `provider`, `reader`                                     |
| `src/providers/`            | `AppProviders` (+ `WalletQuerySync`)                               |

## Wallet sessions

```ts
useWalletSession() // active chain + matching family
useEvmTargetSession(mainnet.id) // mint / redeem / stake
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

## Trade form contexts

Mint / redeem / stake / unstake / buy / sell providers use:

- `useTradeFormController` — step, inputs, debounce, txnUrl
- `useSyncAmountOut` — quote sync while not debouncing
- `useResetOnSessionChange` — clear amounts / step / txn on address·chain·disconnect; reset on `unsupported`

See `src/features/_shared/README.md`.

## Env / analytics

Validated in `src/lib/env` as **`appEnv`**. Prefer canonical names; a few alternate `VITE_APP_*` keys still normalize. See `.env.example` and `src/lib/env/README.md`.

| Variable                                         | Runtime role                                |
| ------------------------------------------------ | ------------------------------------------- |
| `VITE_API_BASE_URL`                              | Noon backend API base                       |
| `VITE_WALLETCONNECT_PROJECT_ID`                  | Required in production (AppKit fail-closed) |
| `VITE_STARKNET_ALCHEMY_API_KEY`                  | Builds Alchemy RPC when URL unset           |
| `VITE_STARKNET_RPC_URL`                          | Optional Starknet RPC override              |
| `VITE_ETHEREUM_RPC_URL` / `BASE` / `SUI` / `TAC` | Optional protocol RPC overrides             |
| `VITE_GA_MEASUREMENT_ID`                         | Optional; injected into `index.html` only   |

## Chain readers

`createChainReader` / `getChainReader` (`src/wallet/readers.ts`) work **without** a connected wallet.

| Family   | Native balance                                 |
| -------- | ---------------------------------------------- |
| EVM      | `eth_getBalance` via viem                      |
| Sui      | `suix_getBalance` via Mysten JSON-RPC          |
| Starknet | Stub `0n` — use token `balanceOf` for ETH/STRK |

## When adding product features

- Put domain logic under `src/features/<domain>/`
- Reuse `useChainQuery` / `useApiQuery` / `queryKeys`
- Use `useTradeFormController` + `useResetOnSessionChange` for trade UIs
- Gate writes with `canWriteSession`; prefer `submitEvmWrite` for EVM
- Keep route screens thin under `src/pages/`
- Never ask users for private keys / seed phrases
- Gate user-scoped API fetches with `isAddressValid`

## Testing (key suites)

| Area            | Specs                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Env             | `src/lib/env/index.test.ts`                                                         |
| Wallet session  | `src/lib/wallet-session.test.ts`, `wallet-query-sync.test.ts`, `evm-submit.test.ts` |
| Trade forms     | `src/features/_shared/use-trade-form-controller.test.ts`                            |
| Zustand         | `src/state/active-chain.test.ts`, `points-estimator-assumptions.test.ts`            |
| Protocol config | `src/config/index.test.ts`                                                          |
