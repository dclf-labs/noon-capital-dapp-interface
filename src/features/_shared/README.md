# Shared trade-form primitives

Used by mint / redeem / stake / unstake / buy / sell / bridge providers and panels.

Import from `@/features/_shared`.

| Export                                                      | Role                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `useTradeFormController`                                    | step, inputs, debounce, txnUrl                         |
| `getQuoteSourceKey`                                         | amount/token identity for debounce (ignores amountOut) |
| `useSyncAmountOut`                                          | numeric (EVM) quote → `amountOut` while not debouncing |
| `useSyncPreviewOut`                                         | Starknet `{ quote, route }` → `amountOut` + `route`    |
| `useResetOnSessionChange`                                   | clear amounts / step / txn on address·chain·disconnect |
| `getInsufficientBalance` / `getIsApproved`                  | balance / allowance gates                              |
| `getAmountUsd` / `normalizeTradeAmount` / `getPresetAmount` | amount math for UI                                     |
| `normalizePreviewQuote` / `normalizePreviewRoute`           | preview shape normalization                            |
| `TRADE_PAY_DECIMALS` / `TRADE_RECEIVE_DISPLAY_DECIMALS`     | 6dp pay / 2dp receive display                          |
| `formatTradePayDisplay` / `formatTradeReceiveDisplay`       | Controlled input display strings                       |
| `toTradePayAmount` / `toTradeReceiveStoredAmount`           | Clip helpers (receive store stays 6dp)                 |
| `parseTradePayInput` / `getTradeMaxAmount`                  | NumericFormat parse + Max with native gas reserve      |
| `formatUsd` / `formatTokenAmount` / `formatNativeFee` / …   | Confirm / USD / fee / balance labels                   |
| `getTradePrimaryAction`                                     | Shared buy/sell-style CTA helper                       |
| `useTradeInputModel`                                        | Input-ready labels, half/max, USD                      |
| `useTradePriceModel`                                        | Optional rate / fee / USD labels                       |
| `useTradeAmountHandlers`                                    | Half/Max handlers (Max reserves native gas)            |
| `createTradeFormContexts` / hooks                           | optional Form/Balance/Price/Txn factory                |

## Rules for UI

1. **No business math in components.** Use provider fields (`amountInUsd`, `isInsufficientBalance`, `isApproved`) or `useTradeInputModel` / `useTradePriceModel`.
2. **No raw preview shape checks in components.** EVM uses `useSyncAmountOut`; Starknet uses `useSyncPreviewOut` (requires a route).
3. **Display formatting** goes through `trade-display` helpers (or the model hooks), not ad-hoc `toIntlStr` args in every leaf.
4. **Pay ≤6dp / receive display ≤2dp** via `trade-input-format`; store full receive precision for submit. Put full precision in the receive input `title`.
5. Prefer these helpers over hand-rolled `useState` + debounce in new providers.
6. Gate writes with `canWriteSession(connection)` in submit hooks.
7. Native Max must use `getTradeMaxAmount` / `useTradeAmountHandlers` — not `useTradeInputModel().maxAmount` (no gas reserve).

## Tests

- `use-trade-form-controller.test.ts` — controller, sync, session reset, quote-source key
- `trade-amounts.test.ts` — USD, presets, preview normalization
- `trade-input-format.test.ts` — 6dp/2dp pay·receive, parse, Max reserve
- `trade-display.test.ts` — exact USD / token / min-received pairing
- `trade-primary.test.ts` — shared CTA machine
- `use-trade-amount-handlers.test.ts` / `use-trade-input-model.test.ts`

See also `docs/TESTING.md` and panel tests under `src/mock/*/`.
