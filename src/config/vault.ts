import type { Address } from '@/config/address'

export type VaultCurator = {
  name: string
  iconSlug: string
  url: string
}

export const DEFAULT_VAULT_CURATOR: VaultCurator = {
  name: 'DCLM',
  iconSlug: 'dclm',
  url: 'https://dclmarkets.xyz/',
}

export type VaultConfig = {
  name: string
  vaultUrl?: string
  nameTooltip?: string
  curators?: VaultCurator[]
  vaultAssetName?: string
  vaultAssetSymbol?: string
  vaultAssetDecimals?: number
  isStablecoinAsset?: boolean
  assetSymbol?: string
  chainTooltip?: string
  fees?: {
    performance?: string
    maintenance?: string
  }
  feesTooltip?: string
  settlementFrequency?: string
  settlementFrequencyTooltip?: string
  getAssetUrl?: string
  requireTAndCSignature?: boolean
  isRedirectable?: boolean
  assetLightBgSlug?: string
  assetDarkBgSlug?: string
  vault?: Address
  subgraph?: string
}
