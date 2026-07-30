import { describe, expect, it } from 'vitest'

import { bnToStr, strToBn, toNum } from '@/lib/format'

describe('format helpers used by previews', () => {
  it('round-trips decimal amounts through bigint', () => {
    const amount = strToBn(1.5, 6)
    expect(bnToStr(amount, 6)).toBe('1.5')
  })

  it('coerces numeric-ish values safely', () => {
    expect(toNum('2.5')).toBe(2.5)
    expect(toNum(undefined)).toBe(0)
    expect(toNum(NaN)).toBe(0)
  })
})
