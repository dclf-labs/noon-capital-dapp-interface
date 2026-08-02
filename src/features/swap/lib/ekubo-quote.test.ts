import { describe, expect, it } from 'vitest'

import { resolveEkuboCalculatedAmount } from '@/features/swap/lib/ekubo-quote'
import type { EkuboSwapInfoResponse } from '@/lib/api'

describe('resolveEkuboCalculatedAmount', () => {
  it('prefers total_calculated when present', () => {
    const data = {
      total_calculated: '150',
      splits: [
        { amount_calculated: '100', route: [] },
        { amount_calculated: '50', route: [] },
      ],
    } as unknown as EkuboSwapInfoResponse
    expect(resolveEkuboCalculatedAmount(data)).toBe(150n)
  })

  it('sums split amounts when total is missing or zero', () => {
    const data = {
      total_calculated: '0',
      splits: [
        { amount_calculated: '100', route: [] },
        { amount_calculated: '50', route: [] },
      ],
    } as unknown as EkuboSwapInfoResponse
    expect(resolveEkuboCalculatedAmount(data)).toBe(150n)
  })
})
