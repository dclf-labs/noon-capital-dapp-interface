import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/sell/context/evm/types'
import { useSellForm } from '@/features/sell/hooks/evm/useSell'

const useUpdateSell = () => {
  const { setInputs } = useSellForm()

  const setTokenIn = useCallback(
    (tokenIn: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        tokenIn,
        amountOut: undefined,
      }))
    },
    [setInputs],
  )

  const setTokenOut = useCallback(
    (tokenOut: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        tokenOut,
        amountOut: undefined,
      }))
    },
    [setInputs],
  )

  const setAmountIn = useCallback(
    (amountIn: number) => {
      // Keep prior amountOut while the new quote loads (pulse + sticky receive).
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        amountIn,
      }))
    },
    [setInputs],
  )

  const setAmountOut = useCallback(
    (amountOut: number) => {
      setInputs((prevState) => ({
        ...prevState,
        amountOut,
      }))
    },
    [setInputs],
  )

  return useMemo(
    () => ({
      setTokenIn,
      setTokenOut,
      setAmountIn,
      setAmountOut,
    }),
    [setTokenIn, setTokenOut, setAmountIn, setAmountOut],
  )
}

export default useUpdateSell
