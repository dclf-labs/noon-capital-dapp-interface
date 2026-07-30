import { useCallback, useMemo } from 'react'

import { type FormInputs } from '@/features/stake/context/types'
import { useStakeForm } from '@/features/stake/hooks/useStake'

const useUpdateStake = () => {
  const { setInputs } = useStakeForm()

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
      setAmountIn,
      setAmountOut,
    }),
    [setAmountIn, setAmountOut],
  )
}

export default useUpdateStake
