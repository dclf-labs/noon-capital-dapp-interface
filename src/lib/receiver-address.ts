import {
  type Address,
  isEVMAddressValid,
  isStarknetAddressValid,
  isSuiAddressValid,
  sanitizeEVMAddress,
  sanitizeInput,
  sanitizeStarknetAddress,
  sanitizeSuiAddress,
  type StarknetAddress,
  type SuiAddress,
} from '@/lib/address'

/** Destination network family for bridge receiver address entry. */
export type ReceiverAddressFamily = 'evm' | 'starknet' | 'sui'

export type SanitizedReceiverAddress = Address | StarknetAddress | SuiAddress

export type ReceiverAddressErrorCode =
  'evm_paste' | 'invalid_evm' | 'invalid_starknet' | 'invalid_sui'

export { sanitizeStarknetAddress }

/**
 * Strip non-address characters while typing.
 * Starknet / Sui: hex only (+ optional leading `0x`). EVM: general sanitize (checksum casing).
 */
export function filterReceiverAddressInput(family: ReceiverAddressFamily, raw: string): string {
  const cleaned = sanitizeInput(raw)
  if (family === 'evm') return cleaned

  // Allow typing the `0x` prefix without forcing hex onto a lone `0`.
  if (cleaned === '' || cleaned === '0') return cleaned
  if (cleaned.toLowerCase() === '0x') return '0x'

  const hasPrefix = cleaned.toLowerCase().startsWith('0x')
  const body = (hasPrefix ? cleaned.slice(2) : cleaned).replace(/[^0-9a-fA-F]/g, '')
  return hasPrefix ? `0x${body}` : body
}

/** Family-strict sanitize + normalize for submit. */
export function sanitizeReceiverAddress(
  family: ReceiverAddressFamily,
  value: string,
): SanitizedReceiverAddress | undefined {
  switch (family) {
    case 'evm':
      return sanitizeEVMAddress(value) as Address | undefined
    case 'starknet':
      return sanitizeStarknetAddress(value)
    case 'sui':
      return sanitizeSuiAddress(value)
  }
}

/**
 * Family-strict validity — uses the same sanitize path as submit so the UI only
 * enables when the value can actually be stored (optional `0x` allowed).
 */
export function isReceiverAddressValid(
  family: ReceiverAddressFamily,
  value: string | undefined,
): boolean {
  if (!value?.trim()) return false
  return sanitizeReceiverAddress(family, value) != null
}

/**
 * Detailed validation for the Change Address modal input.
 * Returns `null` when empty (no error yet) or when the value is valid for `family`.
 */
export function getReceiverAddressError(
  family: ReceiverAddressFamily,
  value: string | undefined,
): ReceiverAddressErrorCode | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  switch (family) {
    case 'evm': {
      if (isEVMAddressValid(trimmed as Address)) return null
      return 'invalid_evm'
    }
    case 'starknet': {
      if (isEVMAddressValid(trimmed as Address)) return 'evm_paste'
      const formatted = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
      if (isEVMAddressValid(formatted as Address)) return 'evm_paste'
      if (isStarknetAddressValid(formatted)) return null
      return 'invalid_starknet'
    }
    case 'sui': {
      if (isEVMAddressValid(trimmed as Address)) return 'evm_paste'
      if (isSuiAddressValid(trimmed)) return null
      return 'invalid_sui'
    }
  }
}

/** Direct family checks — for already-normalized stored values. */
export function isStoredReceiverAddressValid(
  family: ReceiverAddressFamily,
  value: string | undefined,
): boolean {
  if (!value?.trim()) return false
  switch (family) {
    case 'evm':
      return isEVMAddressValid(value as Address)
    case 'starknet':
      return isStarknetAddressValid(value)
    case 'sui':
      return isSuiAddressValid(value)
  }
}
