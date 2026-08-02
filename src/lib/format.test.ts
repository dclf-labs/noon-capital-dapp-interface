import { describe, expect, it } from 'vitest'

import {
  bnToInt,
  bnToStr,
  ceil,
  down,
  floor,
  rawUnitsToNumber,
  round,
  strToBn,
  toAbsNum,
  toBn,
  toNum,
  toStr,
  up,
} from '@/lib/format'

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
    expect(toStr(12n)).toBe('12')
    expect(toAbsNum(-3.5)).toBe(3.5)
    expect(toBn('42')).toBe(42n)
    expect(ceil(1.1)).toBe(2)
    expect(floor(1.9)).toBe(1)
    expect(round(1.5)).toBe(2)
    expect(bnToInt(1_500_000n, 6)).toBe(2)
  })

  it('clips trade amounts without Math.pow overflow', () => {
    expect(down(1.123456789, 6)).toBe(1.123456)
    expect(down(10, 6)).toBe(10)
    expect(down(-1.129, 2)).toBe(-1.12)
    expect(down(1.5, 0)).toBe(1)
    expect(down(1.5, -1)).toBe(0)
    expect(up(1.1234561, 6)).toBeCloseTo(1.123457, 6)
    expect(up(1.12, 2)).toBe(1.12)
    expect(up(-1.121, 2)).toBeCloseTo(-1.13, 8)
    expect(up(1.5, 0)).toBe(2)
  })

  it('returns safe zeros for invalid bigint conversions', () => {
    expect(bnToStr('not-a-number' as never, 18)).toBe('0')
    expect(strToBn('not.a.number', 18)).toBe(0n)
    expect(toBn({} as never)).toBe(0n)
  })
})
