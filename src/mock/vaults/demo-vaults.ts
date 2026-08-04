import type { VaultListItem } from '@/mock/vaults/types'

/** Stub vault rows for tests / local fixtures — live product vaults come from `useProductVaults`. */
export const DEMO_VAULTS: VaultListItem[] = [
  {
    id: 'usdc-mon',
    name: 'sUSN Delta Neutral Yield Vault',
    description:
      'Deposit USDC into a delta-neutral strategy and earn yield while risk is managed automatically.',
    chainName: 'Monad',
    chainIconSrc: '/assets/chains/monad.svg',
    assetSymbol: 'USDC',
    assetIconSrc: '/assets/vaults/icons/usdc-mon.svg',
    iconSrc: '/assets/vaults/icons/usdc-mon.svg',
    apyLabel: '17.55%',
    tvlLabel: '$5.7M',
    href: 'https://yield.accountable.capital/vaults/0xd43F8443Bd91829b36153e33d3e631Bdd3b93844',
  },
  {
    id: 'tbtc-eth',
    name: 'Noon tBTC Yield',
    description: 'Deposit tBTC. Earn yield. Keep your full Bitcoin exposure on Ethereum.',
    chainName: 'Ethereum',
    chainIconSrc: '/assets/chains/ethereum.svg',
    assetSymbol: 'tBTC',
    assetIconSrc: '/assets/vaults/icons/tbtc-eth.svg',
    iconSrc: '/assets/vaults/icons/tbtc-eth.svg',
    apyLabel: '4.16%',
    tvlLabel: '$851.0k',
    href: 'https://yield.accountable.capital/vaults/0x6F055f7b883E9Cb929885263b8779393BF7e394B',
  },
  {
    id: 'wcbtc-citrea',
    name: 'Citrea wCBTC Yield',
    description: 'Deposit wCBTC. Earn yield while your Bitcoin exposure stays on Citrea.',
    chainName: 'Citrea',
    chainIconSrc: '/assets/chains/citrea.svg',
    assetSymbol: 'wcBTC',
    assetIconSrc: '/assets/vaults/icons/wcbtc-citrea.svg',
    iconSrc: '/assets/vaults/icons/wcbtc-citrea.svg',
    apyLabel: '2.13%',
    tvlLabel: '$775.3k',
    href: 'https://yield.accountable.capital/vaults/0x9d384052c46959fE0AA601D312D1B3F7B4eD4E5b',
  },
]
