import { toIntlCompactStr, toIntlCompactStrWithMaxFractionDigits4, toIntlStr } from '@/lib/format'

/**
 * Display-only formatters for trade UI (confirm rows, USD, fees, balances).
 * Prefer these over ad-hoc `toIntlStr` args in screens — pay/receive field
 * precision still goes through `trade-input-format`.
 */

export function formatUsd(amount: number | string | bigint | undefined): string {
  return toIntlStr(amount, 2, 2, '~$', '')
}

export function formatTokenAmount(
  amount: number | string | bigint | undefined,
  symbol?: string,
  decimals: number = 18,
): string {
  const suffix = symbol ? ` ${symbol}` : ''
  return toIntlCompactStr(amount, decimals, true, 2, '', suffix)
}

/**
 * Confirm / success amount label (no symbol) — matches old-dapp `toIntlCompactStr(..., 6)`.
 * Dust → `<0.01`; values ≥ 100k → compact (`150K`).
 */
export function formatConfirmAmount(
  amount: number | string | bigint | undefined,
  decimals: number = 6,
): string {
  if (amount === undefined || amount === '') return '0'
  return toIntlCompactStr(amount, decimals, true, 2, '', '')
}

export function formatNativeFee(
  amount: number | string | bigint | undefined,
  symbol: string = 'ETH',
  decimals: number = 18,
): string {
  return toIntlStr(amount, decimals, 2, '~', ` ${symbol}`)
}

/**
 * Precise native fee for tooltips / hover cards (gas dust stays readable).
 * Unlike `formatNativeFee`, does not collapse amounts below 0.01 to `<0.01`.
 */
export function formatNativeFeeDetail(
  amount: number | string | bigint | undefined,
  symbol: string = 'ETH',
): string {
  const value = Number(amount ?? 0)
  if (!Number.isFinite(value) || value <= 0) return `~0 ${symbol}`
  return `~${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(value)} ${symbol}`
}

/** Unit rate / mid price (up to 4 fraction digits). */
export function formatUnitRate(amount: number | string | bigint | undefined): string {
  return toIntlCompactStrWithMaxFractionDigits4(amount, 4, true, 2, '', '')
}

/** Balance label as shown next to trade inputs. */
export function formatBalanceLabel(
  amount: number | string | bigint | undefined,
  symbol?: string,
  decimals: number = 18,
): string {
  return `Bal: ${formatTokenAmount(amount, symbol, decimals)}`
}
