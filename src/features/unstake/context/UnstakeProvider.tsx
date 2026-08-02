import React, { useMemo } from 'react'

import { mainnet } from 'wagmi/chains'

import { getToken } from '@/config'
import { getAmountUsd } from '@/features/_shared/trade-amounts'
import {
  getInsufficientBalance,
  useResetOnSessionChange,
  useSyncAmountOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'
import useTokenPrice from '@/features/api/hooks/useTokenPrice'
import {
  UnstakeBalanceContext,
  UnstakeFormContext,
  UnstakePriceContext,
  UnstakeTxnContext,
} from '@/features/unstake/context/context'
import type { FormInputs } from '@/features/unstake/context/types'
import usePreviewUnstake from '@/features/unstake/hooks/usePreviewUnstake'
import useUnstakeSubmitFee from '@/features/unstake/hooks/useUnstakeSubmitFee'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'

const INITIAL_UNSTAKE_INPUTS: FormInputs = {
  amountIn: undefined,
  amountOut: undefined,
}

export const UnstakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_UNSTAKE_INPUTS)

  const connection = useEvmTargetSession(mainnet.id)
  const tokenIn = getToken(connection.config, 'sUSN')
  const tokenOut = getToken(connection.config, 'USN')

  const tokenOutBalance = useTokenBalance(connection, tokenOut)
  const tokenInBalance = useTokenBalance(connection, tokenIn)

  const tokenPrice = useTokenPrice(tokenIn)
  const price = usePreviewUnstake(connection, tokenIn, tokenOut, 1)
  const preview = usePreviewUnstake(connection, tokenIn, tokenOut, debouncedInputs.amountIn)

  const submitFee = useUnstakeSubmitFee(connection, tokenIn, debouncedInputs.amountIn)

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amountIn),
    [tokenInBalance.data, inputs.amountIn],
  )

  useSyncAmountOut(setInputs, preview.isLoading ? undefined : preview.data, isDebouncing)

  useResetOnSessionChange({
    session: {
      address: connection.address,
      chainId: connection.config?.id,
      unsupported: connection.unsupported,
      isConnected: connection.isConnected,
    },
    setInputs,
    setStep,
    setTxnUrl,
  })

  const formValue = useMemo(
    () => ({ inputs, setInputs, step, setStep, connection, tokenIn, tokenOut }),
    [inputs, setInputs, step, setStep, connection, tokenIn, tokenOut],
  )

  const balanceValue = useMemo(
    () => ({
      tokenInBalance,
      tokenOutBalance,
      isInsufficientBalance,
    }),
    [tokenInBalance, tokenOutBalance, isInsufficientBalance],
  )

  const amountInUsd = useMemo(
    () => getAmountUsd(inputs.amountIn, tokenPrice),
    [inputs.amountIn, tokenPrice],
  )

  const priceValue = useMemo(
    () => ({
      price,
      tokenPrice,
      amountInUsd,
      isFetchingQuote: preview.isLoading || isDebouncing,
    }),
    [amountInUsd, price, tokenPrice, preview.isLoading, isDebouncing],
  )

  const txnValue = useMemo(
    () => ({
      txnUrl,
      setTxnUrl,
      submitFee,
    }),
    [txnUrl, setTxnUrl, submitFee],
  )

  return (
    <UnstakeFormContext.Provider value={formValue}>
      <UnstakeBalanceContext.Provider value={balanceValue}>
        <UnstakePriceContext.Provider value={priceValue}>
          <UnstakeTxnContext.Provider value={txnValue}>{children}</UnstakeTxnContext.Provider>
        </UnstakePriceContext.Provider>
      </UnstakeBalanceContext.Provider>
    </UnstakeFormContext.Provider>
  )
}

export default UnstakeProvider
