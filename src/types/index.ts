export type Theme = 'light' | 'dark' | 'system'

export type ChainKey =
  'ethereum' | 'arbitrum' | 'base' | 'optimism' | 'polygon' | 'sepolia' | 'unknown'

export interface AppConfig {
  env: 'development' | 'staging' | 'production'
  walletConnectProjectId: string
}

export interface TokenMeta {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
}

export interface MarketSummary {
  id: string
  name: string
  chainId: number
  tvl: number
  apy: number
  asset: TokenMeta
}
