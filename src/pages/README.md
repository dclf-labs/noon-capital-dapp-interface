# Pages (route shells & flows)

Thin route wiring for product surfaces. **Presentational panels live in `src/mock/`** — pages import them and bind provider/hook props.

## Routes (`src/App.tsx`)

| Path(s)                           | Shell               | Notes                                      |
| --------------------------------- | ------------------- | ------------------------------------------ |
| `/`                               | `AppShell`          | Product vaults (same as `/vaults`)         |
| `/mock`                           | `AppShell`          | Stubbed gallery of `src/mock/*` panels     |
| `/swap/buy`, `/swap/sell`         | `AppShell` + swap   | DEX buy/sell — **not** mint/redeem         |
| `/mint`, `/redeem`                | `AppShell` + mint   | DirectMinter / DirectRedeemer (Ethereum)   |
| `/stake`, `/unstake`, `/withdraw` | `AppShell` + stake  | USN ↔ sUSN vault + claim after cooldown    |
| `/bridge`                         | `AppShell` + bridge | Hyperlane / LayerZero (EVM, Starknet, Sui) |
| `/vaults`                         | `AppShell`          | Vaults list content from `src/mock/vaults` |

Shared chrome (sidebar, network + wallet header, footer, max-width **1440px**) is `src/layout/AppShell` + `src/components/shell`.

## Layout per surface

```text
pages/<surface>/
  *Shell.tsx          # Nav tabs + outlet
  *Page.tsx           # Provider + flow entry
  *Flow.tsx           # Wires hooks → mock panel props
  bridge-networks.ts  # Bridge dest filtering (logic, not UI)

src/mock/<surface>/
  *Panel.tsx          # Presentational form / confirm / success
  *-styles.ts         # Local styles
  *.test.tsx          # Panel / formatting tests
```

## Rules

1. **Import UI from `@/mock/...`** (or `@/mock`) — do not reintroduce panels under `pages/`.
2. **No amount×price or half/max math in panels** — use provider fields + `_shared` helpers.
3. **Pay ≤6dp / receive display ≤2dp** via `trade-input-format` (receive `title` = full stored precision).
4. Keep shells product-specific; do not reuse `SwapShell` for mint/stake/bridge.
5. Critical unstake note: submit uses previewed **USN out**, not sUSN shares (see `EvmUnstakeFlow` + `getUnstakeWithdrawArgs`).
6. Bridge receive is **1:1** with send in the UI; OFT `minAmountLd` still applies 1% on-chain.

## Related docs

- `src/mock/README.md` — panel inventory + gallery
- `docs/ARCHITECTURE.md` — product surface map + conventions
- `docs/TESTING.md` — panel / calculation test expectations
- `src/features/README.md` — domain modules
- `src/features/_shared/README.md` — shared trade primitives
