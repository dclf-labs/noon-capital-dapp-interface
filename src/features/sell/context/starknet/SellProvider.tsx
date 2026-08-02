import React, { useMemo } from 'react'

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
  SellBalanceContext,
  SellFormContext,
  SellPriceContext,
  SellTxnContext,
} from '@/features/sell/context/starknet/context'
import { type FormInputs } from '@/features/sell/context/starknet/types'
import usePreviewSell from '@/features/sell/hooks/starknet/usePreviewSell'
import useSellAllowance from '@/features/sell/hooks/starknet/useSellAllowance'
import useSellSubmitFee from '@/features/sell/hooks/starknet/useSellSubmitFee'
import { useStarknetFamilySession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'

const INITIAL_SELL_INPUTS: FormInputs = {
  tokenIn: undefined,
  tokenOut: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensIn: undefined,
  tokensOut: undefined,
  route: [],
}

export const SellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_SELL_INPUTS)

  const connection = useStarknetFamilySession()

  const tokenInBalance = useTokenBalance(connection, inputs.tokenIn)
  const tokenOutBalance = useTokenBalance(connection, inputs.tokenOut)
  const tokenInAllowance = useSellAllowance(connection, inputs.tokenIn)

  const tokenPrice = useTokenPrice(inputs.tokenIn)
  const price = usePreviewSell(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut, 1)
  const preview = usePreviewSell(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.tokenOut,
    debouncedInputs.amountIn,
  )

  const submitFee = useSellSubmitFee(
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
      const tokensIn = getTokens(connection.config, connection.config?.buyTokens)
      const tokensOut = getTokens(connection.config, connection.config?.sellTokens)
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
    <SellFormContext.Provider value={formValue}>
      <SellBalanceContext.Provider value={balanceValue}>
        <SellPriceContext.Provider value={priceValue}>
          <SellTxnContext.Provider value={txnValue}>{children}</SellTxnContext.Provider>
        </SellPriceContext.Provider>
      </SellBalanceContext.Provider>
    </SellFormContext.Provider>
  )
}

export default SellProvider
