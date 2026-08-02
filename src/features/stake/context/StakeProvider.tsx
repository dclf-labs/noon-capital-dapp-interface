import React, { useEffect, useMemo } from 'react'

import { mainnet } from 'wagmi/chains'

import { getToken } from '@/config'
import { getAmountUsd } from '@/features/_shared/trade-amounts'
import {
  getInsufficientBalance,
  getIsApproved,
  useResetOnSessionChange,
  useSyncAmountOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'
import useTokenPrice from '@/features/api/hooks/useTokenPrice'
import {
  StakeBalanceContext,
  StakeFormContext,
  StakePriceContext,
  StakeTxnContext,
} from '@/features/stake/context/context'
import { type FormInputs } from '@/features/stake/context/types'
import usePreviewStake from '@/features/stake/hooks/usePreviewStake'
import useStakeAllowance from '@/features/stake/hooks/useStakeAllowance'
import useStakeSubmitFee from '@/features/stake/hooks/useStakeSubmitFee'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'

const INITIAL_STAKE_INPUTS: FormInputs = {
  amountIn: undefined,
  amountOut: undefined,
}

export const StakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_STAKE_INPUTS)

  const connection = useEvmTargetSession(mainnet.id)
  const tokenIn = getToken(connection.config, 'USN')
  const tokenOut = getToken(connection.config, 'sUSN')

  const tokenOutBalance = useTokenBalance(connection, tokenOut)
  const tokenInBalance = useTokenBalance(connection, tokenIn)
  const tokenInAllowance = useStakeAllowance(connection, tokenIn)

  const tokenPrice = useTokenPrice(tokenIn)
  const price = usePreviewStake(connection, tokenIn, tokenOut, 1)
  const preview = usePreviewStake(connection, tokenIn, tokenOut, debouncedInputs.amountIn)

  const submitFee = useStakeSubmitFee(connection, tokenIn, debouncedInputs.amountIn)

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amountIn),
    [tokenInBalance.data, inputs.amountIn],
  )
  const isApproved = useMemo(
    () => getIsApproved(tokenInAllowance.data, inputs.amountIn),
    [inputs.amountIn, tokenInAllowance.data],
  )

  useSyncAmountOut(
    setInputs,
    preview.isLoading || preview.isError ? undefined : preview.data,
    isDebouncing || step > 0,
  )

  useEffect(() => {
    if (!preview.isError || step > 0) return
    setInputs((prev) => (prev.amountOut === undefined ? prev : { ...prev, amountOut: undefined }))
  }, [preview.isError, setInputs, step])

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
      tokenInAllowance,
      isInsufficientBalance,
      isApproved,
    }),
    [tokenInBalance, tokenOutBalance, tokenInAllowance, isInsufficientBalance, isApproved],
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
      isQuoteError: preview.isError,
    }),
    [amountInUsd, isDebouncing, price, preview.isError, preview.isLoading, tokenPrice],
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
    <StakeFormContext.Provider value={formValue}>
      <StakeBalanceContext.Provider value={balanceValue}>
        <StakePriceContext.Provider value={priceValue}>
          <StakeTxnContext.Provider value={txnValue}>{children}</StakeTxnContext.Provider>
        </StakePriceContext.Provider>
      </StakeBalanceContext.Provider>
    </StakeFormContext.Provider>
  )
}

export default StakeProvider
