# Bridge

Cross-chain sUSN (and related) bridging via **Hyperlane** and **LayerZero**, across EVM, Starknet, and Sui.

Import public surface from `@/features/bridge`.

## Layout

```text
features/bridge/
  primary.ts          # CTA machine (networks → fee → approve → confirm)
  route.ts            # Pair allow-list, Hyperlane vs LZ, kill switches, LZ spender
  lib/bridge.ts       # LZ executor options (higher gas for Sui dest)
  lib/sui-oft.ts      # Sui OFT client + SendParam (minAmountLd = 1% haircut)
  context/{evm,starknet,sui}/
  hooks/{evm,starknet,sui}/
```

Pages: `src/pages/bridge/` (`BridgeShell`, `BridgePanel`, family `*BridgeFlow`).

## Route rules (`route.ts`)

| Helper                           | Behavior                                                                |
| -------------------------------- | ----------------------------------------------------------------------- |
| `isHyperlaneBridgeRoute`         | Starknet dest or source `useHyperlane` map; **null dest → true** (safe) |
| `isBridgePairAllowed`            | Same-chain + TAC/HyperEVM/Base/Citrea/Bera/Sui hard-blocks              |
| `isLayerzeroBridgeRouteDisabled` | Global LZ kill (Hyperlane stays up)                                     |
| `isSuiToEthBridgeDisabled`       | Sui → Ethereum kill switch                                              |
| `getLayerzeroApproveSpender`     | Helper address if set, else OFT                                         |
| `doesLayerzeroNeedApproval`      | Helper always; else only when OFT ≠ underlying token                    |

Destination network lists are filtered with `isBridgePairAllowed` in `pages/bridge/bridge-networks.ts`.

## Product rules

- UI shows **1:1** send/receive and “Slippage 0%”.
- LZ / Sui OFT submit still sets `minAmountLd` via `slippageAdjustedAmount(..., 1)` (1% haircut).
- Amount field is named `amount` (not amountIn/Out) — receive mirrors send.
- Gate writes with `canWriteSession`; destinations use `useReadOnlySession`.

## Tests

- `route.test.ts`, `primary.test.ts`, `lib/bridge.test.ts`, `lib/sui-oft.test.ts`
- `pages/bridge/BridgePanel.test.tsx`, `bridge-networks.test.ts`
