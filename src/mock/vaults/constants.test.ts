import { describe, expect, it } from 'vitest'

import { productTabsForPath, resolveProductTabId } from '@/mock/vaults/constants'

describe('resolveProductTabId', () => {
  it('maps home and vaults routes to vaults', () => {
    expect(resolveProductTabId('/')).toBe('vaults')
    expect(resolveProductTabId('/vaults')).toBe('vaults')
  })

  it('maps swap routes to buy', () => {
    expect(resolveProductTabId('/swap/buy')).toBe('buy')
    expect(resolveProductTabId('/swap/sell')).toBe('buy')
  })

  it('maps bridge routes to bridge', () => {
    expect(resolveProductTabId('/bridge')).toBe('bridge')
  })

  it('maps the full mint/stake cluster to usn', () => {
    expect(resolveProductTabId('/mint')).toBe('usn')
    expect(resolveProductTabId('/stake')).toBe('usn')
    expect(resolveProductTabId('/withdraw')).toBe('usn')
  })
})

describe('productTabsForPath', () => {
  it('marks exactly one tab active among the three home product tabs', () => {
    const tabs = productTabsForPath('/swap/buy')
    expect(tabs).toHaveLength(3)
    expect(tabs.filter((t) => t.active)).toHaveLength(1)
    expect(tabs.find((t) => t.id === 'buy')?.active).toBe(true)
    expect(tabs.find((t) => t.id === 'vaults')?.active).toBe(false)
  })
})
