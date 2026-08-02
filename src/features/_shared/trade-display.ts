import { toIntlCompactStr, toIntlCompactStrWithMaxFractionDigits4, toIntlStr } from '@/lib/format'

/**
 * Display-only formatters for trade UI.
 * Prefer calling these from hooks/contexts (or thin presentational leaves)
 * so screens do not invent their own Intl args.
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

export function formatNativeFee(
  amount: number | string | bigint | undefined,
  symbol: string = 'ETH',
  decimals: number = 18,
): string {
  return toIntlStr(amount, decimals, 2, '~', ` ${symbol}`)
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
