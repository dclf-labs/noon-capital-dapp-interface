/**
 * Home product Louize tabs (Vaults / Buy / Bridge) and per-cluster action tabs.
 * USN / sUSN pages share one action strip (Mint|Redeem|Stake|Unstake|Withdraw)
 * and never show the home Vaults/Buy/Bridge tabs.
 */

export type ProductTab = {
  id: string
  label: string
  href: string
}

/** Top-level home product destinations (Vaults / Buy / Bridge). */
export const PRODUCT_TABS: ReadonlyArray<ProductTab> = [
  { id: 'vaults', label: 'Vaults', href: '/vaults' },
  { id: 'buy', label: 'Buy', href: '/swap/buy' },
  { id: 'bridge', label: 'Bridge', href: '/bridge' },
]

export type ProductTabId = (typeof PRODUCT_TABS)[number]['id'] | 'usn'

/** True for mint/redeem/stake/unstake/withdraw — no home product tab strip. */
export function isUsnOrSusnPath(pathname: string): boolean {
  return (
    pathname.startsWith('/mint') ||
    pathname.startsWith('/redeem') ||
    pathname.startsWith('/stake') ||
    pathname.startsWith('/unstake') ||
    pathname.startsWith('/withdraw')
  )
}

/**
 * Full USN / sUSN cluster — mint/redeem USN and stake/unstake/withdraw sUSN.
 * Shown from the sidebar “USN / sUSN” entry on every cluster route.
 */
export const USN_SUSN_ACTION_TABS: ReadonlyArray<ProductTab> = [
  { id: 'mint', label: 'Mint', href: '/mint' },
  { id: 'redeem', label: 'Redeem', href: '/redeem' },
  { id: 'stake', label: 'Stake', href: '/stake' },
  { id: 'unstake', label: 'Unstake', href: '/unstake' },
  { id: 'withdraw', label: 'Withdraw', href: '/withdraw' },
]

/** @deprecated Use USN_SUSN_ACTION_TABS — kept as alias for older imports. */
export const USN_ACTION_TABS = USN_SUSN_ACTION_TABS

/** @deprecated Use USN_SUSN_ACTION_TABS — kept as alias for older imports. */
export const SUSN_ACTION_TABS = USN_SUSN_ACTION_TABS

export function resolveProductTabId(pathname: string): ProductTabId {
  if (pathname.startsWith('/swap') || pathname === '/buy') return 'buy'
  if (pathname.startsWith('/bridge')) return 'bridge'
  if (isUsnOrSusnPath(pathname)) return 'usn'
  return 'vaults'
}

export function productTabsForPath(
  pathname: string,
): ReadonlyArray<ProductTab & { active: boolean }> {
  const activeId = resolveProductTabId(pathname)
  return PRODUCT_TABS.map((tab) => ({
    ...tab,
    active: tab.id === activeId,
  }))
}

export function actionTabsForPath(
  pathname: string,
): ReadonlyArray<ProductTab & { active: boolean }> | null {
  if (isUsnOrSusnPath(pathname)) {
    return USN_SUSN_ACTION_TABS.map((tab) => ({
      ...tab,
      active: pathname.startsWith(tab.href),
    }))
  }
  return null
}

/**
 * Hero subtitles — home products + per-route USN/sUSN copy.
 * Mint/redeem mention whitelist; unstake/withdraw mention the 7-day cooling-off.
 */
export const PRODUCT_HERO_SUBTITLES = {
  vaults: 'Vaults are the easiest way to generate returns within Noon’s ecosystem.',
  buy: 'Simplest way to buy USN or sUSN, with no added fees.',
  sell: 'Simplest way to sell USN or sUSN, with no added fees.',
  bridge: 'Move USN and sUSN between supported networks.',
  mint: 'Mint USN from approved collateral on Ethereum — whitelisted wallets only.',
  redeem: 'Redeem USN for collateral on Ethereum — whitelisted wallets only.',
  stake: 'Stake USN to receive sUSN and earn yield on Ethereum.',
  unstake: 'Unstake sUSN to start a 7-day cooling-off period before claiming USN.',
  withdraw: 'Claim USN from matured unstake requests after the cooling-off period.',
  /** Fallback when a USN/sUSN route has no more specific key. */
  usn: 'Mint or redeem USN, stake for sUSN, and claim after the unstake cooldown.',
  susn: 'Mint or redeem USN, stake for sUSN, and claim after the unstake cooldown.',
} as const

/** Resolve hero subtitle for the current path (per-tab on USN/sUSN). */
export function heroSubtitleForPath(pathname: string): string {
  if (pathname.startsWith('/swap/sell')) return PRODUCT_HERO_SUBTITLES.sell
  if (pathname.startsWith('/mint')) return PRODUCT_HERO_SUBTITLES.mint
  if (pathname.startsWith('/redeem')) return PRODUCT_HERO_SUBTITLES.redeem
  if (pathname.startsWith('/stake')) return PRODUCT_HERO_SUBTITLES.stake
  if (pathname.startsWith('/unstake')) return PRODUCT_HERO_SUBTITLES.unstake
  if (pathname.startsWith('/withdraw')) return PRODUCT_HERO_SUBTITLES.withdraw
  if (pathname.startsWith('/swap')) return PRODUCT_HERO_SUBTITLES.buy
  if (pathname.startsWith('/bridge')) return PRODUCT_HERO_SUBTITLES.bridge
  return PRODUCT_HERO_SUBTITLES.vaults
}
