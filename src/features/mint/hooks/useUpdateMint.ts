import { useCallback, useMemo } from 'react'

import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/mint/context/types'
import { useMintForm } from '@/features/mint/hooks/useMint'

const useUpdateMint = () => {
  const { setInputs } = useMintForm()

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

  const setAmountIn = useCallback(
    (amountIn: number) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        amountIn,
        amountOut: undefined,
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
      setAmountIn,
      setAmountOut,
    }),
    [setTokenIn, setAmountIn, setAmountOut],
  )
}

export default useUpdateMint
