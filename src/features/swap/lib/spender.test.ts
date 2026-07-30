import { describe, expect, it } from 'vitest'

import type { ProtocolChainConfig } from '@/config/types'
import { getSwapSpender } from '@/features/swap/lib/spender'

const base = {
  useCurvePools: false,
  useUniv4Pools: false,
  curveRouter: '0x1111111111111111111111111111111111111111',
  permit2: '0x2222222222222222222222222222222222222222',
  uniUniversalRouter: '0x3333333333333333333333333333333333333333',
  uniV3SwapRouter: '0x4444444444444444444444444444444444444444',
} as unknown as ProtocolChainConfig

describe('getSwapSpender', () => {
  it('returns undefined without config', () => {
    expect(getSwapSpender(undefined)).toBeUndefined()
  })

  it('prefers curve router when curve pools are enabled', () => {
    expect(getSwapSpender({ ...base, useCurvePools: true })).toBe(base.curveRouter)
  })

  it('prefers permit2 then universal router for univ4', () => {
    expect(getSwapSpender({ ...base, useUniv4Pools: true })).toBe(base.permit2)
    expect(
      getSwapSpender({
        ...base,
        useUniv4Pools: true,
        permit2: undefined,
      } as unknown as ProtocolChainConfig),
    ).toBe(base.uniUniversalRouter)
  })

  it('falls back to uni v3 swap router', () => {
    expect(getSwapSpender(base)).toBe(base.uniV3SwapRouter)
  })
})
