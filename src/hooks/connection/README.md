# Wallet connection sessions

Canonical API: **`useWalletSession`** (`useWalletSession.ts`).

Wallet SDKs (AppKit/wagmi, starknet-react, Sui dapp-kit) are the **only** signing authority.
Zustand `selectedChainId` is the dapp product network (default Ethereum, persisted) — it never implies `isConnected`.

Naming:

- `selectedChainId` — Zustand product network (all pages)
- `connectedChainId` — live wallet network on a family session
- `activeChainId` — product network on a `UnifiedConnection` (active mode)

## Prefer

```ts
import {
  useWalletSession, // active chain + matching family wallet
  useEvmTargetSession, // live EVM wallet, config locked to a chainId
  useEvmFamilySession,
  useStarknetFamilySession,
  useSuiFamilySession,
  useReadOnlySession, // typed receiver / destination — never isConnected
  useResolvedChain, // chain id + family + config only
  useSelectActiveChain, // pick product network (EVM / Starknet / Sui)
} from '@/hooks/connection'

import { canWriteSession } from '@/lib/connection'
```

| Use case                            | Hook                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| Shell / active product chain        | `useWalletSession()`                                   |
| Pick network (all pages)            | `useSelectActiveChain()`                               |
| Mint / redeem / stake (Ethereum)    | `useEvmTargetSession(mainnet.id)`                      |
| Buy / sell on current EVM chain     | `useEvmFamilySession()`                                |
| Starknet / Sui family flows         | `useStarknetFamilySession()` / `useSuiFamilySession()` |
| Bridge destination / pasted address | `useReadOnlySession(chainId, address)`                 |

## Active network

- No selection → **Ethereum**; last choice persisted in `localStorage`
- EVM wallet connected (dapp in EVM mode) → dapp follows wallet on connect + wallet switches
- EVM pick in the dapp → update dapp + request wallet `switchChain` when connected
- Starknet / Sui: choose in the dapp (not overridden by MetaMask)
- `WalletQuerySync` mounts `useSyncActiveChainFromEvmWallet`

## Rules

- Gate writes with `canWriteSession(connection)` (connected + valid address + not unsupported).
- Never set `isConnected: true` for address-only / read-only contexts.
- Session `address` is cleared on disconnect — do not keep using a stale address for user APIs.
- Destination / typed-receiver balances use `useReadOnlySession` + read hooks that do **not** require `isConnected`.
- Pure resolution lives in `src/lib/wallet-session.ts` (unit-tested).

## Tests

- `src/lib/active-network.scenarios.test.ts` — product-contract scenarios (default, wallet drive, dapp pick, non-EVM sticky, multi-wallet)
- `src/lib/wallet-session.test.ts` — resolve / sync helper / multi-wallet / builders / unified
- `src/lib/connection.test.ts` — EMPTY stubs + UnifiedConnection type guards
- `src/hooks/connection/useSelectActiveChain.test.ts` — dapp network pick + EVM switch
- `src/hooks/connection/useSyncActiveChainFromEvmWallet.test.ts` — wallet→dapp EVM sync
- `src/state/active-chain.test.ts` — default Ethereum + persistence / rehydrate
- `src/hooks/on-chain/useChainFamily.test.ts` — EVM / Starknet / Sui routing
- `src/lib/wallet-query-sync.test.ts` — address compare + query cache clear
- `src/lib/evm-submit.test.ts` — write gate on unsupported / read-only sessions
