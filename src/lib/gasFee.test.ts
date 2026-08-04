import { describe, expect, it } from 'vitest'

import { STARKNET_MAINNET_CHAIN_ID } from '@/config/chain-id'
import {
  evmGetGasFee,
  evmGetGasFeeBreakdown,
  evmGetGasFeeNative,
  GAS_FEE_MULTIPLIER,
  GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN,
  GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN,
  resolveNativeGasUsdPrice,
  toGasFeeUsd,
} from '@/lib/gasFee'

describe('gas fee USD integration', () => {
  it('exports gas limit bump constants', () => {
    expect(GAS_LIMIT_MULTIPLIER_NUMERATOR_IN_BN).toBe(115n)
    expect(GAS_LIMIT_MULTIPLIER_DENOMINATOR_IN_BN).toBe(100n)
    expect(GAS_FEE_MULTIPLIER).toBe(1.5)
  })

  it('prices EVM gas from gas units × wei-per-gas × native USD', async () => {
    // 21000 * 1e9 wei = 2.1e-5 ETH; * 1.5 * $2000 ≈ 0.063
    const fee = await evmGetGasFee(21000n, 1_000_000_000n, { '1': { gasPrice: 0, price: 2000 } }, 1)
    expect(fee).toBeCloseTo(0.063, 5)

    const breakdown = await evmGetGasFeeBreakdown(
      21000n,
      1_000_000_000n,
      { '1': { gasPrice: 0, price: 2000 } },
      1,
    )
    expect(breakdown.native).toBeCloseTo(0.0000315, 8)
    expect(breakdown.usd).toBeCloseTo(0.063, 5)
    expect(breakdown.usd).toBeCloseTo(toGasFeeUsd(breakdown.native, 2000), 8)
  })

  it('uses Sophon / TAC native USD prices (not ETH) for non-ETH gas chains', async () => {
    const sophon = await evmGetGasFeeBreakdown(
      100_000n,
      1_000_000_000n,
      {
        '50104': { gasPrice: 0, price: 0.01 },
        '1': { gasPrice: 0, price: 2000 },
      },
      50104,
      { allowMainnetEthFallback: false },
    )
    // native = 100000 * 1e9 / 1e18 * 1.5 = 0.00015
    expect(sophon.native).toBeCloseTo(0.00015, 8)
    expect(sophon.usd).toBeCloseTo(0.00015 * 0.01, 8)

    const tac = await evmGetGasFeeBreakdown(
      100_000n,
      1_000_000_000n,
      {
        '239': { gasPrice: 0, price: 0.05 },
        '1': { gasPrice: 0, price: 2000 },
      },
      239,
      { allowMainnetEthFallback: false },
    )
    expect(tac.usd).toBeCloseTo(0.00015 * 0.05, 8)
  })

  it('does not fall back to ETH USD for STRK / non-ETH gas tokens', () => {
    // Live map missing starknet → bundled DEFAULT starknet USD (not mainnet ETH).
    const starkDefault = resolveNativeGasUsdPrice(
      { '1': { gasPrice: 0, price: 2000 } },
      'starknet',
      {
        allowMainnetEthFallback: false,
      },
    )
    expect(starkDefault).toBeGreaterThan(0)
    expect(starkDefault).toBeLessThan(10)

    expect(
      resolveNativeGasUsdPrice(
        { starknet: { gasPrice: 0, price: 0.0326 }, '1': { gasPrice: 0, price: 2000 } },
        'starknet',
        { allowMainnetEthFallback: false },
      ),
    ).toBeCloseTo(0.0326, 6)

    // Protocol config uses numeric Starknet chain id; gas-tracker keys `'starknet'`.
    expect(
      resolveNativeGasUsdPrice(
        { starknet: { gasPrice: 0, price: 0.0326 }, '1': { gasPrice: 0, price: 2000 } },
        STARKNET_MAINNET_CHAIN_ID,
        { allowMainnetEthFallback: false },
      ),
    ).toBeCloseTo(0.0326, 6)

    // Non-ETH natives use dedicated gas-tracker entries (never ETH USD fallback).
    for (const chainKey of [30378, 80094, 4114, 'starknet'] as const) {
      expect(
        resolveNativeGasUsdPrice({ '1': { gasPrice: 0, price: 2000 } }, chainKey, {
          allowMainnetEthFallback: false,
        }),
      ).toBeGreaterThan(0)
    }
    // Base (8453) can use ETH USD fallback when its own entry is missing from a live map.
    expect(
      resolveNativeGasUsdPrice({ '1': { gasPrice: 0, price: 2000 } }, 8453, {
        allowMainnetEthFallback: true,
      }),
    ).toBe(2000)

    // Sophon missing from live map → bundled DEFAULT sophon USD (not ETH).
    const sophonDefault = resolveNativeGasUsdPrice({ '1': { gasPrice: 0, price: 2000 } }, 50104, {
      allowMainnetEthFallback: false,
    })
    expect(sophonDefault).toBeGreaterThan(0)
    expect(sophonDefault).toBeLessThan(1)
  })

  it('ignores zero live USD prices and uses bundled defaults', () => {
    expect(
      resolveNativeGasUsdPrice(
        { starknet: { gasPrice: 0, price: 0 }, '1': { gasPrice: 0, price: 0 } },
        'starknet',
        { allowMainnetEthFallback: false },
      ),
    ).toBeGreaterThan(0)

    expect(
      resolveNativeGasUsdPrice({ '1': { gasPrice: 0, price: 0 } }, 1, {
        allowMainnetEthFallback: true,
      }),
    ).toBeGreaterThan(0)
  })

  it('allows mainnet ETH USD fallback only for ETH-gas chains', () => {
    expect(
      resolveNativeGasUsdPrice({ '1': { gasPrice: 0, price: 2000 } }, 324, {
        allowMainnetEthFallback: true,
      }),
    ).toBe(2000)
  })

  it('falls back to API gas price when on-chain gas price is missing', async () => {
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

  it('returns 0 native / usd when inputs are missing', () => {
    expect(evmGetGasFeeNative(undefined, undefined, {}, 1)).toBe(0)
    expect(toGasFeeUsd(0.01, 0)).toBe(0)
    expect(toGasFeeUsd(0, 2000)).toBe(0)
  })
})
