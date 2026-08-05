import { describe, expect, it } from 'vitest'

import {
  actionTabsForPath,
  heroSubtitleForPath,
  isUsnOrSusnPath,
  PRODUCT_HERO_SUBTITLES,
  PRODUCT_TABS,
  productTabsForPath,
  resolveProductTabId,
  USN_SUSN_ACTION_TABS,
} from '@/mock/_shared/product-tabs'

describe('resolveProductTabId', () => {
  it('maps vaults, buy, bridge, and the usn/susn cluster', () => {
    expect(resolveProductTabId('/')).toBe('vaults')
    expect(resolveProductTabId('/vaults')).toBe('vaults')
    expect(resolveProductTabId('/swap/buy')).toBe('buy')
    expect(resolveProductTabId('/swap/sell')).toBe('buy')
    expect(resolveProductTabId('/bridge')).toBe('bridge')
    expect(resolveProductTabId('/mint')).toBe('usn')
    expect(resolveProductTabId('/redeem')).toBe('usn')
    expect(resolveProductTabId('/stake')).toBe('usn')
    expect(resolveProductTabId('/unstake')).toBe('usn')
    expect(resolveProductTabId('/withdraw')).toBe('usn')
  })
})

describe('isUsnOrSusnPath', () => {
  it('is true for the full USN / sUSN route cluster', () => {
    expect(isUsnOrSusnPath('/mint')).toBe(true)
    expect(isUsnOrSusnPath('/stake')).toBe(true)
    expect(isUsnOrSusnPath('/withdraw')).toBe(true)
    expect(isUsnOrSusnPath('/vaults')).toBe(false)
    expect(isUsnOrSusnPath('/swap/buy')).toBe(false)
    expect(isUsnOrSusnPath('/bridge')).toBe(false)
  })
})

describe('productTabsForPath', () => {
  it('exposes only home tabs Vaults, Buy, and Bridge', () => {
    expect(PRODUCT_TABS.map((t) => t.id)).toEqual(['vaults', 'buy', 'bridge'])
    const tabs = productTabsForPath('/swap/buy')
    expect(tabs.filter((t) => t.active)).toHaveLength(1)
    expect(tabs.find((t) => t.id === 'buy')?.active).toBe(true)
  })

  it('marks no home tab active on USN / sUSN routes', () => {
    expect(productTabsForPath('/mint').every((t) => !t.active)).toBe(true)
    expect(productTabsForPath('/stake').every((t) => !t.active)).toBe(true)
  })
})

describe('actionTabsForPath', () => {
  it('returns the USN/sUSN action strip in-cluster and nothing on home surfaces', () => {
    expect(actionTabsForPath('/swap/buy')).toBeNull()
    expect(actionTabsForPath('/swap/sell')).toBeNull()
    expect(USN_SUSN_ACTION_TABS.map((t) => t.id)).toEqual([
      'mint',
      'redeem',
      'stake',
      'unstake',
      'withdraw',
    ])
    expect(actionTabsForPath('/stake')?.map((t) => t.id)).toEqual([
      'mint',
      'redeem',
      'stake',
      'unstake',
      'withdraw',
    ])
    expect(actionTabsForPath('/mint')?.find((t) => t.id === 'mint')?.active).toBe(true)
    expect(actionTabsForPath('/withdraw')?.find((t) => t.id === 'withdraw')?.active).toBe(true)
    expect(actionTabsForPath('/vaults')).toBeNull()
  })
})

describe('heroSubtitleForPath', () => {
  it('returns per-tab USN/sUSN copy (whitelist + 7-day cooldown)', () => {
    expect(heroSubtitleForPath('/mint')).toBe(PRODUCT_HERO_SUBTITLES.mint)
    expect(heroSubtitleForPath('/redeem')).toBe(PRODUCT_HERO_SUBTITLES.redeem)
    expect(heroSubtitleForPath('/stake')).toBe(PRODUCT_HERO_SUBTITLES.stake)
    expect(heroSubtitleForPath('/unstake')).toBe(PRODUCT_HERO_SUBTITLES.unstake)
    expect(heroSubtitleForPath('/withdraw')).toBe(PRODUCT_HERO_SUBTITLES.withdraw)
    expect(PRODUCT_HERO_SUBTITLES.mint).toMatch(/whitelisted/i)
    expect(PRODUCT_HERO_SUBTITLES.unstake).toMatch(/7-day/i)
    expect(PRODUCT_HERO_SUBTITLES.withdraw).toMatch(/cooling-off|claim/i)
  })
})
