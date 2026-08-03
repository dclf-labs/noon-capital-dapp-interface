import { useMemo } from 'react'

import type { ProtocolChainId } from '@/config/chain-id'
import { formatFeeUsd } from '@/features/_shared/trade-display'
import useGasAndEthPrice, {
  DEFAULT_GAS_TRACKER_API_RESPONSE,
} from '@/features/api/hooks/useGasAndEthPrice'
import { resolveNativeGasUsdPrice, toGasFeeUsd } from '@/lib/gasFee'

/**
 * Bridge LZ/Hyperlane fee quotes are native gas-token amounts.
 * Convert to USD using the gas-tracker price map.
 */
export function useBridgeFeeUsd(
  nativeFee: number | undefined,
  chainId: ProtocolChainId | number | string | undefined,
  gasSymbol: string,
): number | undefined {
  const { data: ethAndGasPrice } = useGasAndEthPrice()

  return useMemo(() => {
    if (nativeFee === undefined || !(nativeFee > 0) || chainId == null) return undefined
    const paysGasInEth = gasSymbol.toUpperCase() === 'ETH'
    const usdPrice = resolveNativeGasUsdPrice(
      ethAndGasPrice || DEFAULT_GAS_TRACKER_API_RESPONSE,
      chainId as ProtocolChainId,
      { allowMainnetEthFallback: paysGasInEth },
    )
    const usd = toGasFeeUsd(nativeFee, usdPrice)
    return usd > 0 ? usd : undefined
  }, [chainId, ethAndGasPrice, gasSymbol, nativeFee])
}

/** USD display label for a bridge native-fee quote (`$0.2`). */
export function useBridgeFeeUsdLabel(
  nativeFee: number | undefined,
  chainId: ProtocolChainId | number | string | undefined,
  gasSymbol: string,
): string | undefined {
  const usd = useBridgeFeeUsd(nativeFee, chainId, gasSymbol)
  return useMemo(() => (usd != null ? formatFeeUsd(usd) : undefined), [usd])
}

/** Sum available USD fee parts (missing parts treated as 0 once any part is ready). */
export function sumBridgeFeeUsd(...parts: Array<number | undefined>): number | undefined {
  let any = false
  let total = 0
  for (const part of parts) {
    if (part == null || !Number.isFinite(part)) continue
    any = true
    total += part
  }
  return any ? total : undefined
}
