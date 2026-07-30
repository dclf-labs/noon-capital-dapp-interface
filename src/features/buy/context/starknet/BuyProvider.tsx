import React, { useEffect, useMemo } from 'react'

import { getTokens } from '@/config'
import {
  getInsufficientBalance,
  getIsApproved,
  useResetOnSessionChange,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'
import useTokenPrice from '@/features/api/hooks/useTokenPrice'
import {
  BuyBalanceContext,
  BuyFormContext,
  BuyPriceContext,
  BuyTxnContext,
} from '@/features/buy/context/starknet/context'
import { type FormInputs } from '@/features/buy/context/starknet/types'
import useBuyAllowance from '@/features/buy/hooks/starknet/useBuyAllowance'
import useBuySubmitFee from '@/features/buy/hooks/starknet/useBuySubmitFee'
import usePreviewBuy from '@/features/buy/hooks/starknet/usePreviewBuy'
import { useStarknetFamilySession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'

const INITIAL_BUY_INPUTS: FormInputs = {
  tokenIn: undefined,
  tokenOut: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensIn: undefined,
  tokensOut: undefined,
  route: [],
}

export const BuyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_BUY_INPUTS)

  const connection = useStarknetFamilySession()

  const tokenInBalance = useTokenBalance(connection, debouncedInputs.tokenIn)
  const tokenOutBalance = useTokenBalance(connection, debouncedInputs.tokenOut)
  const tokenInAllowance = useBuyAllowance(connection, debouncedInputs.tokenIn)

  const tokenPrice = useTokenPrice(debouncedInputs.tokenIn)
  const price = usePreviewBuy(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut, 1)
  const preview = usePreviewBuy(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.tokenOut,
    debouncedInputs.amountIn,
  )

  const submitFee = useBuySubmitFee(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.tokenOut,
    debouncedInputs.amountIn,
    debouncedInputs.amountOut,
    debouncedInputs.route,
  )

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amountIn),
    [tokenInBalance.data, inputs.amountIn],
  )
  const isApproved = useMemo(
    () => getIsApproved(tokenInAllowance.data, inputs.amountIn),
    [inputs.amountIn, tokenInAllowance.data],
  )

  useEffect(() => {
    if (isDebouncing || preview.isLoading || preview.data === undefined) return
    setInputs((prev) => ({
      ...prev,
      amountOut: typeof preview.data === 'object' ? preview.data.quote : undefined,
      route: typeof preview.data === 'object' ? preview.data.route : [],
    }))
  }, [isDebouncing, preview.data, preview.isLoading, setInputs])

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
        route: [],
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

  const priceValue = useMemo(
    () => ({
      price,
      tokenPrice,
      isFetchingQuote: preview.isLoading || isDebouncing,
    }),
    [price, tokenPrice, preview.isLoading, isDebouncing],
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
