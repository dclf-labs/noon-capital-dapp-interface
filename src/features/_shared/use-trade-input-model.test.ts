import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NATIVE_GAS_RESERVE } from '@/features/_shared/trade-amounts'
import { getTradeMaxAmount } from '@/features/_shared/trade-input-format'
import { useTradeInputModel } from '@/features/_shared/use-trade-input-model'

describe('useTradeInputModel', () => {
  it('exposes clipped input value and USD label', () => {
    const { result } = renderHook(() =>
      useTradeInputModel({
        amount: 12.3456789,
        tokenPrice: { data: 2 },
        balance: { data: 100 },
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
      }),
    )

    expect(result.current.inputValue).toBe('12.345678')
    expect(result.current.amountUsd).toBeCloseTo(24.691356)
    expect(result.current.amountUsdLabel).toContain('$')
    expect(result.current.balanceLabel).toMatch(/^Bal:/)
    expect(result.current.isPresetDisabled).toBe(false)
  })

  it('disables presets while balance is loading / errored / empty', () => {
    const loading = renderHook(() => useTradeInputModel({ balance: { isLoading: true, data: 1 } }))
    expect(loading.result.current.isPresetDisabled).toBe(true)

    const errored = renderHook(() => useTradeInputModel({ balance: { isError: true, data: 1 } }))
    expect(errored.result.current.isPresetDisabled).toBe(true)

    const empty = renderHook(() => useTradeInputModel({ balance: { data: 0 } }))
    expect(empty.result.current.isPresetDisabled).toBe(true)
  })

  it('computes half / max from balance at 6dp', () => {
    const { result } = renderHook(() => useTradeInputModel({ balance: { data: 10.1234567 } }))
    expect(result.current.halfAmount).toBe(5.061728)
    expect(result.current.maxAmount).toBe(10.123456)
  })

  it('aligns native Max helper with gas reserve', () => {
    expect(getTradeMaxAmount(1, true)).toBe(1 - NATIVE_GAS_RESERVE)
    expect(getTradeMaxAmount(1, false)).toBe(1)
  })
})
