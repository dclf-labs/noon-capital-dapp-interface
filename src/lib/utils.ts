import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isAddress } from 'viem'

import type { Theme } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (!isAddress(address)) return address
  const minLength = chars * 2 + 2
  if (address.length <= minLength) return address
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

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}
