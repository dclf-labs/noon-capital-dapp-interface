# Architecture notes

## Current shape

This repo is a **multichain wallet foundation** (EVM AppKit, Starknet, Sui) with a shared chain registry.
Product routes, feature modules, and a UI kit are intentionally not scaffolded yet — add them when the first product surface lands.

## State ownership

- **TanStack Query** (`src/lib/query.ts`): server/chain reads, caching, background refetch. Shared by EVM + Starknet providers.
- **Wallet sessions**: live in chain-specific hooks/providers under `src/wallet/*` and the `useMultiChainClient` facade.
- **Redux / React Router**: not installed yet. Prefer Query for chain data; introduce a router when there is more than one page, and a store only for cross-route client UI that Query cannot own.

## Layout conventions

| Path                     | Responsibility                                           |
| ------------------------ | -------------------------------------------------------- |
| `src/chains/`            | Single source of chain metadata + AppKit network objects |
| `src/wallet/<family>/`   | `config`, `provider`, `reader` (+ family hooks)          |
| `src/components/wallet/` | Connect / status UI only                                 |
| `src/lib/`               | Cross-cutting utils, env validation, shared query client |
| `src/providers/`         | Top-level provider composition                           |

## When adding product features

- Put domain logic under `src/features/<domain>/`
- Keep route screens thin under `src/pages/` (compose feature components)
- Keep wallet UI in `components/wallet`; keep chain I/O in `wallet/` + `chains/`
- Never ask users for private keys / seed phrases — wallet extensions and WalletConnect only
