import { describe, expect, it } from 'vitest'

import {
  evmGetGasFee,
  GAS_FEE_MULTIPLIER,
  GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN,
  GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN,
} from '@/lib/gasFee'

describe('evmGetGasFee', () => {
  it('exports gas limit bump constants', () => {
    expect(GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN).toBe(115n)
    expect(GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN).toBe(100n)
    expect(GAS_FEE_MULTIPLIER).toBe(1.5)
  })

  it('prices gas from explicit used + gwei + ETH price', async () => {
    // 21000 * 1e9 gwei = 21000e9 wei = 2.1e-5 ETH; * 1.5 * $2000 ≈ 0.063
    const fee = await evmGetGasFee(21000n, 1_000_000_000n, { '1': { gasPrice: 0, price: 2000 } }, 1)
    expect(fee).toBeCloseTo(0.063, 5)
  })

  it('falls back to ethAndGasPrice for the chain, then mainnet', async () => {
    const fromChain = await evmGetGasFee(
      1000n,
      undefined,
      {
        '8453': { gasPrice: 2_000_000_000, price: 1000 },
        '1': { gasPrice: 1_000_000_000, price: 2000 },
      },
      8453,
    )
    expect(fromChain).toBeGreaterThan(0)

    const fromMainnetFallback = await evmGetGasFee(
      1000n,
      undefined,
      {
        '1': { gasPrice: 1_000_000_000, price: 2000 },
      },
      8453,
    )
    expect(fromMainnetFallback).toBeGreaterThan(0)
  })

  it('returns 0 when price inputs are missing', async () => {
    await expect(evmGetGasFee(undefined, undefined, {}, 1)).resolves.toBe(0)
  })
})
