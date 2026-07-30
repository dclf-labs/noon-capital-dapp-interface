import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/buy/context/starknet/types'
import { useBuyForm } from '@/features/buy/hooks/starknet/useBuy'

const useUpdateBuy = () => {
  const { setInputs } = useBuyForm()

  const setTokenIn = useCallback(
    (tokenIn: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        tokenIn,
      }))
    },
    [setInputs],
  )

  const setTokenOut = useCallback(
    (tokenOut: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        tokenOut,
      }))
    },
    [setInputs],
  )

  const setAmountIn = useCallback(
    (amountIn: number) => {
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
