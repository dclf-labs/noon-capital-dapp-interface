import React, { useEffect, useMemo } from 'react'

import { getTokens } from '@/config'
import { getAmountUsd } from '@/features/_shared/trade-amounts'
import {
  getInsufficientBalance,
  getIsApproved,
  useResetOnSessionChange,
  useSyncAmountOut,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'
import useGeckoPrice from '@/features/api/hooks/useGeckoPrice'
import {
  BuyBalanceContext,
  BuyFormContext,
  BuyPriceContext,
  BuyTxnContext,
} from '@/features/buy/context/evm/context'
import { type FormInputs } from '@/features/buy/context/evm/types'
import useBuyAllowance from '@/features/buy/hooks/evm/useBuyAllowance'
import useBuySubmitFee from '@/features/buy/hooks/evm/useBuySubmitFee'
import usePreviewBuy from '@/features/buy/hooks/evm/usePreviewBuy'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { isEvmChainId } from '@/lib/chain'
import { useActiveChainStore } from '@/state/active-chain'

const INITIAL_BUY_INPUTS: FormInputs = {
  tokenIn: undefined,
  tokenOut: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensIn: undefined,
  tokensOut: undefined,
}

export const BuyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_BUY_INPUTS)

  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const connection = useEvmTargetSession(
    isEvmChainId(selectedChainId) ? selectedChainId : undefined,
  )

  // Balances/allowance follow the live token so Half/Max stay correct while amount debounces.
  const tokenInBalance = useTokenBalance(connection, inputs.tokenIn)
  const tokenOutBalance = useTokenBalance(connection, inputs.tokenOut)
  const tokenInAllowance = useBuyAllowance(connection, inputs.tokenIn)

  const tokenPrice = useGeckoPrice(inputs.tokenIn)
  const price = usePreviewBuy(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut, 1)
  const preview = usePreviewBuy(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.tokenOut,
    debouncedInputs.amountIn,
  )

  const submitFee = useBuySubmitFee(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut)

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amountIn),
    [tokenInBalance.data, inputs.amountIn],
  )
  const isApproved = useMemo(
    () => getIsApproved(tokenInAllowance.data, inputs.amountIn),
    [inputs.amountIn, tokenInAllowance.data],
  )

  // Freeze quote sync on confirm so the shown amounts cannot drift under the user.
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
    seedInputs: () => {
      const tokensIn = getTokens(connection.config, connection.config?.sellTokens)
      const tokensOut = getTokens(connection.config, connection.config?.buyTokens)
      return {
        tokensIn,
        tokensOut,
        tokenIn: tokensIn?.at(0),
        tokenOut: tokensOut?.at(0),
      }
    },
  })

  const formValue = useMemo(
    () => ({ inputs, setInputs, step, setStep, connection }),
    [inputs, setInputs, step, setStep, connection],
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
    [amountInUsd, price, tokenPrice, preview.isLoading, preview.isError, isDebouncing],
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
    <BuyFormContext.Provider value={formValue}>
      <BuyBalanceContext.Provider value={balanceValue}>
        <BuyPriceContext.Provider value={priceValue}>
          <BuyTxnContext.Provider value={txnValue}>{children}</BuyTxnContext.Provider>
        </BuyPriceContext.Provider>
      </BuyBalanceContext.Provider>
    </BuyFormContext.Provider>
  )
}

export default BuyProvider
