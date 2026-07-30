# Shared trade-form primitives

Used by mint / redeem / stake / unstake / buy / sell providers.

| Export                                     | Role                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `useTradeFormController`                   | step, inputs, debounce, txnUrl                                                 |
| `useSyncAmountOut`                         | quote → `amountOut` while not debouncing                                       |
| `useResetOnSessionChange`                  | clear amounts / step / txn on address·chain·disconnect; reset on `unsupported` |
| `getInsufficientBalance` / `getIsApproved` | balance/allowance helpers                                                      |
| `createTradeFormContexts` / hooks          | optional Form/Balance/Price/Txn context factory (`trade-form-context.tsx`)     |

## Rules

- Prefer these helpers over hand-rolled `useState` + debounce in new providers.
- Always pass the live wallet session into `useResetOnSessionChange`.
- Gate writes with `canWriteSession(connection)` in submit hooks.

## Tests

- `use-trade-form-controller.test.ts` — controller, `useSyncAmountOut`, session reset / unsupported
