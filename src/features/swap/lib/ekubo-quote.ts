import { type EkuboSwapInfoResponse, type EkuboSwapInfoRoute } from '@/lib/api'
import { toBn } from '@/lib/format'

/**
 * Prefer `total_calculated`; otherwise **sum** split amounts (never average).
 */
export function resolveEkuboCalculatedAmount(data: EkuboSwapInfoResponse): bigint {
  const total = toBn(data.total_calculated)
  if (total > 0n) return total

  return data.splits?.reduce((acc, curr) => acc + toBn(curr.amount_calculated), 0n) ?? 0n
}

/**
 * Execution currently supports a single multihop path. Multi-split quotes must not be
 * flattened into one route — that would not match the priced trade.
 */
export function resolveEkuboExecutableRoute(data: EkuboSwapInfoResponse): EkuboSwapInfoRoute[] {
  const splits = data.splits || []
  if (splits.length > 1) {
    throw new Error('Multi-split Ekubo quotes are not supported for execution')
  }
  return (splits[0]?.route || []) as EkuboSwapInfoRoute[]
}
