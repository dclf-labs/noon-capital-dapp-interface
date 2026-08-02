import type { Address } from 'viem'

import type { Token } from '@/config/token'
import { getAddressOrZeroAddress } from '@/lib/address'
import { toTruncatedTokenUnits } from '@/lib/format'

type AmountToken = Pick<Token, 'contractAddress' | 'decimals'>
type DecimalsToken = Pick<Token, 'decimals'>

/**
 * `directMint(collateral, collateralAmount, minUsnAmount)` args.
 * Collateral is tokenIn; min out uses tokenOut (USN) decimals.
 *
 * Off-chain price quotes set `minAmountOut === amountOut` (UI “Slippage 0%”) —
 * not an AMM min-out haircut.
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
    toTruncatedTokenUnits(amountIn, tokenIn.decimals),
    toTruncatedTokenUnits(minAmountOut, tokenOut.decimals),
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
    toTruncatedTokenUnits(amountIn, tokenIn.decimals),
    toTruncatedTokenUnits(minAmountOut, tokenOut.decimals),
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
