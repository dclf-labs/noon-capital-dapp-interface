import { describe, expect, it } from 'vitest'

import { bnToStr, down, rawUnitsToNumber, strToBn, toNum, up } from '@/lib/format'

describe('format helpers used by previews', () => {
  it('round-trips decimal amounts through bigint', () => {
    const amount = strToBn(1.5, 6)
    expect(bnToStr(amount, 6)).toBe('1.5')
  })

  it('treats decimals 0 as valid (not fallback to 18)', () => {
    expect(bnToStr(5n, 0)).toBe('5')
    expect(strToBn('5', 0)).toBe(5n)
  })

  it('converts raw units to a display number', () => {
    expect(rawUnitsToNumber(1500000n, 6)).toBe(1.5)
    expect(rawUnitsToNumber(undefined, 18)).toBe(0)
  })

  it('coerces numeric-ish values safely', () => {
    expect(toNum('2.5')).toBe(2.5)
    expect(toNum(undefined)).toBe(0)
    expect(toNum(NaN)).toBe(0)
  })

  it('clips trade amounts without Math.pow overflow', () => {
    expect(down(1.123456789, 6)).toBe(1.123456)
    expect(down(10, 6)).toBe(10)
    expect(up(1.1234561, 6)).toBeCloseTo(1.123457, 6)
  })
})
