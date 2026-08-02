# Shared trade-form primitives

Used by mint / redeem / stake / unstake / buy / sell / bridge providers.

Import from `@/features/_shared`.

| Export                                                      | Role                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `useTradeFormController`                                    | step, inputs, debounce, txnUrl                         |
| `useSyncAmountOut`                                          | numeric quote → `amountOut` while not debouncing       |
| `useSyncPreviewOut`                                         | number or `{ quote, route }` → `amountOut` + `route`   |
| `useResetOnSessionChange`                                   | clear amounts / step / txn on address·chain·disconnect |
| `getInsufficientBalance` / `getIsApproved`                  | balance / allowance gates                              |
| `getAmountUsd` / `normalizeTradeAmount` / `getPresetAmount` | amount math for UI                                     |
| `normalizePreviewQuote` / `normalizePreviewRoute`           | preview shape normalization                            |
| `formatUsd` / `formatTokenAmount` / `formatNativeFee` / …   | display strings                                        |
| `useTradeInputModel`                                        | Input-ready labels, half/max, USD                      |
| `useTradePriceModel`                                        | rate / fee / USD labels                                |
| `createTradeFormContexts` / hooks                           | optional Form/Balance/Price/Txn factory                |

## Rules for UI

1. **No business math in components.** Use provider fields (`amountInUsd`, `isInsufficientBalance`, `isApproved`) or `useTradeInputModel` / `useTradePriceModel`.
2. **No raw preview shape checks in components.** Providers sync `amountOut` / `route` via `useSyncPreviewOut`.
3. **Display formatting** goes through `trade-display` helpers (or the model hooks), not ad-hoc `toIntlStr` args in every leaf.
4. Prefer these helpers over hand-rolled `useState` + debounce in new providers.
5. Gate writes with `canWriteSession(connection)` in submit hooks.

## Tests

- `use-trade-form-controller.test.ts` — controller, sync, session reset
- `trade-amounts.test.ts` — USD, presets, preview normalization
