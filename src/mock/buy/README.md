# Buy UI

Presentational Buy UI. Live wiring lives in `src/pages/swap/*BuyTrade` + `BuyFlowView`. Success uses shared `SuccessCheckIcon` from `src/mock/_shared`.

```text
constants.ts           USD presets + copy
format.ts              Amount helpers
types.ts               Controlled view-model props
TokenDropdown.tsx      Token picker (portaled list)
BuyPanel.tsx           Card (step 0)
BuyPageView.tsx        Hero + panel
BuySuccessPanel.tsx    Final success step
index.ts               Public exports
```

## Rules

1. Keep this folder presentational — no wallet / quote hooks.
2. Do not reintroduce header / sidebar / footer here; use AppShell (in-flow sidebar beside header).
3. Token lists and amounts are controlled by the page adapter.
