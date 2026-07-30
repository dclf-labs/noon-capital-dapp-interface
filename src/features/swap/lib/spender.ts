import type { ProtocolChainConfig } from '@/config/types'
import type { Address } from '@/lib/address'

/**
 * Resolve the ERC-20 spender for Noon DEX swaps (buy/sell).
 * Curve router, Permit2 / Universal Router (v4), or Uni v3 swap router.
 */
export function getSwapSpender(config: ProtocolChainConfig | undefined): Address | undefined {
  if (!config) return undefined

  if (config.useCurvePools) {
    return config.curveRouter
  }

  if (config.useUniv4Pools) {
    return config.permit2 || config.uniUniversalRouter
  }

  return config.uniV3SwapRouter
}
