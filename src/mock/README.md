# Mock UI

Presentational product UI built for buy/sell, mint/redeem, stake/unstake, and bridge.

Live wallet/quote wiring stays in `src/pages/*` and `src/features/*`. This folder holds the panels, network switchers, and local styles those pages render.

```text
src/mock/
  _shared/          PanelChrome, SuccessCheckIcon, ExplorerActions, CTAs, …
  buy/              Buy step 0 + BuySuccessPanel (final step check)
  swap/             TradePanelView, NetworkSwitcher, trade-styles
  mint-redeem/      MintRedeemPanel, mint-redeem-styles
  stake-unstake/    StakeUnstakePanel, WithdrawClaimsPanel, styles
  bridge/           BridgePanel, BridgeSuccessPanel, BridgeNetworkSwitcher, …
  vaults/           Vaults list content (hero + cards) — chrome in AppShell
  index.ts          Public re-exports
```

Shared chrome: `src/layout/AppShell` + `src/components/shell` (in-flow sidebar beside header, footer below).
Buy / bridge success steps share `SuccessCheckIcon` (animated check asset; Figma `4819:60244`).
See `src/mock/vaults/README.md` for the vaults content module.

`WithdrawClaimsPanel` is also stored here but still uses live withdraw hooks when mounted from `/withdraw`.

## Import

```ts
import { TradePanelView, MintRedeemPanel, BridgePanel } from '@/mock'
// or
import { TradePanelView } from '@/mock/swap/TradePanelView'
```

## Rules

1. Keep business math / CTA machines in `src/features/`.
2. Keep route shells + `*Flow` wiring in `src/pages/`.
3. Prefer shared formatters from `@/features/_shared` inside these panels.
4. Panel unit tests live next to the components under `src/mock/`.
