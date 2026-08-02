import type { Address } from 'viem'

import type { Token } from '@/config/token'
import { getAddressOrZeroAddress } from '@/lib/address'
import { strToBn } from '@/lib/format'

type DecimalsToken = Pick<Token, 'decimals'>

/**
 * Convert a JS number to token units, truncating toward zero.
 * Caps fractional digits at 12 so IEEE float dust cannot inflate amounts.
 */
function toTruncatedUnits(amount: number | undefined, decimals: number | undefined): bigint {
  if (amount == null || decimals == null || !Number.isFinite(amount)) return 0n
  const negative = amount < 0
  const abs = Math.abs(amount).toString()
  if (abs.includes('e') || abs.includes('E')) {
    return strToBn(amount, decimals)
  }
  const [intPart, fracPart = ''] = abs.split('.')
  const precision = Math.min(decimals, 12)
  const clipped = fracPart ? `${intPart}.${fracPart.slice(0, precision)}` : intPart
  return strToBn(negative ? `-${clipped}` : clipped, decimals)
}

/**
 * `StakingVault.deposit(assets, receiver)` — assets are USN.
 */
export function getStakeDepositArgs(
  tokenIn: DecimalsToken | undefined,
  amountIn: number | undefined,
  receiver: Address | undefined,
): readonly [bigint, Address] | undefined {
  if (!tokenIn || !amountIn || !receiver) return undefined
  return [toTruncatedUnits(amountIn, tokenIn.decimals), getAddressOrZeroAddress(receiver)] as const
}

/**
 * `StakingVault.withdraw(assets, receiver, owner)`.
 * `assets` must be the previewed USN out (not sUSN shares).
 */
export function getUnstakeWithdrawArgs(
  assetToken: DecimalsToken | undefined,
  assetsAmount: number | undefined,
  withdrawHandler: Address | undefined,
  owner: Address | undefined,
): readonly [bigint, Address, Address] | undefined {
  if (!assetToken || !assetsAmount || !withdrawHandler || !owner) return undefined
  return [
    toTruncatedUnits(assetsAmount, assetToken.decimals),
    getAddressOrZeroAddress(withdrawHandler),
    getAddressOrZeroAddress(owner),
  ] as const
}
