/** Product tabs shown in the home hero (Vaults / Buy / Bridge). */
export const PRODUCT_TABS: ReadonlyArray<{
  id: 'vaults' | 'buy' | 'bridge'
  label: string
  href: string
}> = [
  { id: 'vaults', label: 'Vaults', href: '/vaults' },
  { id: 'buy', label: 'Buy', href: '/swap/buy' },
  { id: 'bridge', label: 'Bridge', href: '/bridge' },
]

export type ProductTabId = (typeof PRODUCT_TABS)[number]['id']

/** Resolve which product tab is active for the current route. */
export function productTabsForPath(pathname: string): ReadonlyArray<{
  id: ProductTabId
  label: string
  href: string
  active: boolean
}> {
  const activeId = resolveProductTabId(pathname)
  return PRODUCT_TABS.map((tab) => ({
    ...tab,
    active: tab.id === activeId,
  }))
}

export function resolveProductTabId(pathname: string): ProductTabId {
  if (pathname.startsWith('/swap') || pathname === '/buy') return 'buy'
  if (pathname.startsWith('/bridge')) return 'bridge'
  // Home (`/`) and `/vaults` both surface the Vaults product tab.
  return 'vaults'
}
