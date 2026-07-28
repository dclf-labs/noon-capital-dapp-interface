# Architecture notes

## Current shape

This repo is a **multichain wallet foundation** (EVM AppKit, Starknet, Sui) with a shared chain registry.
Product routes, feature modules, and a UI kit are intentionally **not** scaffolded yet — add them when the first product surface lands.

## State ownership

- **TanStack Query** (`src/lib/query.ts`): server/chain reads, caching, background refetch. Shared by EVM + Starknet providers.
- **Wallet sessions**: live in chain-specific hooks/providers under `src/wallet/*` and the `useMultiChainClient` facade.
- **Redux / React Router**: **not installed**. Prefer Query for chain data; introduce a router when there is more than one page, and a client store only for cross-route UI that Query cannot own.

## Layout conventions

| Path                     | Responsibility                                           |
| ------------------------ | -------------------------------------------------------- |
| `src/chains/`            | Single source of chain metadata + AppKit network objects |
| `src/wallet/<family>/`   | `config`, `provider`, `reader` (+ family hooks)          |
| `src/components/wallet/` | Connect / status UI only                                 |
| `src/lib/`               | Cross-cutting utils, env validation, shared query client |
| `src/lib/abis/`          | Contract ABIs (`evm/` Solidity, `starknet/` Cairo)       |
| `src/providers/`         | Top-level provider composition                           |

## Chain readers

`createChainReader` / `getChainReader` (`src/wallet/readers.ts`) return a family-routed read client that works **without** a connected wallet (bridge / quotes).

| Family   | Native balance today                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EVM      | `eth_getBalance` via viem public client                                                                                                                                        |
| Sui      | `suix_getBalance` via Mysten JSON-RPC                                                                                                                                          |
| Starknet | **Stub** — returns `0n` after a class-hash probe. ETH/STRK on Starknet are ERC-20s; call token `balanceOf` via `getStarknetRpcProvider()` or starknet-react `useReadContract`. |

## Env / analytics

| Variable                        | Runtime role                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_WALLETCONNECT_PROJECT_ID` | Required in production (AppKit fail-closed). Dev/CI may use a placeholder.                                                                              |
| `VITE_GA_MEASUREMENT_ID`        | Optional. Injected into `index.html` only (`%VITE_GA_MEASUREMENT_ID%`); skip on localhost. Parsed in Zod for typing / future use — not read from React. |
| `VITE_APP_ENV`                  | `development` \| `staging` \| `production`                                                                                                              |

## When adding product features

- Put domain logic under `src/features/<domain>/`
- Keep route screens thin under `src/pages/` (compose feature components)
- Keep wallet UI in `components/wallet`; keep chain I/O in `wallet/` + `chains/`
- Never ask users for private keys / seed phrases — wallet extensions and WalletConnect only
