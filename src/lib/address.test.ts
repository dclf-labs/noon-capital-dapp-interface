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
  sanitizeStarknetAddress,
  sanitizeSuiAddress,
  toBytes32Recipient,
} from '@/lib/address'

const EVM = '0x1111111111111111111111111111111111111111'
const SUI = `0x${'1'.repeat(64)}`
/** Starknet ETH token — known valid felt252 address (64 hex digits, leading zero). */
const STARKNET = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
/** Same address with one leading zero omitted (63 hex digits). */
const STARKNET_UNPADDED = `0x${STARKNET.slice(3)}`

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
  it('accepts full 64-hex felt252 addresses (with or without 0x)', () => {
    expect(isStarknetAddressValid(STARKNET)).toBe(true)
    expect(isStarknetAddressValid(STARKNET.slice(2))).toBe(true)
    expect(isStarknetAddressValid(`0x0${'1'.repeat(63)}`)).toBe(true)
  })

  it('accepts 63-hex addresses when a leading zero is omitted', () => {
    expect(STARKNET_UNPADDED.slice(2).length).toBe(63)
    expect(isStarknetAddressValid(STARKNET_UNPADDED)).toBe(true)
  })

  it('rejects short hex that starknet.js would otherwise pad', () => {
    expect(isStarknetAddressValid('123')).toBe(false)
    expect(isStarknetAddressValid('0xabc')).toBe(false)
    expect(isStarknetAddressValid('abc')).toBe(false)
    expect(isStarknetAddressValid('0x1')).toBe(false)
  })

  it('rejects EVM, zero, over-length, and non-felt252 values', () => {
    expect(isStarknetAddressValid(EVM)).toBe(false)
    expect(isStarknetAddressValid(undefined)).toBe(false)
    expect(isStarknetAddressValid('0x0')).toBe(false)
    expect(isStarknetAddressValid(`0x${'0'.repeat(64)}`)).toBe(false)
    expect(isStarknetAddressValid(`0x${'f'.repeat(64)}`)).toBe(false)
    expect(isStarknetAddressValid(`0x${'a'.repeat(65)}`)).toBe(false)
    expect(isStarknetAddressValid('not-hex')).toBe(false)
  })

  it('sanitizes to the padded 64-hex form', () => {
    expect(sanitizeStarknetAddress(STARKNET)).toBe(STARKNET)
    expect(sanitizeStarknetAddress(STARKNET_UNPADDED)).toBe(STARKNET)
    expect(sanitizeStarknetAddress('0xabc')).toBeUndefined()
    expect(sanitizeStarknetAddress(EVM)).toBeUndefined()
  })
})

describe('Sui addresses', () => {
  it('accepts exactly 64 hex digits (with or without 0x)', () => {
    expect(isSuiAddressValid(SUI)).toBe(true)
    expect(isSuiAddressValid(SUI.slice(2))).toBe(true)
    expect(normalizeSuiAddress(SUI)).toBe(SUI)
    expect(normalizeSuiAddress(SUI.slice(2))).toBe(SUI)
  })

  it('rejects short hex instead of left-padding it', () => {
    expect(isSuiAddressValid('123')).toBe(false)
    expect(isSuiAddressValid('0x1')).toBe(false)
    expect(isSuiAddressValid('0xabc')).toBe(false)
    expect(normalizeSuiAddress('0x1')).toBeUndefined()
    expect(normalizeSuiAddress('1')).toBeUndefined()
    expect(normalizeSuiAddress('123')).toBeUndefined()
  })

  it('rejects zero, over-long, non-hex, and EVM pastes', () => {
    expect(normalizeSuiAddress('')).toBeUndefined()
    expect(normalizeSuiAddress('0xgg')).toBeUndefined()
    expect(normalizeSuiAddress(`0x${'0'.repeat(64)}`)).toBeUndefined()
    expect(normalizeSuiAddress(`0x${'1'.repeat(65)}`)).toBeUndefined()
    expect(normalizeSuiAddress(EVM)).toBeUndefined()
    expect(isSuiAddressValid(EVM)).toBe(false)
  })

  it('sanitizes after HTML strip', () => {
    expect(sanitizeSuiAddress(SUI)).toBe(SUI)
    expect(sanitizeSuiAddress('0x1')).toBeUndefined()
    expect(sanitizeSuiAddress('')).toBeUndefined()
    expect(sanitizeSuiAddress(`<b>${SUI}</b>`)).toBe(SUI)
  })
})

describe('cross-family address helpers', () => {
  it('accepts any supported family via isAddressValid', () => {
    expect(isAddressValid(EVM)).toBe(true)
    expect(isAddressValid(SUI)).toBe(true)
    expect(isAddressValid(STARKNET)).toBe(true)
    expect(isAddressValid(STARKNET_UNPADDED)).toBe(true)
    expect(isAddressValid(undefined)).toBe(false)
    expect(isAddressValid('123')).toBe(false)
    expect(isAddressValid('nope')).toBe(false)
  })

  it('builds LayerZero receiver bytes for each family', () => {
    expect(getLayerZeroReceiverAddress(EVM.toLowerCase() as `0x${string}`)).toMatch(/^0x/)
    expect(getLayerZeroReceiverAddress(undefined)).toBe(zeroAddress)
    expect(getLayerZeroReceiverAddress(SUI as `0x${string}`)).toBe(SUI)
    expect(getLayerZeroReceiverAddress(STARKNET as `0x${string}`)).toBe(STARKNET)
    expect(getLayerZeroReceiverAddress(STARKNET_UNPADDED as `0x${string}`)).toBe(STARKNET)
    expect(getLayerZeroReceiverAddress('0xabc' as `0x${string}`)).toBe(zeroAddress)
    expect(getLayerZeroReceiverAddress('123' as never)).toBe(zeroAddress)
    expect(getLayerZeroReceiverAddress('not-an-address' as never)).toBe(zeroAddress)
  })

  it('left-pads hex to bytes32 for Hyperlane recipients', () => {
    expect(toBytes32Recipient('0xABC')).toBe(`0x${'0'.repeat(61)}abc`)
    expect(toBytes32Recipient(undefined)).toBe(zeroAddress)
  })

  it('strips HTML from free-text inputs', () => {
    expect(sanitizeInput('<script>alert(1)</script>hi')).toBe('hi')
  })
})
