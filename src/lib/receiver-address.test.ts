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
const STARKNET = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
const STARKNET_UNPADDED = `0x${STARKNET.slice(3)}`
const SUI = `0x${'1'.repeat(64)}`

describe('getReceiverAddressError — Starknet / Sui / EVM', () => {
  it('starknet accepts full and one-zero-omitted addresses', () => {
    expect(getReceiverAddressError('starknet', undefined)).toBeNull()
    expect(getReceiverAddressError('starknet', '')).toBeNull()
    expect(getReceiverAddressError('starknet', STARKNET)).toBeNull()
    expect(getReceiverAddressError('starknet', STARKNET_UNPADDED)).toBeNull()
    expect(getReceiverAddressError('starknet', STARKNET.slice(2))).toBeNull()
  })

  it('starknet rejects EVM paste, short hex, and invalid felt252', () => {
    expect(getReceiverAddressError('starknet', EVM)).toBe('evm_paste')
    expect(getReceiverAddressError('starknet', 'not-hex!!!')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', '0x')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', '123')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', '0xabc')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', 'abc')).toBe('invalid_starknet')
    expect(getReceiverAddressError('starknet', `0x${'f'.repeat(64)}`)).toBe('invalid_starknet')
  })

  it('sui accepts full 64-hex addresses only', () => {
    expect(getReceiverAddressError('sui', undefined)).toBeNull()
    expect(getReceiverAddressError('sui', SUI)).toBeNull()
    expect(getReceiverAddressError('sui', SUI.slice(2))).toBeNull()
  })

  it('sui rejects EVM paste and short / invalid hex', () => {
    expect(getReceiverAddressError('sui', EVM)).toBe('evm_paste')
    expect(getReceiverAddressError('sui', '0xgg')).toBe('invalid_sui')
    expect(getReceiverAddressError('sui', '123')).toBe('invalid_sui')
    expect(getReceiverAddressError('sui', '0x1')).toBe('invalid_sui')
    expect(getReceiverAddressError('sui', '0xabc')).toBe('invalid_sui')
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

  it('starknet accepts full / unpadded Starknet and rejects short hex / EVM', () => {
    expect(isReceiverAddressValid('starknet', STARKNET)).toBe(true)
    expect(isReceiverAddressValid('starknet', STARKNET_UNPADDED)).toBe(true)
    expect(isReceiverAddressValid('starknet', 'abc')).toBe(false)
    expect(isReceiverAddressValid('starknet', '123')).toBe(false)
    expect(isReceiverAddressValid('starknet', EVM)).toBe(false)
  })

  it('sui accepts full Sui and rejects short hex / EVM', () => {
    expect(isReceiverAddressValid('sui', SUI)).toBe(true)
    expect(isReceiverAddressValid('sui', '1')).toBe(false)
    expect(isReceiverAddressValid('sui', '123')).toBe(false)
    expect(isReceiverAddressValid('sui', '0x1')).toBe(false)
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
    expect(isStoredReceiverAddressValid('starknet', '123')).toBe(false)
    expect(isStoredReceiverAddressValid('sui', '0x1')).toBe(false)
  })
})

describe('sanitizeReceiverAddress — family-strict', () => {
  it('sanitizes per family and returns undefined for invalid or cross-family paste', () => {
    expect(sanitizeReceiverAddress('evm', EVM)).toMatch(/^0x/)
    expect(sanitizeReceiverAddress('starknet', STARKNET)).toBe(STARKNET)
    expect(sanitizeReceiverAddress('starknet', STARKNET_UNPADDED)).toBe(STARKNET)
    expect(sanitizeReceiverAddress('starknet', EVM)).toBeUndefined()
    expect(sanitizeStarknetAddress('abc')).toBeUndefined()
    expect(sanitizeStarknetAddress('123')).toBeUndefined()
    expect(sanitizeReceiverAddress('sui', SUI)).toBe(SUI)
    expect(sanitizeReceiverAddress('sui', '0x1')).toBeUndefined()
    expect(sanitizeReceiverAddress('sui', '123')).toBeUndefined()
    expect(sanitizeReceiverAddress('sui', EVM)).toBeUndefined()
  })
})
