import type { SidebarCardStackTabsItem } from '@/features/shell/sidebar-card-stack/context'

export const RECENT_TRANSACTIONS_PAGE_SIZE = 6

export const DAPP_THEME_UI_STORAGE_KEY = 'noon-capital-dapp-theme'
export const WELCOME_NOTICE_ACCEPTED_KEY = 'noon-capital-welcome-notice-accepted'
/** Persisted dapp product network (EVM / Starknet / Sui) across pages + reloads. */
export const ACTIVE_CHAIN_STORAGE_KEY = 'noon-active-chain-id'

/**
 * Navigation tree (icon components deferred until assets / UI kit land).
 * `iconSlug` maps to `/assets/menu/<slug>.svg` once menu SVGs are copied.
 */
export const NAVIGATION_MENU = [
  { title: 'Dashboard', url: '/', iconSlug: 'dashboard' },
  {
    title: 'Stablecoin Assets',
    url: '/protocol',
    iconSlug: 'protocol',
    items: [
      { title: 'Buy and Sell', iconSlug: 'swap', url: '/swap/buy' },
      { title: 'Mint and Redeem', iconSlug: 'usn', url: '/mint' },
      { title: 'Staking', iconSlug: 'susn', url: '/stake' },
      { title: 'Bridge', iconSlug: 'bridge', url: '/bridge' },
    ],
  },
  { title: 'Governance Assets', url: '/governance', iconSlug: 'noon' },
  {
    title: 'Rewards',
    url: '/rewards',
    iconSlug: 'rewards',
    items: [
      { title: 'In-Season Points', iconSlug: 'rewards', url: '/points' },
      { title: 'Referrals', iconSlug: 'rewards', url: '/referrals' },
      { title: 'Noon League', iconSlug: 'rewards', url: '/league' },
    ],
  },
  { title: 'Vaults', url: '/vaults', iconSlug: 'vaults' },
  {
    title: 'Other links',
    url: '#',
    iconSlug: 'dashboard',
    items: [
      { title: 'Solvency', iconSlug: null, url: 'https://noon.accountable.capital/' },
      { title: 'Docs', iconSlug: null, url: 'https://docs.noon.capital/' },
    ],
  },
] as const

export const DESKTOP_SIDEBAR_Cardstack_TABS: {
  id: SidebarCardStackTabsItem
  label: string
  apiResponseField: string
  suffix?: string
  prefix?: string
}[] = [
  {
    id: 'tvl' as SidebarCardStackTabsItem,
    label: 'TVL',
    apiResponseField: 'tvl',
    prefix: '$',
  },
  {
    id: 'apy-7d' as SidebarCardStackTabsItem,
    label: 'APY, 7D',
    apiResponseField: 'sevenDayApy',
    suffix: '%',
  },
  {
    id: 'apy-28d' as SidebarCardStackTabsItem,
    label: 'APY, 28D',
    apiResponseField: 'twentyEightDayApy',
    suffix: '%',
  },
]

export const TVL_BREAKDOWN_CHART_COLORS: { [index: number]: { fill: string; stroke: string } } = {
  1: { fill: '#FFB45226', stroke: '#FFB452' },
  2: { fill: '#9EB2FF1A', stroke: '#9EB2FF' },
  3: { fill: '#04D5B226', stroke: '#00DDB8' },
  4: { fill: '#FF6B6B26', stroke: '#FF6B6B' },
  6: { fill: '#FF6B6B14', stroke: '#FF6B6BB2' },
  5: { fill: '#D504CE26', stroke: '#DD00D5' },
  7: { fill: '#9EB2FF14', stroke: '#9EB2FFB2' },
}
