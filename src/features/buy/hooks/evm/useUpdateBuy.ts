import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/buy/context/evm/types'
import { useBuyForm } from '@/features/buy/hooks/evm/useBuy'

const useUpdateBuy = () => {
  const { setInputs } = useBuyForm()

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

export default useUpdateBuy
