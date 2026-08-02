import { describe, expect, it } from 'vitest'

import {
  resolveEkuboCalculatedAmount,
  resolveEkuboExecutableRoute,
} from '@/features/swap/lib/ekubo-quote'
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

describe('resolveEkuboExecutableRoute', () => {
  it('returns the single-split route', () => {
    const route = [{ pool_key: { token0: '0x1', token1: '0x2' } }]
    const data = {
      splits: [{ amount_calculated: '100', route }],
    } as unknown as EkuboSwapInfoResponse
    expect(resolveEkuboExecutableRoute(data)).toEqual(route)
  })

  it('returns an empty route when splits are missing', () => {
    expect(resolveEkuboExecutableRoute({} as EkuboSwapInfoResponse)).toEqual([])
    expect(resolveEkuboExecutableRoute({ splits: [] } as unknown as EkuboSwapInfoResponse)).toEqual(
      [],
    )
  })

  it('rejects multi-split quotes instead of flattening hops', () => {
    const data = {
      splits: [
        {
          amount_calculated: '100',
          route: [{ pool_key: { token0: '0x1', token1: '0x2' } }],
        },
        {
          amount_calculated: '50',
          route: [{ pool_key: { token0: '0x2', token1: '0x3' } }],
        },
      ],
    } as unknown as EkuboSwapInfoResponse
    expect(() => resolveEkuboExecutableRoute(data)).toThrow(/Multi-split/)
  })
})
