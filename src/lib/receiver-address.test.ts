import { describe, expect, it } from 'vitest'

import {
  filterReceiverAddressInput,
  getReceiverAddressError,
  isReceiverAddressValid,
  isStoredReceiverAddressValid,
  sanitizeReceiverAddress,
  sanitizeStarknetAddress,
} from '@/lib/receiver-address'

const EVM = '0x1111111111111111111111111111111111111111'
const STARKNET = `0x0${'a'.repeat(63)}`
const SUI = `0x${'1'.repeat(64)}`

describe('getReceiverAddressError — Starknet / Sui / EVM', () => {
  it('starknet rejects EVM paste and invalid hex, accepts Starknet', () => {
    expect(getReceiverAddressError('starknet', undefined)).toBeNull()
    expect(getReceiverAddressError('starknet', '')).toBeNull()
    expect(getReceiverAddressError('starknet', EVM)).toBe('evm_paste')
    expect(getReceiverAddressError('starknet', 'not-hex!!!')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', '0x')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', STARKNET)).toBeNull()
    expect(getReceiverAddressError('starknet', '0xabc')).toBeNull()
    expect(getReceiverAddressError('starknet', 'abc')).toBeNull()
  })

  it('sui rejects EVM paste and invalid hex, accepts Sui', () => {
    expect(getReceiverAddressError('sui', undefined)).toBeNull()
    expect(getReceiverAddressError('sui', EVM)).toBe('evm_paste')
    expect(getReceiverAddressError('sui', '0xgg')).toBe('invalid_sui')
    expect(getReceiverAddressError('sui', SUI)).toBeNull()
    expect(getReceiverAddressError('sui', '0x1')).toBeNull()
  })

  it('evm only accepts EVM addresses', () => {
    expect(getReceiverAddressError('evm', EVM)).toBeNull()
    expect(getReceiverAddressError('evm', STARKNET)).toBe('invalid_evm')
    expect(getReceiverAddressError('evm', SUI)).toBe('invalid_evm')
  })
})

describe('filterReceiverAddressInput — hex-only for Starknet / Sui', () => {
  it('strips non-hex for starknet and sui, preserves 0x typing', () => {
    expect(filterReceiverAddressInput('starknet', '0xABC!!!')).toBe('0xABC')
    expect(filterReceiverAddressInput('sui', '0x1zz')).toBe('0x1')
    expect(filterReceiverAddressInput('starknet', 'deadbeef!!')).toBe('deadbeef')
    expect(filterReceiverAddressInput('starknet', '0')).toBe('0')
    expect(filterReceiverAddressInput('starknet', '0x')).toBe('0x')
    expect(filterReceiverAddressInput('evm', '0xAbc')).toBe('0xAbc')
  })
})

describe('isReceiverAddressValid — family-strict (sanitize path)', () => {
  it('evm accepts only EVM addresses', () => {
    expect(isReceiverAddressValid('evm', EVM)).toBe(true)
    expect(isReceiverAddressValid('evm', STARKNET)).toBe(false)
    expect(isReceiverAddressValid('evm', SUI)).toBe(false)
  })

  it('starknet accepts Starknet and rejects EVM', () => {
    expect(isReceiverAddressValid('starknet', STARKNET)).toBe(true)
    expect(isReceiverAddressValid('starknet', 'abc')).toBe(true)
    expect(isReceiverAddressValid('starknet', EVM)).toBe(false)
  })

  it('sui accepts Sui and rejects EVM paste', () => {
    expect(isReceiverAddressValid('sui', SUI)).toBe(true)
    expect(isReceiverAddressValid('sui', '1')).toBe(true)
    expect(isReceiverAddressValid('sui', EVM)).toBe(false)
  })
})

describe('isStoredReceiverAddressValid — normalized stored values', () => {
  it('validates each family without re-prefixing', () => {
    expect(isStoredReceiverAddressValid('evm', EVM)).toBe(true)
    expect(isStoredReceiverAddressValid('starknet', STARKNET)).toBe(true)
    expect(isStoredReceiverAddressValid('sui', SUI)).toBe(true)
    expect(isStoredReceiverAddressValid('starknet', EVM)).toBe(false)
    expect(isStoredReceiverAddressValid('sui', EVM)).toBe(false)
  })
})

describe('sanitizeReceiverAddress — family-strict', () => {
  it('sanitizes per family and returns undefined for cross-family paste', () => {
    expect(sanitizeReceiverAddress('evm', EVM)).toMatch(/^0x/)
    expect(sanitizeReceiverAddress('starknet', STARKNET)).toBe(STARKNET)
    expect(sanitizeReceiverAddress('starknet', EVM)).toBeUndefined()
    expect(sanitizeStarknetAddress('abc')).toBe('0xabc')
    expect(sanitizeReceiverAddress('sui', '0x1')).toBe(`0x${'0'.repeat(63)}1`)
    expect(sanitizeReceiverAddress('sui', EVM)).toBeUndefined()
  })
})
