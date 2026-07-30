import { describe, expect, it, vi } from 'vitest'

import { clearUserScopedQueries, sameWalletAddress } from '@/lib/wallet-query-sync'

vi.mock('@/lib/query', () => ({
  queryClient: {
    removeQueries: vi.fn(),
  },
}))

import { queryClient } from '@/lib/query'

describe('wallet-query-sync', () => {
  it('compares addresses case-insensitively', () => {
    expect(sameWalletAddress('0xAbC', '0xabc')).toBe(true)
    expect(sameWalletAddress(undefined, undefined)).toBe(true)
    expect(sameWalletAddress('0x1', undefined)).toBe(false)
    expect(sameWalletAddress('', '')).toBe(true)
  })

  it('clears known user-scoped query roots', () => {
    vi.mocked(queryClient.removeQueries).mockClear()
    clearUserScopedQueries()
    expect(queryClient.removeQueries).toHaveBeenCalled()
    const roots = vi
      .mocked(queryClient.removeQueries)
      .mock.calls.map((call) => call[0]?.queryKey?.[0])
    expect(roots).toEqual(
      expect.arrayContaining([
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
      ]),
    )
    expect(roots).toHaveLength(17)
  })
})
