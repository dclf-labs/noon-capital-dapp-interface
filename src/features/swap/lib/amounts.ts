import { HUNDRED_PERCENT_IN_BN, SLIPPAGE_PERCENT_IN_BN } from '@/constants/common'

/**
 * Apply a percent haircut for min-out / OFT `minAmountLd`.
 *
 * Scale: `HUNDRED_PERCENT_IN_BN` (1e6) − `slippage * SLIPPAGE_PERCENT_IN_BN` (1e4),
 * so `slippage = 1` → 1% (`990_000 / 1_000_000`). Falsy/`0` coerces to 1%.
 * Confirm UIs may show `amountOut * 0.99` as a float approximation of this.
 */
export function slippageAdjustedAmount(amount: bigint, slippage: number): bigint {
  const bnSlippage = BigInt(slippage || 1)
  const slippageBps = bnSlippage * SLIPPAGE_PERCENT_IN_BN
  return (amount * (HUNDRED_PERCENT_IN_BN - slippageBps)) / HUNDRED_PERCENT_IN_BN
}

/** Convert a millisecond offset into a unix-seconds deadline. */
export function toDeadline(expirationMs: number): number {
  return Math.floor((Date.now() + expirationMs) / 1000)
}
