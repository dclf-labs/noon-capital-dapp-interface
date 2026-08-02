import { describe, expect, it } from 'vitest'

import {
  activeEvmProtocolConfigs,
  ethereumConfig,
  getActiveProtocolConfig,
  getCurvePool,
  getProtocolChainIds,
  getProtocolConfig,
  getToken,
  getTokens,
  getTokensWithoutNative,
  getUniV3Pool,
  getUniV4Pool,
  PointsApiChain,
  protocolConfigs,
  SUI_MAINNET_CHAIN_ID,
  suiConfig,
} from '@/config'

describe('protocol configs', () => {
  it('registers expected active EVM deployments', () => {
    expect(
      Object.keys(activeEvmProtocolConfigs)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual([1, 239, 324, 999, 4114, 8453, 50104, 80094].sort((a, b) => a - b))
  })

  it('keeps monad in the full registry but not active EVM set', () => {
    expect(getProtocolConfig(143)?.iconSlug).toBe('monad')
    expect(activeEvmProtocolConfigs[143]).toBeUndefined()
    expect(protocolConfigs[143]).toBeDefined()
    expect(getActiveProtocolConfig(1)?.iconSlug).toBe('ethereum')
    expect(getActiveProtocolConfig(143)).toBeUndefined()
    expect(getProtocolChainIds()).toContain(1)
  })

  it('exposes ethereum contracts and USN token metadata', () => {
    expect(ethereumConfig.usn).toBe('0xdA67B4284609d2d48e5d10cfAc411572727dc1eD')
    expect(ethereumConfig.pointsApiChainId).toBe(PointsApiChain.ETHEREUM)

    const usn = getToken(ethereumConfig, 'USN')
    expect(usn?.symbol).toBe('USN')
    expect(usn?.chainId).toBe(1)

    const susn = getToken(ethereumConfig, 'SUSN')
    expect(susn?.symbol).toBe('sUSN')

    expect(getToken(undefined, 'USN')).toBeUndefined()
    expect(getToken(ethereumConfig, undefined)).toBeUndefined()

    const pool = getUniV3Pool(ethereumConfig, 'USDT', 'USN')
    expect(pool?.pool).toMatch(/^0x/i)
    expect(getUniV3Pool(ethereumConfig, 'USDT', undefined)).toBeUndefined()
  })

  it('resolves token lists and non-native filters', () => {
    const tokens = getTokens(ethereumConfig, ['USN', 'sUSN', 'MISSING'])
    expect(tokens?.some((t) => t.symbol === 'USN')).toBe(true)
    expect(getTokens(undefined, ['USN'])).toBeUndefined()
    expect(getTokens(ethereumConfig, undefined)).toBeUndefined()
    expect(getTokens(ethereumConfig, ['MISSING'])).toBeUndefined()

    const withoutNative = getTokensWithoutNative(ethereumConfig, ethereumConfig.sellTokens)
    expect(withoutNative?.every((t) => !t.isNative)).toBe(true)
    expect(getTokensWithoutNative(ethereumConfig, undefined)).toBeUndefined()
  })

  it('resolves curve and uni v4 pools when configured', () => {
    const curve = getCurvePool(ethereumConfig, 'USN', 'USDT')
    if (curve) {
      expect(curve.chainId).toBe(1)
    }
    expect(getCurvePool(ethereumConfig, undefined, 'USN')).toBeUndefined()

    const v4 = getUniV4Pool(ethereumConfig, 'USN', 'USDT')
    if (v4) {
      expect(v4.chainId).toBe(1)
    }
    expect(getUniV4Pool(ethereumConfig, undefined, 'USN')).toBeUndefined()
  })

  it('keeps sui layerzero object ids', () => {
    expect(suiConfig.id).toBe(SUI_MAINNET_CHAIN_ID)
    expect(suiConfig.tokens?.sUSN?.layerzeroOftObjectId).toMatch(/^0x/)
    expect(suiConfig.tokens?.sUSN?.layerzeroOappObjectId).toMatch(/^0x/)
  })
})
