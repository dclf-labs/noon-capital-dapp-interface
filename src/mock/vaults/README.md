# Vaults UI

Presentational vaults **content** (hero + cards). Shared chrome (sidebar, header, footer) lives in `src/components/shell` and is mounted by `src/layout/AppShell`.

```text
constants.ts       Product tabs (Vaults / Buy / Bridge) + path helpers
types.ts           View-model props
demo-vaults.ts     Stub rows for /mock
ProductHero.tsx    Shared Vaults / Buy / Bridge hero
VaultsPageView.tsx List content
VaultsHero.tsx     Vaults subtitle wrapper around ProductHero
VaultCard.tsx      Single vault row (+ Earn now on hover)
index.ts           Public exports
```

## Rules

1. Keep this folder presentational — no yield / wallet hooks.
2. Do not reintroduce header / sidebar / footer here; use AppShell.
3. Sort / filter toolbar only renders when handlers are passed.
