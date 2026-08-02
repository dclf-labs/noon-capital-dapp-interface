import { describe, expect, it } from 'vitest'

import { SUI_SUSN_COIN_TYPE } from '@/config/chains/sui'
import type { Token } from '@/config/token'
import { getSuiCoinType, NATIVE_SUI_COIN_TYPE } from '@/lib/sui-coin'

describe('getSuiCoinType', () => {
  it('resolves sUSN and native SUI', () => {
    expect(getSuiCoinType({ symbol: 'sUSN' } as Token)).toBe(SUI_SUSN_COIN_TYPE)
    expect(getSuiCoinType({ symbol: 'SUI' } as Token)).toBe(NATIVE_SUI_COIN_TYPE)
    expect(getSuiCoinType({ symbol: 'ETH', isNative: true } as Token)).toBe(NATIVE_SUI_COIN_TYPE)
  })

  it('returns undefined for unknown tokens', () => {
    expect(getSuiCoinType(undefined)).toBeUndefined()
    expect(getSuiCoinType({ symbol: 'USDC' } as Token)).toBeUndefined()
  })
})
