# Vaults UI

Presentational vaults **content** (hero + cards). Shared chrome (in-flow sidebar beside header, footer) lives in `src/components/shell` and is mounted by `src/layout/AppShell`.

```text
constants.ts       Re-exports product tabs from mock/_shared/product-tabs
types.ts           View-model props
demo-vaults.ts     Stub rows for /mock
ProductHero.tsx    Home: Vaults/Buy/Bridge; USN/sUSN: Mint|Redeem|Stake|Unstake|Withdraw
VaultsPageView.tsx List content
VaultsHero.tsx     Vaults subtitle wrapper around ProductHero
VaultCard.tsx      Single vault row (+ Earn now on hover)
index.ts           Public exports
```

Home product tabs: Vaults · Buy · Bridge. USN/sUSN (sidebar) shows Mint · Redeem · Stake · Unstake · Withdraw only.

## Rules

1. Keep this folder presentational — no yield / wallet hooks.
2. Do not reintroduce header / sidebar / footer here; use AppShell.
3. Sort / filter toolbar only renders when handlers are passed.
