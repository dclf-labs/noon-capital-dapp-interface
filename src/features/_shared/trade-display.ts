import { toIntlCompactStr, toIntlStr } from '@/lib/format'

/**
 * Display-only formatters for trade UI (confirm rows, USD, fees, balances).
 * Non-input labels: decimals only when needed, max 1dp for numbers.
 * Pay/receive field precision still goes through `trade-input-format`.
 */

/** Amount / USD / fee numbers — max 1 fraction digit, omit trailing zeros. */
export function formatUsd(amount: number | string | bigint | undefined): string {
  return toIntlStr(amount, 1, 0, '~$', '', 1)
}

/** Network / gas fee USD label (no approximate `~` prefix). */
export function formatFeeUsd(amount: number | string | bigint | undefined): string {
  return toIntlStr(amount, 1, 0, '$', '', 1)
}

/** Shared submit-fee envelope from EVM / Starknet `useGasFee` (and bridge stubs). */
export type SubmitFeeDisplayInput = {
  isReady?: boolean
  /** USD notional. */
  data?: number
  /** Native gas-token amount. */
  native?: number
}

/**
 * Canonical fee labels: USD primary + native tip.
 * Use everywhere `useGasFee` / submit-fee hooks are displayed.
 */
export function formatSubmitFeeLabels(
  fee: SubmitFeeDisplayInput | undefined,
  symbol: string,
): { feeLabel?: string; feeNativeLabel?: string } {
  if (!fee?.isReady || fee.data == null || !(fee.data > 0)) {
    return { feeLabel: undefined, feeNativeLabel: undefined }
  }
  return {
    feeLabel: formatFeeUsd(fee.data),
    feeNativeLabel: formatNativeFeeDetail(fee.native, symbol),
  }
}

export function formatTokenAmount(
  amount: number | string | bigint | undefined,
  symbol?: string,
  decimals: number = 18,
): string {
  const suffix = symbol ? ` ${symbol}` : ''
  return toIntlCompactStr(amount, decimals, true, 0, '', suffix, 1)
}

/**
 * Confirm / success amount label (no symbol).
 * Dust → `<0.1`; values ≥ 100k → compact (`150K`).
 */
export function formatConfirmAmount(
  amount: number | string | bigint | undefined,
  decimals: number = 6,
): string {
  if (amount === undefined || amount === '') return '0'
  return toIntlCompactStr(amount, decimals, true, 0, '', '', 1)
}

export function formatNativeFee(
  amount: number | string | bigint | undefined,
  symbol: string = 'ETH',
  decimals: number = 18,
): string {
  return toIntlStr(amount, decimals, 0, '', ` ${symbol}`, 1)
}

/**
 * Native fee for tooltips / hover cards.
 * Dust below the 1dp floor uses the same `<0.1` label as other non-input displays.
 */
export function formatNativeFeeDetail(
  amount: number | string | bigint | undefined,
  symbol: string = 'ETH',
): string {
  return formatNativeFee(amount, symbol)
}

/** Unit rate / mid price (max 1 fraction digit). */
export function formatUnitRate(amount: number | string | bigint | undefined): string {
  return toIntlCompactStr(amount, 1, true, 0, '', '', 1)
}

/** Percentages — max 2 fraction digits, omit trailing zeros. */
export function formatPercent(amount: number | string | bigint | undefined): string {
  return toIntlStr(amount, 2, 0, '', '%', 2)
}

/** Balance label as shown next to trade inputs. */
export function formatBalanceLabel(
  amount: number | string | bigint | undefined,
  symbol?: string,
  decimals: number = 18,
): string {
  return `Bal: ${formatTokenAmount(amount, symbol, decimals)}`
}
