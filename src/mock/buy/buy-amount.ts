import { toTradePayAmount } from '@/features/_shared'

/**
 * Convert a USD preset into a buy-token amount.
 * Falls back to 1:1 when the buy-token USD price is missing (typical for USN).
 */
export function buyTokenAmountFromUsd(
  usd: number,
  buyTokenUsdPrice: number | undefined,
): number | undefined {
  if (!(usd > 0)) return undefined
  const price = buyTokenUsdPrice && buyTokenUsdPrice > 0 ? buyTokenUsdPrice : 1
  return toTradePayAmount(usd / price)
}

/**
 * Exact-in pay amount needed to buy `buyAmount` of tokenOut.
 * `outPerIn` is tokenOut received for 1 tokenIn (unit quote).
 * Falls back to 1:1 when the unit rate is unavailable.
 */
export function payAmountFromBuyAmount(
  buyAmount: number,
  outPerIn: number | undefined,
): number | undefined {
  if (!(buyAmount > 0)) return undefined
  const rate = outPerIn && outPerIn > 0 ? outPerIn : 1
  return toTradePayAmount(buyAmount / rate)
}
