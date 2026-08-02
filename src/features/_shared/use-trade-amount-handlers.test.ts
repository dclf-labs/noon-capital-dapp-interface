import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NATIVE_GAS_RESERVE } from '@/features/_shared/trade-amounts'
import { useTradeAmountHandlers } from '@/features/_shared/use-trade-amount-handlers'

describe('useTradeAmountHandlers', () => {
  it('clears amountIn/amountOut (and route when requested)', () => {
    const setInputs = vi.fn((updater) => updater({ amountIn: 1, amountOut: 2, route: ['a'] }))
    const setAmountIn = vi.fn()
    const { result } = renderHook(() =>
      useTradeAmountHandlers({
        setInputs,
        setAmountIn,
        balance: 10,
        clearRoute: true,
      }),
    )

    act(() => {
      result.current.onAmountInChange(undefined)
    })
    expect(setInputs).toHaveBeenCalled()
    const next = setInputs.mock.calls[0]?.[0]({ amountIn: 1, amountOut: 2, route: ['a'] })
    expect(next).toEqual({ amountIn: undefined, amountOut: undefined, route: [] })
  })

  it('sets amountIn for typed values and Half / Max presets', () => {
    const setInputs = vi.fn()
    const setAmountIn = vi.fn()
    const { result } = renderHook(() =>
      useTradeAmountHandlers({
        setInputs,
        setAmountIn,
        balance: 10,
        tokenIn: {
          symbol: 'ETH',
          name: 'Ether',
          decimals: 18,
          iconSlug: 'eth',
          contractAddress: '0xeth' as never,
          isNative: true,
        },
      }),
    )

    act(() => {
      result.current.onAmountInChange(1.5)
      result.current.onHalf()
      result.current.onMax()
    })

    expect(setAmountIn).toHaveBeenCalledWith(1.5)
    expect(setAmountIn).toHaveBeenCalledWith(5)
    expect(setAmountIn).toHaveBeenCalledWith(10 - NATIVE_GAS_RESERVE)
  })

  it('does not call setAmountIn when Half/Max resolve to zero', () => {
    const setAmountIn = vi.fn()
    const { result } = renderHook(() =>
      useTradeAmountHandlers({
        setInputs: vi.fn(),
        setAmountIn,
        balance: 0,
      }),
    )

    act(() => {
      result.current.onHalf()
      result.current.onMax()
    })
    expect(setAmountIn).not.toHaveBeenCalled()
  })
})
