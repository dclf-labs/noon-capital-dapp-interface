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

## Receiver addresses

Change-address modal validation lives in `src/lib/receiver-address.ts` (family-strict filters + errors) on top of `src/lib/address.ts`:

- **EVM** — viem `isAddress` / checksum; non-zero
- **Starknet** — 63–64 hex digits (optional `0x`), felt252 via `validateAndParseAddress`; EVM pastes rejected
- **Sui** — exactly 64 hex digits (optional `0x`); short hex is invalid

## Bridge fee lines

UI (`BridgingFeesCollapsible`): **Total fees** expands to **Bridge fee** → **Network fee** → **Protocol fee**.

| Line             | What it is                                    | EVM                                                                                                                                                                                            | Starknet                              | Sui                                                               |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| **Bridge fee**   | Cross-chain delivery quote (source gas token) | LZ `quoteSend` or Hyperlane `quoteDispatch`                                                                                                                                                    | Hyperlane `quote_gas_payment`         | LZ OFT `quoteSend`                                                |
| **Network fee**  | Source-chain submit gas                       | `eth_estimateGas` via `useGasFee`                                                                                                                                                              | Starknet fee estimate via `useGasFee` | PTB gas (not estimated yet — omitted so LZ is not double-counted) |
| **Protocol fee** | Noon fee                                      | Always `$0`                                                                                                                                                                                    | Always `$0`                           | Always `$0`                                                       |
| **USD**          | Native → USD                                  | `resolveNativeGasUsdPrice` / `useBridgeFeeUsd` / `formatSubmitFeeLabels` — ETH chains may fall back to mainnet ETH; dedicated keys for Starknet, Sui `30378`, Berachain `80094`, Citrea `4114` | same                                  | same                                                              |

Breakdown **info tips** (labels only — not on Total fees) live in `src/mock/bridge/constants.ts` (`BRIDGE_FEE_TIP`, `BRIDGE_NETWORK_FEE_TIP`, `PROTOCOL_FEE_TIP`), rendered with `InfoTipIcon` (`text-stone-500` → `hover:text-primary`). USD values still tip the native amount.

## Tests

- `route.test.ts`, `primary.test.ts`, `lib/bridge.test.ts`, `lib/sui-oft.test.ts`
- `pages/bridge/BridgePanel.test.tsx`, `bridge-networks.test.ts`
- `src/lib/address.test.ts`, `src/lib/receiver-address.test.ts`
- `src/mock/bridge/constants.test.ts`, `BridgePanel.test.tsx` (fee tip triggers)
