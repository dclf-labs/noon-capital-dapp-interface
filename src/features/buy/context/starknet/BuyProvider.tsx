import React, { useEffect, useMemo, useRef } from 'react'

import { getTokens } from '@/config'
import { getAmountUsd } from '@/features/_shared/trade-amounts'
import {
  getInsufficientBalance,
  getIsApproved,
  useResetOnSessionChange,
  useSyncPreviewOut,
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

  const tokenInBalance = useTokenBalance(connection, inputs.tokenIn)
  const tokenOutBalance = useTokenBalance(connection, inputs.tokenOut)
  const tokenInAllowance = useBuyAllowance(connection, inputs.tokenIn)

  const tokenPrice = useTokenPrice(inputs.tokenIn)
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

  useSyncPreviewOut(setInputs, preview, isDebouncing || step > 0)

  const amountInUsd = useMemo(
    () => getAmountUsd(inputs.amountIn, tokenPrice),
    [inputs.amountIn, tokenPrice],
  )

  const inputsRef = useRef(inputs)
  useEffect(() => {
    inputsRef.current = inputs
  }, [inputs])

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
      const prev = inputsRef.current
      const keepIn = prev.tokenIn
        ? tokensIn?.find((token) => token.symbol === prev.tokenIn?.symbol)
        : undefined
      const keepOut = prev.tokenOut
        ? tokensOut?.find((token) => token.symbol === prev.tokenOut?.symbol)
        : undefined
      return {
        tokensIn,
        tokensOut,
        tokenIn: keepIn ?? tokensIn?.at(0),
        tokenOut: keepOut ?? tokensOut?.at(0),
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
