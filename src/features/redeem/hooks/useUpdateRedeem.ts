import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/redeem/context/types'
import { useRedeemForm } from '@/features/redeem/hooks/useRedeem'

const useUpdateRedeem = () => {
  const { setInputs } = useRedeemForm()

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
      setTokenOut,
      setAmountIn,
      setAmountOut,
    }),
    [setTokenOut, setAmountIn, setAmountOut],
  )
}

export default useUpdateRedeem
