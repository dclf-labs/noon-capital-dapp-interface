export type VaultListItem = {
  id: string
  name: string
  description: string
  chainName: string
  chainIconSrc: string
  assetSymbol: string
  assetIconSrc: string
  apyLabel: string
  tvlLabel: string
  /** Pulse APY while the vault metrics query is loading / refetching. */
  isApyLoading?: boolean
  /** Pulse TVL while the vault metrics query is loading / refetching. */
  isTvlLoading?: boolean
  iconSrc: string
  href?: string
}

export type VaultsPageViewProps = {
  vaults: VaultListItem[]
  /** Optional — toolbar only renders when provided. */
  onSortClick?: () => void
  onFilterClick?: () => void
}
