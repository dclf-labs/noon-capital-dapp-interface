import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  getInsufficientBalance,
  getIsApproved,
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

  it('clears amounts and txn on session identity change', () => {
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
