import { describe, expect, it } from 'vitest'

import { cn, formatNumber, sleep, truncateAddress } from '@/lib/utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4', undefined, 'text-sm')).toBe('px-4 text-sm')
  })
})

describe('truncateAddress', () => {
  it('truncates a valid ethereum address', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234…5678')
  })

  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('')
  })

  it('returns invalid short values unchanged', () => {
    expect(truncateAddress('0x12')).toBe('0x12')
    expect(truncateAddress('not-an-address')).toBe('not-an-address')
  })
})

describe('formatNumber', () => {
  it('formats finite numbers', () => {
    expect(formatNumber(1234.5678)).toContain('1,234')
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
