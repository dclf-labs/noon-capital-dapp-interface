import type { ProtocolChainConfig } from '@/config/types'

export type BuyPoweredByVenue = 'uniswap' | 'syncswap' | 'ekubo' | 'curve'

export type BuyPoweredBy = {
  venue: BuyPoweredByVenue
  name: string
  logoSrc: string
  /** Full wordmark logo — hide the separate text label. */
  wordmark?: boolean
}

const VENUES: Record<BuyPoweredByVenue, BuyPoweredBy> = {
  uniswap: {
    venue: 'uniswap',
    name: 'Uniswap',
    logoSrc: '/assets/buy/uniswap.svg',
    wordmark: true,
  },
  syncswap: {
    venue: 'syncswap',
    name: 'Syncswap',
    logoSrc: '/assets/tokens/SYNCSWAP.svg',
  },
  ekubo: {
    venue: 'ekubo',
    name: 'Ekubo',
    logoSrc: '/assets/tokens/EKUBO.svg',
  },
  curve: {
    venue: 'curve',
    name: 'Curve',
    logoSrc: '/assets/tokens/CRV.svg',
  },
}

/** Default when network / DEX is unknown (Ethereum buy path). */
export const DEFAULT_BUY_POWERED_BY = VENUES.uniswap

type BuyPoweredByConfig = Pick<
  ProtocolChainConfig,
  'ekuboRouter' | 'syncswapV3Router' | 'useCurvePools' | 'curveRouter'
>

/**
 * Resolve the "Powered by" venue from the active chain config.
 * Starknet → Ekubo, Sophon / zkSync → Syncswap, TAC → Curve, else Uniswap.
 */
export function resolveBuyPoweredBy(config: BuyPoweredByConfig | undefined): BuyPoweredBy {
  if (config?.ekuboRouter) return VENUES.ekubo
  if (config?.syncswapV3Router) return VENUES.syncswap
  if (config?.useCurvePools || config?.curveRouter) return VENUES.curve
  return VENUES.uniswap
}
