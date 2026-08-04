# Testing

Unit tests run with **Vitest** + Testing Library. Coverage uses the **v8** provider and enforces thresholds on a curated include list (product math + thin controllers — not every wallet SDK hook).

```bash
yarn test                 # or npm run test
yarn test:coverage        # thresholds: lines/funcs/stmts ≥ 80, branches ≥ 70
yarn check                # format + lint + typecheck + test + build
```

Coverage config: `vite.config.ts` → `test.coverage`.

## What the coverage gate includes

| Area                   | Examples                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Shared trade math / UX | `trade-amounts`, `trade-display`, `trade-input-format`, form controller |
| Swap helpers           | `slippageAdjustedAmount`, Ekubo quote, spender                          |
| Mint / redeem pure     | `primary`, `preview`, `submit-args`                                     |
| Stake / unstake pure   | `primary`, `submit-args`, `withdraw-claim`                              |
| Bridge pure            | `primary`, `route`, `lib/bridge`, `lib/sui-oft`, `bridge-networks`      |
| Lib / session          | `format`, `wallet-session`, `evm-submit`, `env`, chain helpers          |

Heavy React submit/approve hooks and wallet SDK glue stay **outside** the threshold include set; add focused unit tests where pure logic can be extracted.

## Key suites

| Area            | Specs                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- |
| Env             | `src/lib/env/index.test.ts` (Infura / explicit URL → Starknet RPC)                           |
| Production CSP  | `src/lib/env/vercel-csp.test.ts` (`connect-src` Infura, Noon API, Blast, …)                  |
| Format / units  | `src/lib/format.test.ts`, `src/lib/format.display.test.ts`                                   |
| Wallet session  | `wallet-session`, `wallet-query-sync`, `evm-submit`, `active-network.scenarios`              |
| Wallet chrome   | `shell-wallet-chrome`, `connector-icon`, shell header / drawer                               |
| Shell layout    | `AppShell` (sidebar beside header), `AppSidebar` (in-flow + 4/5px insets), `shell/constants` |
| Trade forms     | `_shared/use-trade-form-controller`, `trade-amounts`, `trade-input-format`, `trade-display`  |
| Shared mock UI  | `SuccessCheckIcon`, `ExplorerActions`, `PrimaryCtaButton`, `ui-classes`                      |
| Buy / sell UI   | `mock/swap/TradePanelView.test.tsx`, `mock/buy/BuySuccessPanel.test.tsx`                     |
| Mint / redeem   | `features/mint-redeem/*`, `mock/mint-redeem/MintRedeemPanel.test.tsx`                        |
| Stake / unstake | `features/stake-unstake/*`, `mock/stake-unstake/*Panel*.test.tsx`                            |
| Bridge          | `features/bridge/*`, `mock/bridge/BridgePanel*.test.tsx`, `pages/bridge/bridge-networks`     |
| Zustand         | `state/active-chain`, `points-estimator-assumptions`                                         |
| Protocol config | `src/config/index.test.ts`                                                                   |

## UI value conventions under test

Assert **exact** display strings where product rules matter:

- Pay input ≤ **6** fraction digits (truncate / clip, not round up)
- Receive field ≤ **2** fraction digits (truncate); stored value stays at 6dp (`title` tooltip)
- USD labels via `formatUsd` (`~$x.xx`)
- Confirm rows via `formatTokenAmount` with `TRADE_PAY_DECIMALS` / `TRADE_RECEIVE_DISPLAY_DECIMALS`
- Buy/sell min received ≈ `down(amountOut * 0.99, 6)` then display @ 2dp
- Submit args use `toTruncatedTokenUnits` so float dust cannot inflate mins

## Adding tests

1. Prefer pure modules under `features/<domain>/` for math and CTA machines.
2. Panel tests should lock pay/receive formatting and confirm copy, not only “button exists”.
3. If you add a gated file to `vite.config.ts` coverage `include`, keep thresholds green.
4. Do not commit secrets or live RPC-dependent integration tests in the unit suite.
