# Pages (route shells & panels)

Thin UI for product routes. Business math and CTA machines live under `src/features/`; pages bind provider fields and shared formatters.

## Routes (`src/App.tsx`)

| Path(s)                           | Shell               | Notes                                      |
| --------------------------------- | ------------------- | ------------------------------------------ |
| `/`                               | —                   | Home links into each surface               |
| `/swap/buy`, `/swap/sell`         | `swap/SwapShell`    | DEX buy/sell — **not** mint/redeem         |
| `/mint`, `/redeem`                | `MintRedeemShell`   | DirectMinter / DirectRedeemer (Ethereum)   |
| `/stake`, `/unstake`, `/withdraw` | `StakeUnstakeShell` | USN ↔ sUSN vault + claim after cooldown    |
| `/bridge`                         | `BridgeShell`       | Hyperlane / LayerZero (EVM, Starknet, Sui) |

## Layout per surface

```text
pages/<surface>/
  *Shell.tsx          # Nav tabs + outlet
  *Page.tsx           # Provider + flow entry
  *Panel.tsx          # Presentational form / confirm / success
  *Flow.tsx           # Wires hooks → panel props
  *-styles.ts         # Local styles
  *.test.tsx          # Panel / formatting tests
```

## Rules

1. **No amount×price or half/max math in panels** — use provider fields + `_shared` helpers.
2. **Pay ≤6dp / receive display ≤2dp** via `trade-input-format` (receive `title` = full stored precision).
3. Keep shells product-specific; do not reuse `SwapShell` for mint/stake/bridge.
4. Critical unstake note: submit uses previewed **USN out**, not sUSN shares (see `EvmUnstakeFlow` + `getUnstakeWithdrawArgs`).
5. Bridge receive is **1:1** with send in the UI; OFT `minAmountLd` still applies 1% on-chain.

## Related docs

- `docs/ARCHITECTURE.md` — product surface map + conventions
- `docs/TESTING.md` — panel / calculation test expectations
- `src/features/README.md` — domain modules
- `src/features/_shared/README.md` — shared trade primitives
