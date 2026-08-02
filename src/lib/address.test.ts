import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'

import {
  getAddressOrZeroAddress,
  getLayerZeroReceiverAddress,
  isAddressValid,
  isEVMAddressValid,
  isStarknetAddressValid,
  isSuiAddressValid,
  normalizeSuiAddress,
  sanitizeEVMAddress,
  sanitizeInput,
  sanitizeSuiAddress,
  toBytes32Recipient,
} from '@/lib/address'

const EVM = '0x1111111111111111111111111111111111111111'
const SUI = `0x${'1'.repeat(64)}`
const STARKNET = `0x0${'a'.repeat(63)}`

describe('EVM addresses', () => {
  it('accepts checksummable non-zero addresses', () => {
    expect(isEVMAddressValid(EVM)).toBe(true)
    expect(isEVMAddressValid(EVM.toLowerCase() as `0x${string}`)).toBe(true)
    expect(isEVMAddressValid(zeroAddress)).toBe(false)
    expect(isEVMAddressValid(undefined)).toBe(false)
  })

  it('sanitizes pasted EVM inputs', () => {
    expect(sanitizeEVMAddress(EVM)).toMatch(/^0x/)
    expect(sanitizeEVMAddress(`  ${EVM}  `)).toMatch(/^0x/)
    expect(sanitizeEVMAddress(zeroAddress)).toBeUndefined()
    expect(sanitizeEVMAddress('not-an-address')).toBeUndefined()
    expect(getAddressOrZeroAddress(undefined)).toBe(zeroAddress)
    expect(getAddressOrZeroAddress(EVM)).toBe(EVM)
  })
})

describe('Starknet addresses', () => {
  it('accepts 64-hex Starknet addresses and rejects EVM', () => {
    expect(isStarknetAddressValid(STARKNET)).toBe(true)
    expect(isStarknetAddressValid(`0x${'b'.repeat(63)}`)).toBe(true)
    expect(isStarknetAddressValid(`0x${'a'.repeat(64)}`)).toBe(true)
    expect(isStarknetAddressValid(`0x${'f'.repeat(64)}`)).toBe(true)
    expect(isStarknetAddressValid(EVM)).toBe(false)
    expect(isStarknetAddressValid(undefined)).toBe(false)
    expect(isStarknetAddressValid('0xabc')).toBe(true)
    expect(isStarknetAddressValid('0x0')).toBe(false)
    expect(isStarknetAddressValid(`0x${'0'.repeat(64)}`)).toBe(false)
    expect(isStarknetAddressValid(`0x${'a'.repeat(65)}`)).toBe(false)
  })
})

describe('Sui addresses', () => {
  it('normalizes and validates short / full forms', () => {
    expect(isSuiAddressValid(SUI)).toBe(true)
    expect(isSuiAddressValid('0x1')).toBe(true)
    expect(normalizeSuiAddress('0x1')).toBe(`0x${'0'.repeat(63)}1`)
    expect(normalizeSuiAddress('1')).toBe(`0x${'0'.repeat(63)}1`)
    expect(normalizeSuiAddress('')).toBeUndefined()
    expect(normalizeSuiAddress('0xgg')).toBeUndefined()
    expect(normalizeSuiAddress(`0x${'0'.repeat(64)}`)).toBeUndefined()
    expect(normalizeSuiAddress(`0x${'1'.repeat(65)}`)).toBeUndefined()
  })

  it('rejects pasted EVM addresses as Sui', () => {
    expect(normalizeSuiAddress(EVM)).toBeUndefined()
    expect(isSuiAddressValid(EVM)).toBe(false)
  })

  it('sanitizes Sui inputs after HTML strip', () => {
    expect(sanitizeSuiAddress('0x1')).toBe(`0x${'0'.repeat(63)}1`)
    expect(sanitizeSuiAddress('')).toBeUndefined()
    expect(sanitizeSuiAddress('<b>0x1</b>')).toBe(`0x${'0'.repeat(63)}1`)
  })
})

describe('cross-family address helpers', () => {
  it('accepts any supported family via isAddressValid', () => {
    expect(isAddressValid(EVM)).toBe(true)
    expect(isAddressValid(SUI)).toBe(true)
    expect(isAddressValid(STARKNET)).toBe(true)
    expect(isAddressValid(undefined)).toBe(false)
    expect(isAddressValid('nope')).toBe(false)
  })

  it('builds LayerZero receiver bytes for each family', () => {
    expect(getLayerZeroReceiverAddress(EVM.toLowerCase() as `0x${string}`)).toMatch(/^0x/)
    expect(getLayerZeroReceiverAddress(undefined)).toBe(zeroAddress)
    expect(getLayerZeroReceiverAddress(SUI as `0x${string}`)).toBe(SUI)
    expect(getLayerZeroReceiverAddress(STARKNET as `0x${string}`)).toBe(STARKNET.toLowerCase())
    expect(getLayerZeroReceiverAddress('0xabc' as `0x${string}`)).toBe(`0x${'0'.repeat(61)}abc`)
    expect(getLayerZeroReceiverAddress('not-an-address' as never)).toBe(zeroAddress)
    expect(toBytes32Recipient('0xABC')).toBe(`0x${'0'.repeat(61)}abc`)
    expect(toBytes32Recipient(undefined)).toBe(zeroAddress)
  })

  it('strips HTML from free-text inputs', () => {
    expect(sanitizeInput('<script>alert(1)</script>hi')).toBe('hi')
  })
})
