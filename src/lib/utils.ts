import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncate a wallet address for display (EVM, Starknet, or Sui).
 * Empty / short values are returned unchanged.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  // Avoid mangling labels or short strings; real addresses are much longer.
  const minLength = Math.max(20, chars * 2 + 2)
  if (address.length < minLength) return address
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}

export function formatNumber(
  value: number | string,
  options: Intl.NumberFormatOptions = {},
): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num)) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
    ...options,
  }).format(num)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
