import type { Address } from 'viem'

import type { Token } from '@/config/token'
import { getAddressOrZeroAddress } from '@/lib/address'
import { strToBn } from '@/lib/format'

type AmountToken = Pick<Token, 'contractAddress' | 'decimals'>
type DecimalsToken = Pick<Token, 'decimals'>

/**
 * Convert a JS number to token units, truncating toward zero.
 * Caps fractional digits at 12 so IEEE float dust cannot inflate minAmountOut.
 */
function toTruncatedUnits(amount: number | undefined, decimals: number | undefined): bigint {
  if (amount == null || decimals == null || !Number.isFinite(amount)) return 0n
  const negative = amount < 0
  const abs = Math.abs(amount).toString()
  if (abs.includes('e') || abs.includes('E')) {
    // Rare huge/tiny values — fall back to strToBn without extra truncation.
    return strToBn(amount, decimals)
  }
  const [intPart, fracPart = ''] = abs.split('.')
  const precision = Math.min(decimals, 12)
  const clipped = fracPart ? `${intPart}.${fracPart.slice(0, precision)}` : intPart
  return strToBn(negative ? `-${clipped}` : clipped, decimals)
}

/**
 * `directMint(collateral, collateralAmount, minUsnAmount)` args.
 * Collateral is tokenIn; min out uses tokenOut (USN) decimals.
 */
export function getDirectMintCallArgs(
  tokenIn: AmountToken | undefined,
  tokenOut: DecimalsToken | undefined,
  amountIn: number | undefined,
  minAmountOut: number | undefined,
): readonly [Address, bigint, bigint] | undefined {
  if (!tokenIn || !tokenOut || !amountIn || !minAmountOut) return undefined
  return [
    getAddressOrZeroAddress(tokenIn.contractAddress),
    toTruncatedUnits(amountIn, tokenIn.decimals),
    toTruncatedUnits(minAmountOut, tokenOut.decimals),
  ] as const
}

/**
 * `directRedeem(collateral, usnAmount, minCollateralAmount)` args.
 * Collateral is tokenOut (not USN); USN amount uses tokenIn decimals.
 */
export function getDirectRedeemCallArgs(
  tokenIn: DecimalsToken | undefined,
  tokenOut: AmountToken | undefined,
  amountIn: number | undefined,
  minAmountOut: number | undefined,
): readonly [Address, bigint, bigint] | undefined {
  if (!tokenIn || !tokenOut || !amountIn || !minAmountOut) return undefined
  return [
    getAddressOrZeroAddress(tokenOut.contractAddress),
    toTruncatedUnits(amountIn, tokenIn.decimals),
    toTruncatedUnits(minAmountOut, tokenOut.decimals),
  ] as const
}

/** Stringified args for gas estimation helpers that expect hex/decimal strings. */
export function stringifyCallArgs(
  args: readonly [Address, bigint, bigint] | undefined,
  fallback: readonly [Address, string, string],
): readonly [Address, string, string] {
  if (!args) return fallback
  return [args[0], args[1].toString(), args[2].toString()] as const
}
