import { describe, expect, it } from 'vitest'

import { NATIVE_GAS_RESERVE, TRADE_INPUT_DECIMALS } from '@/features/_shared/trade-amounts'
import {
  formatTradePayDisplay,
  formatTradeReceiveDisplay,
  getTradeMaxAmount,
  parseTradePayInput,
  toTradePayAmount,
  toTradeReceiveStoredAmount,
  TRADE_PAY_DECIMALS,
  TRADE_RECEIVE_DISPLAY_DECIMALS,
} from '@/features/_shared/trade-input-format'

describe('trade input format constants', () => {
  it('keeps pay precision at 6dp and receive display at 2dp', () => {
    expect(TRADE_PAY_DECIMALS).toBe(6)
    expect(TRADE_PAY_DECIMALS).toBe(TRADE_INPUT_DECIMALS)
    expect(TRADE_RECEIVE_DISPLAY_DECIMALS).toBe(2)
  })
})

describe('toTradePayAmount', () => {
  it('clips to 6 decimal places without rounding up', () => {
    expect(toTradePayAmount(1.123456789)).toBe(1.123456)
    expect(toTradePayAmount('9.9999999')).toBe(9.999999)
  })

  it('returns undefined for empty, zero, or negative-like empties', () => {
    expect(toTradePayAmount(undefined)).toBeUndefined()
    expect(toTradePayAmount('')).toBeUndefined()
    expect(toTradePayAmount(0)).toBeUndefined()
    expect(toTradePayAmount('0')).toBeUndefined()
  })

  it('accepts whole numbers and small fractions', () => {
    expect(toTradePayAmount(1000)).toBe(1000)
    expect(toTradePayAmount(0.000001)).toBe(0.000001)
  })
})

describe('toTradeReceiveStoredAmount', () => {
  it('preserves full 6dp precision for submit/min-out math', () => {
    expect(toTradeReceiveStoredAmount(12.3456789)).toBe(12.345678)
    expect(toTradeReceiveStoredAmount(1.9999994)).toBe(1.999999)
  })

  it('matches pay clipping so receive state never exceeds input precision', () => {
    const raw = 1234.56789123
    expect(toTradeReceiveStoredAmount(raw)).toBe(toTradePayAmount(raw))
  })
})

describe('formatTradePayDisplay', () => {
  it('adds thousand separators for large amounts', () => {
    expect(formatTradePayDisplay(1234567.89)).toBe('1,234,567.89')
    expect(formatTradePayDisplay(1000)).toBe('1,000')
  })

  it('keeps up to 6 fraction digits and omits trailing zeros', () => {
    expect(formatTradePayDisplay(1.2)).toBe('1.2')
    expect(formatTradePayDisplay(1.123456)).toBe('1.123456')
    expect(formatTradePayDisplay(1.123456789)).toBe('1.123456')
  })

  it('returns empty string when amount is unset', () => {
    expect(formatTradePayDisplay(undefined)).toBe('')
    expect(formatTradePayDisplay(0)).toBe('')
  })
})

describe('formatTradeReceiveDisplay', () => {
  it('shows at most 2 decimal places with thousand separators', () => {
    expect(formatTradeReceiveDisplay(1234.567891)).toBe('1,234.56')
    expect(formatTradeReceiveDisplay(10.1)).toBe('10.1')
    expect(formatTradeReceiveDisplay(10)).toBe('10')
  })

  it('truncates (does not round up) to 2dp for display', () => {
    expect(formatTradeReceiveDisplay(12.345678)).toBe('12.34')
    expect(formatTradeReceiveDisplay(12.349999)).toBe('12.34')
  })

  it('does not change the stored 6dp value used for trading', () => {
    const raw = 99.999999
    const stored = toTradeReceiveStoredAmount(raw)
    expect(stored).toBe(99.999999)
    expect(formatTradeReceiveDisplay(raw)).toBe('99.99')
    // stored value remains full precision after display formatting
    expect(stored).toBe(99.999999)
  })

  it('returns empty string when amount is unset', () => {
    expect(formatTradeReceiveDisplay(undefined)).toBe('')
    expect(formatTradeReceiveDisplay(0)).toBe('')
  })
})

describe('parseTradePayInput', () => {
  it('parses NumericFormat payloads and clips to 6dp', () => {
    expect(parseTradePayInput({ floatValue: 1234.5678912, value: '1,234.5678912' })).toEqual({
      kind: 'commit',
      amount: 1234.567891,
    })
    expect(parseTradePayInput({ floatValue: 1, value: '1' })).toEqual({
      kind: 'commit',
      amount: 1,
    })
  })

  it('clears on empty input', () => {
    expect(parseTradePayInput({ value: '' })).toEqual({ kind: 'clear' })
    expect(parseTradePayInput({ floatValue: undefined, value: '' })).toEqual({ kind: 'clear' })
  })

  it('keeps intermediate drafts (0., 1.) without clearing parent state', () => {
    expect(parseTradePayInput({ floatValue: 0, value: '0' })).toEqual({ kind: 'draft' })
    expect(parseTradePayInput({ floatValue: 0, value: '0.' })).toEqual({ kind: 'draft' })
    expect(parseTradePayInput({ floatValue: 1, value: '1.' })).toEqual({ kind: 'draft' })
  })
})

describe('getTradeMaxAmount', () => {
  it('uses full balance for non-native tokens', () => {
    expect(getTradeMaxAmount(10.1234567, false)).toBe(10.123456)
    expect(getTradeMaxAmount(10, undefined)).toBe(10)
  })

  it(`reserves ${NATIVE_GAS_RESERVE} for native max`, () => {
    expect(getTradeMaxAmount(1, true)).toBe(0.99)
    expect(getTradeMaxAmount(0.005, true)).toBe(0)
    expect(getTradeMaxAmount(NATIVE_GAS_RESERVE, true)).toBe(0)
  })
})
