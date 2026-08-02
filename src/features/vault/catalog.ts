/**
 * Product vaults from the landing page (`noon/landing-page` Vaults section).
 * Static copy + deep links; live APY/TVL come from yield hooks.
 */
export type ProductVaultId = 'usdc-mon' | 'tbtc-eth' | 'wcbtc-citrea'

export type ProductVaultDefinition = {
  id: ProductVaultId
  name: string
  description: string
  chainName: string
  chainIconSrc: string
  assetSymbol: string
  /** Large card icon (vault mark). */
  iconSrc: string
  /** Small asset chip icon — reuse vault mark when no separate token asset exists. */
  assetIconSrc: string
  href: string
}

/** Same rows as landing `VAULT_DEFINITIONS`. */
export const PRODUCT_VAULT_DEFINITIONS: ProductVaultDefinition[] = [
  {
    id: 'usdc-mon',
    name: 'sUSN Delta Neutral Yield Vault',
    description:
      'Deposit USDC into a delta-neutral strategy and earn yield while risk is managed automatically.',
    chainName: 'Monad',
    chainIconSrc: '/assets/chains/monad.svg',
    assetSymbol: 'USDC',
    iconSrc: '/assets/vaults/icons/usdc-mon.svg',
    assetIconSrc: '/assets/vaults/icons/usdc-mon.svg',
    href: 'https://yield.accountable.capital/vaults/0xd43F8443Bd91829b36153e33d3e631Bdd3b93844',
  },
  {
    id: 'tbtc-eth',
    name: 'Noon tBTC Yield',
    description: 'Deposit tBTC. Earn yield. Keep your full Bitcoin exposure on Ethereum.',
    chainName: 'Ethereum',
    chainIconSrc: '/assets/chains/ethereum.svg',
    assetSymbol: 'tBTC',
    iconSrc: '/assets/vaults/icons/tbtc-eth.svg',
    assetIconSrc: '/assets/vaults/icons/tbtc-eth.svg',
    href: 'https://yield.accountable.capital/vaults/0x6F055f7b883E9Cb929885263b8779393BF7e394B',
  },
  {
    id: 'wcbtc-citrea',
    name: 'Citrea wCBTC Yield',
    description: 'Deposit wCBTC. Earn yield while your Bitcoin exposure stays on Citrea.',
    chainName: 'Citrea',
    chainIconSrc: '/assets/chains/citrea.svg',
    assetSymbol: 'wcBTC',
    iconSrc: '/assets/vaults/icons/wcbtc-citrea.svg',
    assetIconSrc: '/assets/vaults/icons/wcbtc-citrea.svg',
    href: 'https://yield.accountable.capital/vaults/0x9d384052c46959fE0AA601D312D1B3F7B4eD4E5b',
  },
]
