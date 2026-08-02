import { toNum } from '@/lib/format'

/**
 * Off-chain mint quote: collateral USD price × amount in → USN out.
 * Throws when a positive amount is provided without a usable price so callers
 * can surface "Quote unavailable" instead of a silent zero.
 */
export function computeMintPreviewAmountOut(
  amountIn: number | undefined,
  tokenPrice: number | undefined,
): number {
  if (!amountIn) return 0
  const price = toNum(tokenPrice)
  if (!price) {
    throw new Error('Token price unavailable')
  }
  return toNum(price * toNum(amountIn))
}

/**
 * Off-chain redeem quote: USN amount ÷ collateral USD price → collateral out.
 * Guards divide-by-zero and missing prices the same way as mint.
 */
export function computeRedeemPreviewAmountOut(
  amountIn: number | undefined,
  tokenOutPrice: number | undefined,
): number {
  if (!amountIn) return 0
  const price = toNum(tokenOutPrice)
  if (!price) {
    throw new Error('Token price unavailable')
  }
  return toNum(toNum(amountIn) / price)
}

/** True while an amount is entered but its price feed has not resolved yet. */
export function isMintRedeemPricePending(
  amountIn: number | undefined,
  priceLoading: boolean,
): boolean {
  return !!amountIn && priceLoading
}

/** Missing/errored/zero price after the feed settles — treat as quote failure. */
export function isMintRedeemPriceUnavailable(
  amountIn: number | undefined,
  priceLoading: boolean,
  price: number | undefined,
  priceError: boolean,
): boolean {
  if (!amountIn || priceLoading) return false
  if (priceError) return true
  return !(toNum(price) > 0)
}
