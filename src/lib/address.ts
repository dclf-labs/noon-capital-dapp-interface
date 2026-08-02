import { type Address as StarknetAddress } from '@starknet-react/core'
import DOMPurify from 'dompurify'
import {
  type Address as EvmAddress,
  getAddress,
  isAddress as isEVMAddress,
  zeroAddress,
} from 'viem'

export type SuiAddress = `0x${string}`
export type Address = EvmAddress | StarknetAddress | SuiAddress
export type { EvmAddress, StarknetAddress }

/** Sui addresses are exactly 32 bytes (Mysten / Move account address length). */
const SUI_ADDRESS_BYTE_LENGTH = 32
const SUI_ADDRESS_HEX_LENGTH = SUI_ADDRESS_BYTE_LENGTH * 2

export const isEVMAddressValid = (address: Address | undefined) => {
  if (!address) return false

  return isEVMAddress(address) && address !== zeroAddress
}

export const isStarknetAddressValid = (address: string | undefined): boolean => {
  if (!address) return false
  // Exclude valid EVM addresses early to avoid infinite recursion with isAddressValid
  if (isEVMAddressValid(address as Address)) return false

  const trimmed = address.trim()
  // Starknet felt252: 0x + 1–64 hex digits (including full 64-char padded forms)
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(trimmed)) return false
  if (/^0x0+$/i.test(trimmed)) return false
  return true
}

/**
 * Normalize a Sui address the same way as `@mysten/sui/utils`:
 * lowercase, ensure 0x, pad to 32 bytes. Returns undefined if input is not valid hex.
 */
export const normalizeSuiAddress = (address: string): SuiAddress | undefined => {
  const trimmed = address.trim()
  if (!trimmed) return undefined

  let hexBody = trimmed.toLowerCase()
  if (hexBody.startsWith('0x')) {
    hexBody = hexBody.slice(2)
  }

  if (!/^[0-9a-f]+$/.test(hexBody)) return undefined
  if (hexBody.length === 0 || hexBody.length > SUI_ADDRESS_HEX_LENGTH) return undefined
  if (/^0+$/.test(hexBody)) return undefined

  // Reject raw 20-byte EVM addresses (common paste mistake on this modal)
  if (hexBody.length === 40 && isEVMAddress(`0x${hexBody}`)) return undefined

  return `0x${hexBody.padStart(SUI_ADDRESS_HEX_LENGTH, '0')}` as SuiAddress
}

/**
 * Valid Sui wallet address: hex that normalizes to exactly 32 bytes.
 * Accepts shortened forms (leading zeros omitted) and optional 0x prefix.
 */
export const isSuiAddressValid = (address: string | undefined): boolean => {
  if (!address?.trim()) return false
  const normalized = normalizeSuiAddress(address)
  if (!normalized) return false
  // Mysten: normalized address must be 0x + 64 hex chars
  return normalized.length === SUI_ADDRESS_HEX_LENGTH + 2
}

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
 * Normalize a receiver address for LayerZero `addressToBytes32`.
 * EVM addresses are checksummed; Sui/Starknet hex addresses are passed through
 * (LZ pads them to 32 bytes).
 */
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

export const getLayerZeroReceiverAddress = (address: Address | undefined): string => {
  if (!address) return zeroAddress
  if (isEVMAddressValid(address)) return getAddress(address)
  if (isSuiAddressValid(address)) return normalizeSuiAddress(address) || address
  if (isStarknetAddressValid(address)) return toBytes32Recipient(address)
  return zeroAddress
}

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  })?.trim()
}

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

export const sanitizeSuiAddress = (input: string): SuiAddress | undefined => {
  const sanitizedInput = sanitizeInput(input)
  if (!sanitizedInput) return undefined
  return normalizeSuiAddress(sanitizedInput)
}
