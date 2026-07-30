/**
 * Clear user-scoped React Query caches when the wallet account changes.
 * Prevents flashing stale balances / points / portfolio for a previous address.
 */
import { queryClient } from '@/lib/query'

const USER_SCOPED_ROOT_KEYS = [
  'points',
  'user',
  'quests',
  'referral',
  'governance',
  'token',
  'bridge',
  'mint',
  'redeem',
  'stake',
  'unstake',
  'buy',
  'sell',
  'vault',
  'withdraw',
  'vesu',
  'gas',
] as const

export function clearUserScopedQueries(): void {
  for (const root of USER_SCOPED_ROOT_KEYS) {
    void queryClient.removeQueries({ queryKey: [root] })
  }
}

/** Compare addresses case-insensitively; treat empty as disconnected. */
export function sameWalletAddress(
  a: string | undefined | null,
  b: string | undefined | null,
): boolean {
  const left = (a ?? '').toLowerCase()
  const right = (b ?? '').toLowerCase()
  return left === right
}
