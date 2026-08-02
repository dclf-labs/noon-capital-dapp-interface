import { describe, expect, it } from 'vitest'

import {
  bnToInt,
  ceil,
  floor,
  toAbsNum,
  toBn,
  toIntlCompactInt,
  toIntlCompactStr,
  toIntlCompactStrWithMaxFractionDigits4,
  toIntlInt,
  toIntlStr,
  toIntlStrWithMaxFractionDigits4,
  toStr,
} from '@/lib/format'

describe('format display helpers', () => {
  it('covers basic numeric helpers', () => {
    expect(ceil(1.1)).toBe(2)
    expect(floor(1.9)).toBe(1)
    expect(toAbsNum(-3)).toBe(3)
    expect(toBn(7)).toBe(7n)
    expect(toStr(9)).toBe('9')
    expect(bnToInt(1_500_000n, 6)).toBe(2)
  })

  it('formats intl strings with dust and compact thresholds', () => {
    // Dust branch needs precision high enough that down() keeps a positive remainder.
    expect(toIntlStr(0.001, 4)).toBe('<0.01')
    // toIntlStr uses down()/floor semantics, not round.
    expect(toIntlStr(12.3456, 2)).toContain('12.34')
    expect(toIntlStrWithMaxFractionDigits4(1.23456, 4)).toContain('1.2345')
    expect(toIntlCompactStr(50_000)).toContain('50')
    expect(toIntlCompactStr(1_500_000)).toMatch(/M|1\.5/)
    expect(toIntlCompactStrWithMaxFractionDigits4(2_000_000)).toMatch(/M|2/)
    expect(toIntlInt(1234)).toBe('1,234')
    expect(toIntlInt(0.4)).toBe('0')
    expect(toIntlCompactInt(1_500_000)).toMatch(/M|1\.5/)
    expect(toIntlCompactInt(42)).toBe('42')
  })
})
