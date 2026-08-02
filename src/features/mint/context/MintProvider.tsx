import React, { useEffect, useMemo } from 'react'

import { mainnet } from 'wagmi/chains'

import { getToken, getTokens } from '@/config'
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
  MintBalanceContext,
  MintFormContext,
  MintPriceContext,
  MintTxnContext,
} from '@/features/mint/context/context'
import { type FormInputs } from '@/features/mint/context/types'
import useMintAllowance from '@/features/mint/hooks/useMintAllowance'
import useMintSubmitFee from '@/features/mint/hooks/useMintSubmitFee'
import usePreviewMint from '@/features/mint/hooks/usePreviewMint'
import {
  isMintRedeemPricePending,
  isMintRedeemPriceUnavailable,
} from '@/features/mint-redeem/preview'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'

const INITIAL_MINT_INPUTS: FormInputs = {
  tokenIn: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensIn: undefined,
}

export const MintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_MINT_INPUTS)

  const connection = useEvmTargetSession(mainnet.id)
  const tokenOut = getToken(connection.config, 'USN')

  const tokenOutBalance = useTokenBalance(connection, tokenOut)
  const tokenInBalance = useTokenBalance(connection, inputs.tokenIn)
  const tokenInAllowance = useMintAllowance(connection, inputs.tokenIn)

  const tokenPrice = useTokenPrice(inputs.tokenIn)
  const price = usePreviewMint(connection, debouncedInputs.tokenIn, 1, tokenPrice.data)
  const preview = usePreviewMint(
    connection,
    debouncedInputs.tokenIn,
    debouncedInputs.amountIn,
    tokenPrice.data,
  )

  const submitFee = useMintSubmitFee(
    connection,
    debouncedInputs.tokenIn,
    tokenOut,
    debouncedInputs.amountIn,
    debouncedInputs.amountOut,
  )

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
      const tokensIn = getTokens(connection.config, connection.config?.mintCollaterals)
      return { tokensIn, tokenIn: tokensIn?.at(0) }
    },
  })

  const formValue = useMemo(
    () => ({ inputs, setInputs, step, setStep, connection, tokenOut }),
    [inputs, setInputs, step, setStep, connection, tokenOut],
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

  const priceValue = useMemo(() => {
    const amountForQuote = debouncedInputs.amountIn
    const pricePending = isMintRedeemPricePending(amountForQuote, tokenPrice.isLoading)
    const priceUnavailable = isMintRedeemPriceUnavailable(
      amountForQuote,
      tokenPrice.isLoading,
      tokenPrice.data,
      tokenPrice.isError,
    )
    return {
      price,
      tokenPrice,
      amountInUsd,
      isFetchingQuote: preview.isLoading || isDebouncing || pricePending,
      isQuoteError: preview.isError || priceUnavailable,
    }
  }, [
    amountInUsd,
    debouncedInputs.amountIn,
    isDebouncing,
    price,
    preview.isError,
    preview.isLoading,
    tokenPrice,
  ])

  const txnValue = useMemo(
    () => ({
      txnUrl,
      setTxnUrl,
      submitFee,
    }),
    [txnUrl, setTxnUrl, submitFee],
  )

  return (
    <MintFormContext.Provider value={formValue}>
      <MintBalanceContext.Provider value={balanceValue}>
        <MintPriceContext.Provider value={priceValue}>
          <MintTxnContext.Provider value={txnValue}>{children}</MintTxnContext.Provider>
        </MintPriceContext.Provider>
      </MintBalanceContext.Provider>
    </MintFormContext.Provider>
  )
}

export default MintProvider
