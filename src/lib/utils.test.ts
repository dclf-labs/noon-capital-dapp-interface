import { describe, expect, it } from 'vitest'

import { calculateGovernanceCurve, cn, formatNumber, sleep, truncateAddress } from '@/lib/utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4', undefined, 'text-sm')).toBe('px-4 text-sm')
  })
})

describe('truncateAddress', () => {
  const evm = '0x1234567890abcdef1234567890abcdef12345678'
  const starknet = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
  const sui = '0x2::sui::SUI_PLACEHOLDER_ADDRESS_LONG_ENOUGH_FOR_TRUNCATION'

  it('truncates a long EVM address', () => {
    expect(truncateAddress(evm)).toBe('0x1234…5678')
  })

  it('respects a custom char window', () => {
    expect(truncateAddress(evm, 6)).toBe('0x123456…345678')
  })

  it('truncates Starknet and Sui-style addresses', () => {
    expect(truncateAddress(starknet)).toMatch(/^0x049d…4dc7$/)
    expect(truncateAddress(sui).includes('…')).toBe(true)
  })

  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('')
  })

  it('returns short values unchanged', () => {
    expect(truncateAddress('0x12')).toBe('0x12')
    expect(truncateAddress('not-an-address')).toBe('not-an-address')
    expect(truncateAddress('0x1234567890abcdef')).toBe('0x1234567890abcdef')
  })
})

describe('formatNumber', () => {
  it('formats finite numbers', () => {
    expect(formatNumber(1234.5678)).toContain('1,234')
  })

  it('parses numeric strings', () => {
    expect(formatNumber('1234.5')).toContain('1,234')
  })

  it('returns an em dash for invalid or non-finite input', () => {
    expect(formatNumber('not-a-number')).toBe('—')
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatNumber(Number.NaN)).toBe('—')
  })
})

describe('sleep', () => {
  it('resolves after the given delay', async () => {
    await expect(sleep(1)).resolves.toBeUndefined()
  })
})

describe('calculateGovernanceCurve', () => {
  it('uses discrete month breakpoints', () => {
    expect(calculateGovernanceCurve(0, 365, 3)).toBeCloseTo(0.1696)
    expect(calculateGovernanceCurve(0, 365, 6)).toBeCloseTo(0.2985)
    expect(calculateGovernanceCurve(0, 365, 9)).toBeCloseTo(0.5456)
    expect(calculateGovernanceCurve(0, 365, 12)).toBe(1)
    expect(calculateGovernanceCurve(0, 365, 24)).toBe(1)
  })

  it('interpolates continuous staking duration', () => {
    expect(calculateGovernanceCurve(0)).toBeCloseTo(0.09)
    expect(calculateGovernanceCurve(365)).toBeCloseTo(0.99)
    expect(calculateGovernanceCurve(500)).toBeCloseTo(0.99)
  })
})
