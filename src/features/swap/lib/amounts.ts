import { HUNDRED_PERCENT_IN_BN, SLIPPAGE_PERCENT_IN_BN } from '@/constants/common'

/** Apply `slippage` percent (default 1) using basis-point bigint math. */
export function slippageAdjustedAmount(amount: bigint, slippage: number): bigint {
  const bnSlippage = BigInt(slippage || 1)
  const slippageBps = bnSlippage * SLIPPAGE_PERCENT_IN_BN
  return (amount * (HUNDRED_PERCENT_IN_BN - slippageBps)) / HUNDRED_PERCENT_IN_BN
}

/** Convert a millisecond offset into a unix-seconds deadline. */
export function toDeadline(expirationMs: number): number {
  return Math.floor((Date.now() + expirationMs) / 1000)
}
