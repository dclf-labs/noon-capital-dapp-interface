import { useCallback, useMemo } from 'react'

import type { FormInputs } from '@/features/unstake/context/types'
import { useUnstakeForm } from '@/features/unstake/hooks/useUnstake'

const useUpdateUnstake = () => {
  const { setInputs } = useUnstakeForm()

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

export default useUpdateUnstake
