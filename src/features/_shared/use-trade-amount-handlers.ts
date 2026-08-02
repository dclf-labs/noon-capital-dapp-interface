import { type Dispatch, type SetStateAction, useCallback } from 'react'

import type { Token } from '@/config/token'
import { getPresetAmount } from '@/features/_shared/trade-amounts'
import { getTradeMaxAmount } from '@/features/_shared/trade-input-format'

type AmountFields = {
  amountIn?: number
  amountOut?: number
  route?: unknown[]
}

type UseTradeAmountHandlersParams<TInputs extends AmountFields> = {
  setInputs: Dispatch<SetStateAction<TInputs>>
  setAmountIn: (amount: number) => void
  balance?: number
  tokenIn?: Token
  /** When true, clearing also resets Starknet `route`. */
  clearRoute?: boolean
}

/**
 * Shared Half / Max / amount-change handlers for buy & sell panels.
 */
export function useTradeAmountHandlers<TInputs extends AmountFields>({
  setInputs,
  setAmountIn,
  balance,
  tokenIn,
  clearRoute = false,
}: UseTradeAmountHandlersParams<TInputs>) {
  const onAmountInChange = useCallback(
    (amount: number | undefined) => {
      if (amount === undefined) {
        setInputs((prev) => ({
          ...prev,
          amountIn: undefined,
          amountOut: undefined,
          ...(clearRoute ? { route: [] } : null),
        }))
        return
      }
      setAmountIn(amount)
    },
    [clearRoute, setAmountIn, setInputs],
  )

  const onHalf = useCallback(() => {
    const next = getPresetAmount(balance, 'half')
    if (next > 0) setAmountIn(next)
  }, [balance, setAmountIn])

  const onMax = useCallback(() => {
    const next = getTradeMaxAmount(balance, tokenIn?.isNative)
    if (next > 0) setAmountIn(next)
  }, [balance, setAmountIn, tokenIn?.isNative])

  return { onAmountInChange, onHalf, onMax }
}
