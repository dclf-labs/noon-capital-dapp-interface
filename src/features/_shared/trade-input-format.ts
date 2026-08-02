import {
  NATIVE_GAS_RESERVE,
  normalizeTradeAmount,
  TRADE_INPUT_DECIMALS,
} from '@/features/_shared/trade-amounts'
import { down, toNum } from '@/lib/format'

/** Pay input: up to 6 fraction digits (matches old dapp NumericFormat). */
export const TRADE_PAY_DECIMALS = TRADE_INPUT_DECIMALS

/** Receive field display: at most 2 fraction digits; stored value stays at 6. */
export const TRADE_RECEIVE_DISPLAY_DECIMALS = 2

/**
 * Clip a pay amount to trade input precision.
 * Returns `undefined` for empty / non-positive values (clears the controlled input).
 */
export function toTradePayAmount(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const clipped = normalizeTradeAmount(value, TRADE_PAY_DECIMALS)
  return clipped > 0 ? clipped : undefined
}

/**
 * Stored receive amount keeps full trade precision (6dp), even when the UI shows 2dp.
 */
export function toTradeReceiveStoredAmount(value: number | string | undefined): number | undefined {
  return toTradePayAmount(value)
}

/**
 * Format a number for NumericFormat / human-readable pay display (commas, ≤6dp).
 * Trailing zeros in the fractional part are omitted.
 */
export function formatTradePayDisplay(amount: number | string | undefined): string {
  const value = toTradePayAmount(amount)
  if (value === undefined) return ''
  return new Intl.NumberFormat('en-US', {
    useGrouping: true,
    maximumFractionDigits: TRADE_PAY_DECIMALS,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Format receive amount for display: commas + at most 2 fraction digits.
 * Does not mutate the stored 6dp value — display-only rounding.
 */
export function formatTradeReceiveDisplay(amount: number | string | undefined): string {
  const stored = toTradeReceiveStoredAmount(amount)
  if (stored === undefined) return ''
  const display = down(stored, TRADE_RECEIVE_DISPLAY_DECIMALS)
  return new Intl.NumberFormat('en-US', {
    useGrouping: true,
    maximumFractionDigits: TRADE_RECEIVE_DISPLAY_DECIMALS,
    minimumFractionDigits: 0,
  }).format(display)
}

/**
 * Max preset for a token, reserving gas when the token is native.
 */
export function getTradeMaxAmount(
  balance: number | undefined,
  isNative: boolean | undefined,
): number {
  return normalizeTradeAmount(
    Math.max(0, toNum(balance) - (isNative ? NATIVE_GAS_RESERVE : 0)),
    TRADE_PAY_DECIMALS,
  )
}

export type TradePayInputParseResult =
  { kind: 'clear' } | { kind: 'commit'; amount: number } | { kind: 'draft' }

/**
 * Parse NumericFormat onValueChange payloads.
 * - `clear` — empty field
 * - `draft` — intermediate typing (e.g. `0.`, `1.`) — do not wipe parent state
 * - `commit` — finite positive amount clipped to 6dp
 */
export function parseTradePayInput(values: {
  floatValue?: number
  value: string
}): TradePayInputParseResult {
  const raw = values.value.trim()
  if (!raw) return { kind: 'clear' }
  // Allow in-progress decimals without forcing a commit/clear round-trip.
  if (raw === '.' || raw.endsWith('.') || raw === '0' || /^0\.0*$/.test(raw)) {
    return { kind: 'draft' }
  }
  if (values.floatValue === undefined || !Number.isFinite(values.floatValue)) {
    return { kind: 'draft' }
  }
  const amount = toTradePayAmount(values.floatValue)
  if (amount === undefined) return { kind: 'clear' }
  return { kind: 'commit', amount }
}
