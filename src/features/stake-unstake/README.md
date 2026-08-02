# Stake / Unstake / Withdraw-claim (pure module)

CTA labels, vault submit-args, and withdraw-request claim helpers for USN ↔ sUSN.

**Not** part of buy/sell or mint/redeem. Providers/hooks stay in `features/stake` / `features/unstake` (and related); pages under `pages/stake-unstake`.

Import from `@/features/stake-unstake`.

| Export                         | Role                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| `getStakeUnstakePrimaryAction` | Quote → optional approve → confirm CTA machine                      |
| `getStakeDepositArgs`          | `deposit(assets, receiver)` — assets are USN                        |
| `getUnstakeWithdrawArgs`       | `withdraw(assets, handler, owner)` — **assets = previewed USN out** |
| `getWithdrawUnlockAt`          | Request timestamp + `withdrawPeriod`                                |
| `isWithdrawRequestClaimable`   | Cooldown elapsed and not yet claimed                                |
| `formatCooldownRemaining`      | Compact cooldown label for claim UI                                 |
| `getWithdrawClaimLabel`        | Claim / Cooling down / Retry / …                                    |

## Critical: unstake assets ≠ shares

`StakingVault.withdraw` takes **USN asset amount** (preview `amountOut`), not sUSN share `amountIn`. Using shares under-withdraws when the exchange rate ≠ 1. Wired in `pages/stake-unstake/EvmUnstakeFlow.tsx` and covered by `submit-args.test.ts`.

## Product rules

- Ethereum mainnet target session.
- Stake may require USN approval; unstake typically does not (`requiresApproval`).
- After unstake, users claim from `/withdraw` once the cooldown ends.

## Tests

- `primary.test.ts`, `submit-args.test.ts`, `withdraw-claim.test.ts`, `addresses.test.ts`, `quote-sync.test.ts`
- Panels: `StakeUnstakePanel.test.tsx`, `WithdrawClaimsPanel.test.tsx`
