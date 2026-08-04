import type { ProtocolChainId } from '@/config/chain-id'
import { STARKNET_MAINNET_CHAIN_ID } from '@/config/chain-id'
import type useGasAndEthPrice from '@/features/api/hooks/useGasAndEthPrice'
import {
  DEFAULT_GAS_TRACKER_API_RESPONSE,
  type GasTrackerApiResponse,
} from '@/features/api/hooks/useGasAndEthPrice'
import { bnToStr, toBn, toNum, toStr } from '@/lib/format'

/**
 * Gas-tracker map keys Starknet under `'starknet'`, while protocol config uses the
 * numeric `STARKNET_MAINNET_CHAIN_ID`. Normalize so either form resolves STRK USD.
 */
function gasTrackerChainKey(chainKey: ProtocolChainId | string): string {
  const key = toStr(chainKey)
  if (key === 'starknet' || key === toStr(STARKNET_MAINNET_CHAIN_ID)) return 'starknet'
  return key
}

export const GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN = BigInt(115)
export const GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN = BigInt(100)

/** Buffer applied on top of estimated gas cost (EVM + Starknet). */
export const GAS_FEE_MULTIPLIER = 1.5

export type GasPriceMap = ReturnType<typeof useGasAndEthPrice>['data']

export type EvmGasFeeBreakdown = {
  /** Native gas token amount (after buffer multiplier). */
  native: number
  /** USD notional (`native * nativeTokenUsdPrice`). */
  usd: number
}

function positiveNum(value: unknown): number {
  const n = toNum(value as number | string | bigint | undefined)
  return n > 0 ? n : 0
}

/** First positive numeric candidate; ignores 0 / NaN / empty so API zeros don't wipe defaults. */
function firstPositive(...candidates: unknown[]): number {
  for (const candidate of candidates) {
    const n = positiveNum(candidate)
    if (n > 0) return n
  }
  return 0
}

function priceMapEntry(
  priceMap: GasPriceMap | GasTrackerApiResponse | undefined,
  key: string | number,
): { price?: unknown; gasPrice?: unknown; ethPrice?: unknown } | undefined {
  if (!priceMap) return undefined
  const entry =
    priceMap[key as keyof typeof priceMap] ?? priceMap[toStr(key) as keyof typeof priceMap]
  if (!entry || typeof entry !== 'object') return undefined
  return entry as { price?: unknown; gasPrice?: unknown; ethPrice?: unknown }
}

/**
 * USD price of the chain's native gas token.
 * - Prefer the chain-specific entry from `/gas-and-eth-price`.
 * - Fall back to bundled defaults when live price is missing or zero.
 * - Only fall back to mainnet ETH USD when the chain pays gas in ETH
 *   (`allowMainnetEthFallback`), never for SOPH / TAC / STRK / HYPE / etc.
 */
export function resolveNativeGasUsdPrice(
  ethAndGasPrice: GasPriceMap | undefined,
  chainKey: ProtocolChainId | string,
  options?: { allowMainnetEthFallback?: boolean },
): number {
  const key = gasTrackerChainKey(chainKey)
  // Prefer live chain price, then live mainnet (ETH-gas only), then bundled defaults.
  return firstPositive(
    priceMapEntry(ethAndGasPrice, key)?.price,
    options?.allowMainnetEthFallback ? priceMapEntry(ethAndGasPrice, 1)?.price : 0,
    priceMapEntry(DEFAULT_GAS_TRACKER_API_RESPONSE, key)?.price,
    options?.allowMainnetEthFallback
      ? (priceMapEntry(DEFAULT_GAS_TRACKER_API_RESPONSE, 1)?.price ??
          priceMapEntry(DEFAULT_GAS_TRACKER_API_RESPONSE, 1)?.ethPrice)
      : 0,
  )
}

export function toGasFeeUsd(nativeAmount: number, nativeUsdPrice: number): number {
  if (!(nativeAmount > 0) || !(nativeUsdPrice > 0)) return 0
  return toNum(nativeAmount * nativeUsdPrice)
}

/**
 * Native gas-token amount from gas units × gas price.
 * `gasPrice` is wei-per-gas (viem `getGasPrice()` / API), despite older "gwei" naming.
 */
function firstPositiveBn(...candidates: unknown[]): bigint {
  for (const candidate of candidates) {
    const n = toBn(candidate as number | string | bigint | undefined)
    if (n > 0n) return n
  }
  return 0n
}

export function evmGetGasFeeNative(
  gasUsed: bigint | number | string | undefined,
  gasPriceWei: bigint | number | string | undefined,
  ethAndGasPrice: GasPriceMap | undefined,
  chainId: ProtocolChainId,
): number {
  const _gasUsed = toBn(gasUsed)
  const chainKey = toStr(chainId)
  const _gasPriceWei = firstPositiveBn(
    gasPriceWei,
    priceMapEntry(ethAndGasPrice, chainKey)?.gasPrice,
    priceMapEntry(DEFAULT_GAS_TRACKER_API_RESPONSE, chainKey)?.gasPrice,
    priceMapEntry(ethAndGasPrice, 1)?.gasPrice,
    priceMapEntry(DEFAULT_GAS_TRACKER_API_RESPONSE, 1)?.gasPrice,
  )
  if (_gasUsed <= 0n || _gasPriceWei <= 0n) return 0

  const feeWei = _gasUsed * _gasPriceWei
  return toNum(bnToStr(feeWei, 18)) * GAS_FEE_MULTIPLIER
}

export const evmGetGasFeeBreakdown = async (
  gasUsed: bigint | number | string | undefined,
  gasPriceWei: bigint | number | string | undefined,
  ethAndGasPrice: GasPriceMap | undefined,
  chainId: ProtocolChainId,
  options?: { allowMainnetEthFallback?: boolean },
): Promise<EvmGasFeeBreakdown> => {
  const native = evmGetGasFeeNative(gasUsed, gasPriceWei, ethAndGasPrice, chainId)
  const usdPrice = resolveNativeGasUsdPrice(ethAndGasPrice, chainId, {
    allowMainnetEthFallback: options?.allowMainnetEthFallback ?? true,
  })
  return {
    native,
    usd: toGasFeeUsd(native, usdPrice),
  }
}

export const evmGetGasFee = async (
  gasUsed: bigint | number | string | undefined,
  gasPriceWei: bigint | number | string | undefined,
  ethAndGasPrice: GasPriceMap | undefined,
  chainId: ProtocolChainId,
) => {
  const { usd } = await evmGetGasFeeBreakdown(gasUsed, gasPriceWei, ethAndGasPrice, chainId)
  return usd
}
