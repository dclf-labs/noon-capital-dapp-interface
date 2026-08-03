import { describe, expect, it } from 'vitest'

import {
  FOOTER_LEFT_LINKS,
  FOOTER_RIGHT_LINKS,
  FOOTER_SOCIALS,
  NETWORK_SELECTOR_Z_INDEX,
  shellNavForPath,
} from '@/components/shell/constants'
import { safeExternalHref } from '@/lib/safe-external-href'

describe('NETWORK_SELECTOR_Z_INDEX', () => {
  it('stacks above shell chrome and below modals / AppKit', () => {
    expect(NETWORK_SELECTOR_Z_INDEX).toBeGreaterThan(100)
    expect(NETWORK_SELECTOR_Z_INDEX).toBeLessThan(1000)
  })
})

describe('shellNavForPath', () => {
  it('marks Home active on `/` and Buy (`/swap`)', () => {
    expect(shellNavForPath('/').find((item) => item.id === 'home')?.active).toBe(true)
    expect(shellNavForPath('/').find((item) => item.id === 'vaults')?.active).toBe(false)
    expect(shellNavForPath('/swap/buy').find((item) => item.id === 'home')?.active).toBe(true)
    expect(shellNavForPath('/swap/buy').find((item) => item.id === 'vaults')?.active).toBe(false)
  })

  it('marks Vaults active on `/vaults` and nested vault routes', () => {
    expect(shellNavForPath('/vaults').find((i) => i.id === 'vaults')?.active).toBe(true)
    expect(shellNavForPath('/vaults/abc').find((i) => i.id === 'vaults')?.active).toBe(true)
    expect(shellNavForPath('/vaults').find((i) => i.id === 'home')?.active).toBe(false)
  })

  it('marks USN active across stake / unstake / withdraw', () => {
    for (const path of ['/stake', '/unstake', '/withdraw', '/stake/foo']) {
      expect(shellNavForPath(path).find((i) => i.id === 'usn')?.active).toBe(true)
    }
  })

  it('keeps unshipped destinations disabled and never active', () => {
    const nav = shellNavForPath('/governance')
    for (const id of ['dashboard', 'noon', 'points', 'league']) {
      const item = nav.find((entry) => entry.id === id)
      expect(item?.enabled).toBe(false)
      expect(item?.active).toBe(false)
    }
  })

  it('enables shipped destinations', () => {
    const nav = shellNavForPath('/vaults')
    expect(nav.find((i) => i.id === 'home')?.enabled).toBe(true)
    expect(nav.find((i) => i.id === 'usn')?.enabled).toBe(true)
    expect(nav.find((i) => i.id === 'vaults')?.enabled).toBe(true)
  })
})

describe('footer link safety', () => {
  it('uses absolute https destinations for all footer links and socials', () => {
    const hrefs = [
      ...FOOTER_LEFT_LINKS.map((l) => l.href),
      ...FOOTER_RIGHT_LINKS.map((l) => l.href),
      ...FOOTER_SOCIALS.map((l) => l.href),
    ]
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      const safe = safeExternalHref(href)
      expect(safe).toBeTruthy()
      expect(safe?.startsWith('https://')).toBe(true)
    }
  })
})
