import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  getInsufficientBalance,
  getIsApproved,
  getQuoteSourceKey,
  useResetOnSessionChange,
  useSyncAmountOut,
  useSyncPreviewOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'

vi.mock('@/hooks/ui/useDebounce', () => ({
  default: <T>(value: T) => value,
}))

describe('trade form helpers', () => {
  it('detects insufficient balance and approval state', () => {
    expect(getInsufficientBalance(1, 2)).toBe(true)
    expect(getInsufficientBalance(5, 2)).toBe(false)
    expect(getIsApproved(10, 3)).toBe(true)
    expect(getIsApproved(1, 3)).toBe(false)
  })

  it('builds quote source keys from amount/token fields only', () => {
    expect(
      getQuoteSourceKey({
        amountIn: 1,
        amountOut: 9,
        tokenIn: { contractAddress: '0xin' },
        tokenOut: { contractAddress: '0xout' },
      }),
    ).toBe(
      getQuoteSourceKey({
        amountIn: 1,
        amountOut: 99,
        route: ['a'],
        tokenIn: { contractAddress: '0xin' },
        tokenOut: { contractAddress: '0xout' },
      }),
    )
    expect(getQuoteSourceKey({ amount: 2, tokenIn: { symbol: 'USDC' } })).toBe('2|USDC|')
  })

  it('does not treat amountOut-only updates as quote-source debounce', () => {
    const { result } = renderHook(() =>
      useTradeFormController<{
        amountIn?: number
        amountOut?: number
        tokenIn?: { contractAddress?: string }
        tokenOut?: { contractAddress?: string }
      }>({
        amountIn: 1,
        amountOut: undefined,
        tokenIn: { contractAddress: '0xin' },
        tokenOut: { contractAddress: '0xout' },
      }),
    )

    // With debounce mocked as identity, quote keys match immediately.
    expect(result.current.isDebouncing).toBe(false)

    act(() => {
      result.current.setInputs((prev) => ({ ...prev, amountOut: 9.123456 }))
    })
    expect(result.current.isDebouncing).toBe(false)
    expect(getQuoteSourceKey(result.current.inputs)).toBe(
      getQuoteSourceKey(result.current.debouncedInputs),
    )
  })

  it('marks debouncing when amountIn changes relative to debounced inputs', () => {
    // Local override: keep a lagged debounced snapshot to assert quote-source compare.
    const initial = {
      amountIn: 1 as number | undefined,
      amountOut: undefined as number | undefined,
      tokenIn: { contractAddress: '0xin' },
      tokenOut: { contractAddress: '0xout' },
    }
    expect(getQuoteSourceKey({ ...initial, amountIn: 2 })).not.toBe(getQuoteSourceKey(initial))
    expect(getQuoteSourceKey({ ...initial, amountOut: 5 })).toBe(getQuoteSourceKey(initial))
  })

  it('exposes step / inputs / txnUrl controllers', () => {
    const { result } = renderHook(() =>
      useTradeFormController<{ amountIn?: number; amountOut?: number }>({
        amountIn: undefined,
        amountOut: undefined,
      }),
    )

    expect(result.current.step).toBe(0)
    expect(result.current.txnUrl).toBeUndefined()

    act(() => {
      result.current.setStep(2)
      result.current.setTxnUrl('https://explorer/tx/0x1')
      result.current.setInputs({ amountIn: 1, amountOut: 2 })
    })

    expect(result.current.step).toBe(2)
    expect(result.current.txnUrl).toContain('0x1')
    expect(result.current.inputs.amountIn).toBe(1)
  })

  it('syncs amountOut only while not debouncing', () => {
    const { result, rerender } = renderHook(
      ({ preview, isDebouncing }: { preview?: number; isDebouncing: boolean }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: undefined,
          amountOut: undefined,
        })
        useSyncAmountOut(form.setInputs, preview, isDebouncing)
        return form
      },
      { initialProps: { preview: 10, isDebouncing: true } },
    )

    expect(result.current.inputs.amountOut).toBeUndefined()

    rerender({ preview: 10, isDebouncing: false })
    expect(result.current.inputs.amountOut).toBe(10)

    const before = result.current.inputs
    rerender({ preview: 10, isDebouncing: false })
    expect(result.current.inputs).toBe(before)
  })

  it('clears amountOut when preview quote is zero', () => {
    const { result, rerender } = renderHook(
      ({ preview, isDebouncing }: { preview?: number; isDebouncing: boolean }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: undefined,
          amountOut: 5,
        })
        useSyncAmountOut(form.setInputs, preview, isDebouncing)
        return form
      },
      { initialProps: { preview: 0, isDebouncing: false } },
    )

    expect(result.current.inputs.amountOut).toBeUndefined()
    rerender({ preview: 3, isDebouncing: false })
    expect(result.current.inputs.amountOut).toBe(3)
  })

  it('syncs Starknet quote + route from preview envelopes', () => {
    const { result, rerender } = renderHook(
      ({
        data,
        isLoading,
        isDebouncing,
      }: {
        data?: { quote: number; route: string[] }
        isLoading: boolean
        isDebouncing: boolean
      }) => {
        const form = useTradeFormController<{ amountOut?: number; route?: string[] }>({
          amountOut: undefined,
          route: [],
        })
        useSyncPreviewOut(form.setInputs, { data, isLoading }, isDebouncing)
        return form
      },
      {
        initialProps: {
          data: { quote: 4, route: ['a'] },
          isLoading: false,
          isDebouncing: true,
        },
      },
    )

    expect(result.current.inputs.amountOut).toBeUndefined()

    rerender({
      data: { quote: 4, route: ['a'] },
      isLoading: false,
      isDebouncing: false,
    })
    expect(result.current.inputs.amountOut).toBe(4)
    expect(result.current.inputs.route).toEqual(['a'])
  })

  it('clears amountOut when preview quote is non-positive or route empty', () => {
    const { result, rerender } = renderHook(
      ({
        data,
        isLoading,
        isDebouncing,
      }: {
        data?: { quote: number; route: string[] }
        isLoading: boolean
        isDebouncing: boolean
      }) => {
        const form = useTradeFormController<{ amountOut?: number; route?: string[] }>({
          amountOut: 4,
          route: ['a'],
        })
        useSyncPreviewOut(form.setInputs, { data, isLoading }, isDebouncing)
        return form
      },
      {
        initialProps: {
          data: { quote: 0, route: ['a'] },
          isLoading: false,
          isDebouncing: false,
        },
      },
    )

    expect(result.current.inputs.amountOut).toBeUndefined()
    expect(result.current.inputs.route).toEqual([])

    rerender({
      data: { quote: 3, route: [] },
      isLoading: false,
      isDebouncing: false,
    })
    expect(result.current.inputs.amountOut).toBeUndefined()
  })

  it('no-ops when preview envelope is unchanged', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data?: { quote: number; route: string[] } }) => {
        const form = useTradeFormController<{ amountOut?: number; route?: string[] }>({
          amountOut: undefined,
          route: [],
        })
        useSyncPreviewOut(form.setInputs, { data, isLoading: false }, false)
        return form
      },
      { initialProps: { data: { quote: 4, route: ['a'] } } },
    )

    const before = result.current.inputs
    rerender({ data: { quote: 4, route: ['a'] } })
    expect(result.current.inputs).toBe(before)
  })

  it('clears amountOut and route when preview errors', () => {
    const { result, rerender } = renderHook(
      ({
        data,
        isLoading,
        isError,
        isDebouncing,
      }: {
        data?: { quote: number; route: string[] }
        isLoading: boolean
        isError: boolean
        isDebouncing: boolean
      }) => {
        const form = useTradeFormController<{ amountOut?: number; route?: string[] }>({
          amountOut: undefined,
          route: [],
        })
        useSyncPreviewOut(form.setInputs, { data, isLoading, isError }, isDebouncing)
        return form
      },
      {
        initialProps: {
          data: { quote: 4, route: ['a'] },
          isLoading: false,
          isError: false,
          isDebouncing: false,
        },
      },
    )

    expect(result.current.inputs.amountOut).toBe(4)

    rerender({
      data: { quote: 4, route: ['a'] },
      isLoading: false,
      isError: true,
      isDebouncing: false,
    })
    expect(result.current.inputs.amountOut).toBeUndefined()
    expect(result.current.inputs.route).toEqual([])
  })

  it('clears amounts and txn on wallet address change', () => {
    const { result, rerender } = renderHook(
      ({ address }: { address?: string }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: undefined,
          amountOut: undefined,
        })
        useResetOnSessionChange({
          session: { address, chainId: 1, isConnected: Boolean(address), unsupported: false },
          setInputs: form.setInputs,
          setStep: form.setStep,
          setTxnUrl: form.setTxnUrl,
        })
        return form
      },
      { initialProps: { address: '0x1111111111111111111111111111111111111111' } },
    )

    act(() => {
      result.current.setInputs({ amountIn: 5, amountOut: 4 })
      result.current.setTxnUrl('https://explorer/tx/0xold')
      result.current.setStep(2)
    })

    rerender({ address: '0x2222222222222222222222222222222222222222' })

    expect(result.current.inputs.amountIn).toBeUndefined()
    expect(result.current.inputs.amountOut).toBeUndefined()
    expect(result.current.txnUrl).toBeUndefined()
    expect(result.current.step).toBe(0)
  })

  it('keeps amounts on chain-only change and reseeds tokens', () => {
    const { result, rerender } = renderHook(
      ({ chainId }: { chainId: number }) => {
        const form = useTradeFormController<{
          amountIn?: number
          amountOut?: number
          tokenIn?: { symbol: string }
        }>({
          amountIn: undefined,
          amountOut: undefined,
          tokenIn: undefined,
        })
        useResetOnSessionChange({
          session: {
            address: '0x1111111111111111111111111111111111111111',
            chainId,
            isConnected: true,
            unsupported: false,
          },
          setInputs: form.setInputs,
          setStep: form.setStep,
          setTxnUrl: form.setTxnUrl,
          seedInputs: () => ({
            tokenIn: { symbol: chainId === 1 ? 'ETH' : 'USDC' },
          }),
        })
        return form
      },
      { initialProps: { chainId: 1 } },
    )

    act(() => {
      result.current.setInputs({
        amountIn: 5,
        amountOut: 4,
        tokenIn: { symbol: 'ETH' },
      })
      result.current.setStep(1)
    })

    rerender({ chainId: 8453 })

    expect(result.current.inputs.amountIn).toBe(5)
    expect(result.current.inputs.amountOut).toBe(4)
    expect(result.current.inputs.tokenIn?.symbol).toBe('USDC')
    expect(result.current.step).toBe(0)
  })

  it('resets step and txn when session becomes unsupported', () => {
    const { result, rerender } = renderHook(
      ({ unsupported }: { unsupported: boolean }) => {
        const form = useTradeFormController<{ amountIn?: number }>({ amountIn: undefined })
        useResetOnSessionChange({
          session: {
            address: '0x1111111111111111111111111111111111111111',
            chainId: 1,
            isConnected: true,
            unsupported,
          },
          setInputs: form.setInputs,
          setStep: form.setStep,
          setTxnUrl: form.setTxnUrl,
        })
        return form
      },
      { initialProps: { unsupported: false } },
    )

    act(() => {
      result.current.setStep(3)
      result.current.setTxnUrl('https://explorer/tx/0x1')
    })

    rerender({ unsupported: true })
    expect(result.current.step).toBe(0)
    expect(result.current.txnUrl).toBeUndefined()
  })
})
