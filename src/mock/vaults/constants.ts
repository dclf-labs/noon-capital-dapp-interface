/** Product tabs shown in the vaults hero (Vaults / Buy / Bridge). */
export const PRODUCT_TABS: ReadonlyArray<{
  id: string
  label: string
  href: string
  active?: boolean
}> = [
  { id: 'vaults', label: 'Vaults', href: '/vaults', active: true },
  { id: 'buy', label: 'Buy', href: '/swap/buy' },
  { id: 'bridge', label: 'Bridge', href: '/bridge' },
]
