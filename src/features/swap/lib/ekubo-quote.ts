import { type EkuboSwapInfoResponse } from '@/lib/api'
import { toBn } from '@/lib/format'

/**
 * Prefer `total_calculated`; otherwise **sum** split amounts (never average).
 */
export function resolveEkuboCalculatedAmount(data: EkuboSwapInfoResponse): bigint {
  const total = toBn(data.total_calculated)
  if (total > 0n) return total

  return data.splits?.reduce((acc, curr) => acc + toBn(curr.amount_calculated), 0n) ?? 0n
}
