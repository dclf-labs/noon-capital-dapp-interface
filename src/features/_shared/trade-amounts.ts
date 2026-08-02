import { down, toNum } from '@/lib/format'

/** Default decimal places for trade input clipping (matches product Input UX). */
export const TRADE_INPUT_DECIMALS = 6

/**
 * Clip a user-entered or derived trade amount to the UI input precision.
 */
export function normalizeTradeAmount(
  amount: number | string | undefined,
  decimals: number = TRADE_INPUT_DECIMALS,
): number {
  return down(toNum(amount), decimals)
}

/** Conservative native gas reserve so Max does not leave a wallet unable to pay fees. */
export const NATIVE_GAS_RESERVE = 0.01

/**
 * HALF / MAX amounts from a wallet balance, clipped to input precision.
 * Pass `reserve` (e.g. {@link NATIVE_GAS_RESERVE}) for native token Max.
 */
export function getPresetAmount(
  balance: number | undefined,
  option: 'half' | 'max',
  decimals: number = TRADE_INPUT_DECIMALS,
  reserve: number = 0,
): number {
  const available = Math.max(0, toNum(balance) - toNum(reserve))
  const clipped = normalizeTradeAmount(available, decimals)
  return option === 'half' ? normalizeTradeAmount(clipped / 2, decimals) : clipped
}

/**
 * Whether HALF/MAX controls should be disabled for a balance query envelope.
 */
export function isBalancePresetDisabled(balance: {
  data?: number
  isLoading?: boolean
  isError?: boolean
}): boolean {
  return Boolean(balance.isError || balance.isLoading || !balance.data)
}

/**
 * Token amount × USD price. Returns 0 while price is loading/errored or amount is empty.
 */
export function getAmountUsd(
  amount: number | undefined,
  tokenPrice: { data?: number; isLoading?: boolean; isError?: boolean } | undefined,
): number {
  if (!amount || tokenPrice?.isLoading || tokenPrice?.isError) return 0
  return toNum(amount) * toNum(tokenPrice?.data)
}

/** Preview shapes: EVM number quote, or Starknet Ekubo `{ quote, route }`. */
export type PreviewQuoteData<TRoute = unknown> =
  number | { quote: number; route?: TRoute[] } | undefined | null

/** Extract the numeric quote from either preview shape. */
export function normalizePreviewQuote(data: PreviewQuoteData): number | undefined {
  if (data == null) return undefined
  if (typeof data === 'number') return toNum(data)
  if (typeof data === 'object' && 'quote' in data) return toNum(data.quote)
  return undefined
}

/** Starknet route hops; empty for plain numeric (EVM) previews. */
export function normalizePreviewRoute<TRoute>(data: PreviewQuoteData<TRoute>): TRoute[] {
  if (data != null && typeof data === 'object' && 'route' in data && Array.isArray(data.route)) {
    return data.route
  }
  return []
}
