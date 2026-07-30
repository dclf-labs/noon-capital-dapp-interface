export const APP_NAME = 'Noon Capital'
export const APP_DESCRIPTION = "Web3's most intelligent stablecoin"
/** Longer blurb for Reown AppKit wallet metadata. */
export const APPKIT_DESCRIPTION =
  'The intelligent and fair yield-generating stablecoin. Noon is the most intelligent stablecoin, intelligently allocating collateral between battle-tested delta neutral strategies to bring the highest through cycle yield to our users. Noon is the most fair stablecoin, allocating more raw yield (>90%) + governance token rewards (65% to 80%) to our users than any other stablecoin in web3.'
/** Canonical dapp origin (matches index.html / sitemap / robots). */
export const APP_URL = 'https://app.noon.capital'
/** Marketing / WalletConnect origin must match the Reown dashboard allowlist. */
export const APPKIT_URL = 'https://noon.capital'

export const ROUTES = {
  home: '/',
} as const

export {
  DEFAULT_AVATAR,
  DEFAULT_COLLATERAL_PRICE,
  DEFAULT_USERNAME,
  PROHIBITED_COUNTRY_ALPHA2,
  PROHIBITED_COUNTRY_NUMERIC,
  REFETCH_API_INTERVAL,
  REFETCH_INTERVAL,
  REFETCH_INTERVAL_COLLATERAL_PRICE,
  REFETCH_INTERVAL_GAS_AND_ETH_PRICE,
} from '@/constants/api'
export * from '@/constants/common'
export * from '@/constants/ui'
