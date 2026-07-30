# Zustand state

UI-only client state. **Never** treat these stores as wallet connection authority — use `useWalletSession` for that.

| Store                                | File                              | Role                                                                |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------------- |
| `useActiveChainStore`                | `active-chain.ts`                 | Persisted product `selectedChainId` (default Ethereum) across pages |
| `usePointsEstimatorAssumptionsStore` | `points-estimator-assumptions.ts` | Estimator FDV + staking period (period persisted)                   |

```ts
import { useActiveChainStore, usePointsEstimatorAssumptionsStore } from '@/state'
import { useSelectActiveChain } from '@/hooks/connection'

// Prefer the hook when selecting from UI (also switches EVM wallet when needed)
const { selectedChainId, selectActiveChain } = useSelectActiveChain()
await selectActiveChain(8453) // Base
await selectActiveChain(starknetId) // Starknet — dapp only

// Or set directly (no wallet switch)
useActiveChainStore.getState().setSelectedChainId(1)
```

### Naming

| Field              | Meaning                                 |
| ------------------ | --------------------------------------- |
| `selectedChainId`  | Zustand product network (persisted)     |
| `connectedChainId` | Live wallet network on a family session |
| `activeChainId`    | Product network on `UnifiedConnection`  |

### Active network rules

- No / invalid selection → **Ethereum** (or connected EVM wallet chain via resolve, then sync into the store)
- Persisted in `localStorage` (`noon-active-chain-id`) so all pages keep the last choice
- EVM wallet connected + dapp in EVM mode → follow the wallet on connect and on wallet network changes
- EVM pick in the dapp → update store + `switchChain` when connected
- Starknet / Sui pick in the dapp → update store only (wallet sync does not override those)

## Tests

- `active-chain.test.ts` — default Ethereum, validation, persistence
- `points-estimator-assumptions.test.ts` — FDV + persisted staking period
