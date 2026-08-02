# Mint / Redeem (pure module)

Off-chain preview math, CTA labels, and calldata argument builders for DirectMinter / DirectRedeemer.

**Not** part of buy/sell. Providers/hooks stay in `features/mint` and `features/redeem`; pages under `pages/mint-redeem`.

Import from `@/features/mint-redeem`.

| Export                                     | Role                                                             |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `computeMintPreviewAmountOut`              | `price × amountIn` → USN out; throws if amount set without price |
| `computeRedeemPreviewAmountOut`            | `amountIn / price` → collateral out; guards ÷0                   |
| `isMintRedeemPricePending` / `Unavailable` | Quote UX gates while price feed loads / fails                    |
| `getMintRedeemPrimaryAction`               | Whitelist → quote → approve → confirm CTA machine                |
| `getDirectMintCallArgs`                    | `[collateral, amount, minUsn]` with `toTruncatedTokenUnits`      |
| `getDirectRedeemCallArgs`                  | `[collateral, usnAmount, minCollateral]`                         |
| `stringifyCallArgs`                        | Gas-estimation string fallbacks                                  |

## Product rules

- Ethereum mainnet target session (`useEvmTargetSession`).
- Whitelist required for direct mint/redeem.
- UI “Slippage 0%”: `minAmountOut ===` previewed `amountOut` (price quote, not AMM haircut).
- Float dust must not inflate mins — fractional digits capped at 12 before unit conversion.

## Tests

- `preview.test.ts`, `primary.test.ts`, `submit-args.test.ts`, `quote-sync.test.ts`
- Panel: `pages/mint-redeem/MintRedeemPanel.test.tsx`
