import { type Address as StarknetAddress } from '@starknet-react/core'
import DOMPurify from 'dompurify'
import { validateAndParseAddress } from 'starknet'
import {
  type Address as EvmAddress,
  getAddress,
  isAddress as isEVMAddress,
  zeroAddress,
} from 'viem'

export type SuiAddress = `0x${string}`
export type Address = EvmAddress | StarknetAddress | SuiAddress
export type { EvmAddress, StarknetAddress }

/** Sui account addresses are 32 bytes (64 hex digits). */
const SUI_ADDRESS_BYTE_LENGTH = 32
const SUI_ADDRESS_HEX_LENGTH = SUI_ADDRESS_BYTE_LENGTH * 2

/** Full 32-byte hex body (64 digits) — required for Sui wallet addresses. */
const FULL_HEX_BODY_RE = /^[0-9a-fA-F]{64}$/
/**
 * Starknet felt body width for wallet/contract addresses.
 * Accepts 64 hex digits, or 63 when a single leading zero is omitted (common in
 * explorers and some wallet displays). Shorter hex (e.g. `123`) is rejected even
 * though starknet.js can pad it.
 */
const STARKNET_HEX_BODY_RE = /^[0-9a-fA-F]{63,64}$/
const ZERO_HEX_RE = /^0x0+$/i

/** Ensure a `0x` prefix for hex address checks (users often omit it while typing). */
const with0x = (value: string): `0x${string}` =>
  (value.startsWith('0x') || value.startsWith('0X') ? value : `0x${value}`) as `0x${string}`

const hexBody = (value: string): string => with0x(value.trim()).slice(2)

/** Non-zero EVM address (viem checksum / EIP-55 aware). */
export const isEVMAddressValid = (address: Address | undefined) => {
  if (!address) return false

  return isEVMAddress(address) && address !== zeroAddress
}

/**
 * Starknet address validity:
 * - Reject EVM 20-byte addresses (common cross-paste mistake)
 * - Require 63–64 hex digits after an optional `0x`
 * - Reject the zero address
 * - Enforce felt252 via `starknet.validateAndParseAddress`
 */
export const isStarknetAddressValid = (address: string | undefined): boolean => {
  if (!address) return false
  // Exclude valid EVM addresses early to avoid overlap with isAddressValid
  if (isEVMAddressValid(address as Address)) return false

  const prefixed = with0x(address.trim())
  if (isEVMAddressValid(prefixed as Address)) return false
  if (!STARKNET_HEX_BODY_RE.test(hexBody(prefixed))) return false
  if (ZERO_HEX_RE.test(prefixed)) return false

  try {
    validateAndParseAddress(prefixed)
    return true
  } catch {
    return false
  }
}

/**
 * Canonical Sui address: lowercase `0x` + exactly 64 hex digits.
 * Returns undefined for short hex, non-hex, zero, or over-long input.
 */
export const normalizeSuiAddress = (address: string): SuiAddress | undefined => {
  const trimmed = address.trim()
  if (!trimmed) return undefined

  let body = trimmed.toLowerCase()
  if (body.startsWith('0x')) {
    body = body.slice(2)
  }

  if (!FULL_HEX_BODY_RE.test(body)) return undefined
  if (/^0+$/.test(body)) return undefined

  return `0x${body}` as SuiAddress
}

/**
 * Sui wallet address validity: exactly 32 bytes of hex (optional `0x`).
 * Aligns with Mysten `isValidSuiAddress` on the raw input — short forms are invalid.
 */
export const isSuiAddressValid = (address: string | undefined): boolean => {
  if (!address?.trim()) return false
  const normalized = normalizeSuiAddress(address)
  if (!normalized) return false
  return normalized.length === SUI_ADDRESS_HEX_LENGTH + 2
}

/** True when the value is a valid EVM, Starknet, or Sui address. */
export const isAddressValid = (address: string | undefined) => {
  return (
    isEVMAddressValid(address as Address) ||
    isStarknetAddressValid(address) ||
    isSuiAddressValid(address)
  )
}

export const getAddressOrZeroAddress = (address: Address | undefined) => {
  return address && isEVMAddressValid(address) ? address : zeroAddress
}

/**
 * Left-pad a hex address to 32 bytes for Hyperlane / bytes32 recipients.
 * Accepts EVM (20-byte) and Starknet/Sui (up to 32-byte) hex forms.
 */
export const toBytes32Recipient = (address: string | undefined): `0x${string}` => {
  if (!address) return zeroAddress
  const body = address.trim().replace(/^0x/i, '')
  if (!/^[0-9a-fA-F]{1,64}$/.test(body)) return zeroAddress
  return `0x${body.padStart(64, '0').toLowerCase()}` as `0x${string}`
}

/**
 * Normalize a receiver address for LayerZero `addressToBytes32`.
 * EVM addresses are checksummed; Sui/Starknet addresses are returned in canonical form.
 */
export const getLayerZeroReceiverAddress = (address: Address | undefined): string => {
  if (!address) return zeroAddress
  if (isEVMAddressValid(address)) return getAddress(address)
  if (isSuiAddressValid(address)) return normalizeSuiAddress(address) || address
  const starknet = sanitizeStarknetAddress(String(address))
  if (starknet) return starknet
  return zeroAddress
}

/** Strip HTML / dangerous markup from free-text address inputs. */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  })?.trim()
}

/** Sanitize and checksum an EVM address; undefined when invalid or zero. */
export const sanitizeEVMAddress = (input: string): string | undefined => {
  const sanitizedInput = sanitizeInput(input)

  try {
    const address = getAddress(sanitizedInput)
    if (address === zeroAddress) {
      return undefined
    }
    return address
  } catch {
    return undefined
  }
}

/**
 * Sanitize a Starknet address and return the padded `0x` + 64-hex form.
 * Undefined when invalid, EVM, or zero.
 */
export const sanitizeStarknetAddress = (input: string): StarknetAddress | undefined => {
  const sanitizedInput = sanitizeInput(input)
  if (!sanitizedInput || !isStarknetAddressValid(sanitizedInput)) return undefined

  try {
    return validateAndParseAddress(with0x(sanitizedInput)) as StarknetAddress
  } catch {
    return undefined
  }
}

/** Sanitize a Sui address to canonical `0x` + 64-hex form. */
export const sanitizeSuiAddress = (input: string): SuiAddress | undefined => {
  const sanitizedInput = sanitizeInput(input)
  if (!sanitizedInput) return undefined
  return normalizeSuiAddress(sanitizedInput)
}
