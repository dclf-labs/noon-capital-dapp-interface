import type { Address } from 'viem'

import type { Token } from '@/config/token'
import { getAddressOrZeroAddress } from '@/lib/address'
import { toTruncatedTokenUnits } from '@/lib/format'

type DecimalsToken = Pick<Token, 'decimals'>

/**
 * `StakingVault.deposit(assets, receiver)` — assets are USN.
 */
export function getStakeDepositArgs(
  tokenIn: DecimalsToken | undefined,
  amountIn: number | undefined,
  receiver: Address | undefined,
): readonly [bigint, Address] | undefined {
  if (!tokenIn || !amountIn || !receiver) return undefined
  return [
    toTruncatedTokenUnits(amountIn, tokenIn.decimals),
    getAddressOrZeroAddress(receiver),
  ] as const
}

/**
 * `StakingVault.withdraw(assets, receiver, owner)`.
 *
 * `assets` must be the previewed USN **out** (not sUSN share `amountIn`).
 * Using shares here under-withdraws when exchange rate ≠ 1.
 */
export function getUnstakeWithdrawArgs(
  assetToken: DecimalsToken | undefined,
  assetsAmount: number | undefined,
  withdrawHandler: Address | undefined,
  owner: Address | undefined,
): readonly [bigint, Address, Address] | undefined {
  if (!assetToken || !assetsAmount || !withdrawHandler || !owner) return undefined
  return [
    toTruncatedTokenUnits(assetsAmount, assetToken.decimals),
    getAddressOrZeroAddress(withdrawHandler),
    getAddressOrZeroAddress(owner),
  ] as const
}
