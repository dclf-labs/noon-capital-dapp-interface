# Vaults UI

Presentational vaults **content** (hero + cards). Shared chrome (sidebar, header, footer) lives in `src/components/shell` and is mounted by `src/layout/AppShell`.

```text
constants.ts       Product tabs (Vaults / Buy / Bridge)
types.ts           View-model props
demo-vaults.ts     Stub rows for /mock
VaultsPageView.tsx List content
VaultsHero.tsx     Title / product tabs
VaultCard.tsx      Single vault row (+ Earn Now on hover)
index.ts           Public exports
```

## Rules

1. Keep this folder presentational — no yield / wallet hooks.
2. Do not reintroduce header / sidebar / footer here; use AppShell.
3. Sort / filter toolbar only renders when handlers are passed.
