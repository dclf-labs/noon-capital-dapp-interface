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
  SellBalanceContext,
  SellFormContext,
  SellPriceContext,
  SellTxnContext,
} from '@/features/sell/context/evm/context'
import { type FormInputs } from '@/features/sell/context/evm/types'
import usePreviewSell from '@/features/sell/hooks/evm/usePreviewSell'
import useSellAllowance from '@/features/sell/hooks/evm/useSellAllowance'
import useSellSubmitFee from '@/features/sell/hooks/evm/useSellSubmitFee'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import { isEvmChainId } from '@/lib/chain'
import { useActiveChainStore } from '@/state/active-chain'

const INITIAL_SELL_INPUTS: FormInputs = {
  tokenIn: undefined,
  tokenOut: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensIn: undefined,
  tokensOut: undefined,
}

export const SellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_SELL_INPUTS)

  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const connection = useEvmTargetSession(
    isEvmChainId(selectedChainId) ? selectedChainId : undefined,
  )

  const tokenInBalance = useTokenBalance(connection, inputs.tokenIn)
  const tokenOutBalance = useTokenBalance(connection, inputs.tokenOut)
  const tokenInAllowance = useSellAllowance(connection, inputs.tokenIn)

  const tokenPrice = useGeckoPrice(inputs.tokenIn)
  const price = usePreviewSell(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut, 1)
  const preview = usePreviewSell(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.tokenOut,
    debouncedInputs.amountIn,
  )

  const submitFee = useSellSubmitFee(connection, debouncedInputs.tokenIn, debouncedInputs.tokenOut)

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
    seedInputs: () => {
      const tokensIn = getTokens(connection.config, connection.config?.buyTokens)
      const tokensOut = getTokens(connection.config, connection.config?.sellTokens)
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
