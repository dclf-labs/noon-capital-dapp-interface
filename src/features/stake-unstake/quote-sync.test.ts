import { useEffect } from 'react'

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useSyncAmountOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'

vi.mock('@/hooks/ui/useDebounce', () => ({
  default: <T>(value: T) => value,
}))

describe('stake/unstake quote sync integration', () => {
  it('writes amountOut from vault preview while editing', () => {
    const { result, rerender } = renderHook(
      ({ preview, freeze }: { preview?: number; freeze: boolean }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: 10,
          amountOut: undefined,
        })
        useSyncAmountOut(form.setInputs, preview, freeze)
        return form
      },
      { initialProps: { preview: 9.87, freeze: false } },
    )

    expect(result.current.inputs.amountOut).toBe(9.87)
    rerender({ preview: 9.5, freeze: false })
    expect(result.current.inputs.amountOut).toBe(9.5)
  })

  it('freezes amountOut after confirm so vault rate moves cannot rewrite mins', () => {
    const { result, rerender } = renderHook(
      ({ preview, freeze }: { preview?: number; freeze: boolean }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: 10,
          amountOut: undefined,
        })
        useSyncAmountOut(form.setInputs, preview, freeze)
        return form
      },
      { initialProps: { preview: 10, freeze: false } },
    )

    expect(result.current.inputs.amountOut).toBe(10)
    rerender({ preview: 11, freeze: true })
    expect(result.current.inputs.amountOut).toBe(10)
  })

  it('clears amountOut on preview error while editing', () => {
    const { result, rerender } = renderHook(
      ({ preview, isError, step }: { preview?: number; isError: boolean; step: number }) => {
        const form = useTradeFormController<{ amountIn?: number; amountOut?: number }>({
          amountIn: 10,
          amountOut: 5,
        })
        useSyncAmountOut(
          form.setInputs,
          isError || preview === undefined ? undefined : preview,
          step > 0,
        )
        useEffect(() => {
          if (!isError || step > 0) return
          form.setInputs((prev) =>
            prev.amountOut === undefined ? prev : { ...prev, amountOut: undefined },
          )
        }, [form, isError, step])
        return form
      },
      { initialProps: { preview: 5 as number | undefined, isError: false, step: 0 } },
    )

    expect(result.current.inputs.amountOut).toBe(5)
    rerender({ preview: undefined, isError: true, step: 0 })
    expect(result.current.inputs.amountOut).toBeUndefined()

    rerender({ preview: 5, isError: false, step: 0 })
    expect(result.current.inputs.amountOut).toBe(5)
    act(() => {
      result.current.setStep(1)
    })
    rerender({ preview: undefined, isError: true, step: 1 })
    expect(result.current.inputs.amountOut).toBe(5)
  })
})
