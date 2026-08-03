import { describe, expect, it } from 'vitest'

import { resolveBuyPoweredBy } from '@/mock/buy/powered-by'

describe('resolveBuyPoweredBy', () => {
  it('returns Syncswap when the chain has a Syncswap router', () => {
    expect(resolveBuyPoweredBy({ syncswapV3Router: '0x1' }).venue).toBe('syncswap')
  })

  it('returns Ekubo when the chain has an Ekubo router', () => {
    expect(resolveBuyPoweredBy({ ekuboRouter: '0x1' }).venue).toBe('ekubo')
  })

  it('returns Curve when the chain uses Curve pools', () => {
    expect(resolveBuyPoweredBy({ useCurvePools: true }).venue).toBe('curve')
    expect(resolveBuyPoweredBy({ curveRouter: '0x1' }).venue).toBe('curve')
  })

  it('defaults to Uniswap', () => {
    expect(resolveBuyPoweredBy(undefined).venue).toBe('uniswap')
    expect(resolveBuyPoweredBy({}).venue).toBe('uniswap')
  })

  it('prefers Ekubo over Syncswap when both are present', () => {
    expect(
      resolveBuyPoweredBy({
        ekuboRouter: '0x1',
        syncswapV3Router: '0x2',
      }).venue,
    ).toBe('ekubo')
  })
})
