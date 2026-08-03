# Buy UI

Presentational Buy **step 0** (hero + card). Live wiring lives in `src/pages/swap/*BuyTrade` + `BuyFlowView`. Confirm / success (steps 1–2) reuse `TradePanelView`.

```text
constants.ts      USD presets + copy
format.ts         Amount helpers
types.ts          Controlled view-model props
TokenDropdown.tsx Token picker (portaled list)
BuyPanel.tsx      Card
BuyPageView.tsx   Hero + panel
index.ts          Public exports
```

## Rules

1. Keep this folder presentational — no wallet / quote hooks.
2. Do not reintroduce header / sidebar / footer here; use AppShell.
3. Token lists and amounts are controlled by the page adapter.
