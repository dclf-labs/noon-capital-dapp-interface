import { useEffect } from 'react'

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useResetOnSessionChange,
  useSyncAmountOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'

vi.mock('@/hooks/ui/useDebounce', () => ({
  default: <T>(value: T) => value,
}))

/**
 * Integration-style coverage for the quote sync rules MintProvider / RedeemProvider share:
 * sync while step === 0, freeze after confirm, clear on error while still editing,
 * and reseed on wallet session change.
 */
describe('mint/redeem quote sync integration', () => {
  it('writes amountOut from preview when step === 0', () => {
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

  it('does not overwrite amountOut after advancing to confirm step', () => {
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
    rerender({ preview: 99, freeze: true })
    expect(result.current.inputs.amountOut).toBe(10)
  })

  it('clears amountOut on preview error while on step 0, but not after confirm', () => {
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

  it('reseeds collateral tokens and clears amounts on wallet session change', () => {
    const { result, rerender } = renderHook(
      ({ address }: { address?: string }) => {
        const form = useTradeFormController<{
          amountIn?: number
          amountOut?: number
          tokensIn?: string[]
          tokenIn?: string
        }>({
          amountIn: undefined,
          amountOut: undefined,
          tokensIn: undefined,
          tokenIn: undefined,
        })
        useResetOnSessionChange({
          session: {
            address,
            chainId: 1,
            isConnected: Boolean(address),
            unsupported: false,
          },
          setInputs: form.setInputs,
          setStep: form.setStep,
          setTxnUrl: form.setTxnUrl,
          seedInputs: () => ({
            tokensIn: ['USDT', 'USDC'],
            tokenIn: 'USDT',
          }),
        })
        return form
      },
      { initialProps: { address: '0x1111111111111111111111111111111111111111' } },
    )

    expect(result.current.inputs.tokensIn).toEqual(['USDT', 'USDC'])
    expect(result.current.inputs.tokenIn).toBe('USDT')

    act(() => {
      result.current.setInputs((prev) => ({ ...prev, amountIn: 5, amountOut: 4 }))
      result.current.setStep(1)
    })

    rerender({ address: '0x2222222222222222222222222222222222222222' })

    expect(result.current.inputs.amountIn).toBeUndefined()
    expect(result.current.inputs.amountOut).toBeUndefined()
    expect(result.current.inputs.tokenIn).toBe('USDT')
    expect(result.current.step).toBe(0)
  })
})
