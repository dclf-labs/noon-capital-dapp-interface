export const APP_NAME = 'Noon Capital'
export const APP_DESCRIPTION = 'Multichain capital markets protocol'
export const APP_URL = 'https://noon.capital'

export const QUERY_KEYS = {
  portfolio: 'portfolio',
  markets: 'markets',
  positions: 'positions',
  tokenBalances: 'tokenBalances',
} as const

export const STORAGE_KEYS = {
  theme: 'noon-theme',
  preferredChain: 'noon-preferred-chain',
} as const

export const ROUTES = {
  home: '/',
  markets: '/markets',
  portfolio: '/portfolio',
  docs: '/docs',
} as const
