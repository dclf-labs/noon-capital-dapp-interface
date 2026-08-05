import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/sell/context/starknet/types'
import { useSellForm } from '@/features/sell/hooks/starknet/useSell'

const useUpdateSell = () => {
  const { setInputs } = useSellForm()

  const setTokenIn = useCallback(
    (tokenIn: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        tokenIn,
        amountOut: undefined,
        route: [],
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
        route: [],
      }))
    },
    [setInputs],
  )

  const setAmountIn = useCallback(
    (amountIn: number) => {
      // Keep prior amountOut while the new quote loads; drop stale route only.
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        amountIn,
        route: [],
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
