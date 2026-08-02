import React, { useMemo } from 'react'

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
  RedeemBalanceContext,
  RedeemFormContext,
  RedeemPriceContext,
  RedeemTxnContext,
} from '@/features/redeem/context/context'
import { type FormInputs } from '@/features/redeem/context/types'
import usePreviewRedeem from '@/features/redeem/hooks/usePreviewRedeem'
import useRedeemAllowance from '@/features/redeem/hooks/useRedeemAllowance'
import useRedeemSubmitFee from '@/features/redeem/hooks/useRedeemSubmitFee'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'

const INITIAL_REDEEM_INPUTS: FormInputs = {
  tokenOut: undefined,
  amountIn: undefined,
  amountOut: undefined,
  tokensOut: undefined,
}

export const RedeemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, debouncedInputs, txnUrl, setTxnUrl, isDebouncing } =
    useTradeFormController(INITIAL_REDEEM_INPUTS)

  const connection = useEvmTargetSession(mainnet.id)
  const tokenIn = getToken(connection.config, 'USN')

  const tokenInBalance = useTokenBalance(connection, tokenIn)
  const tokenInAllowance = useRedeemAllowance(connection, tokenIn)
  const tokenOutBalance = useTokenBalance(connection, debouncedInputs.tokenOut)

  const tokenInPrice = useTokenPrice(tokenIn)
  const tokenOutPrice = useTokenPrice(debouncedInputs.tokenOut)
  const price = usePreviewRedeem(connection, tokenIn, 1, tokenOutPrice.data)
  const preview = usePreviewRedeem(
    connection,
    tokenIn,
    debouncedInputs.amountIn,
    tokenOutPrice.data,
  )

  const submitFee = useRedeemSubmitFee()

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amountIn),
    [tokenInBalance.data, inputs.amountIn],
  )
  const isApproved = useMemo(
    () => getIsApproved(tokenInAllowance.data, inputs.amountIn),
    [inputs.amountIn, tokenInAllowance.data],
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
    seedInputs: () => {
      const tokensOut = getTokens(connection.config, connection.config?.redeemCollaterals)
      return { tokensOut, tokenOut: tokensOut?.at(0) }
    },
  })

  const formValue = useMemo(
    () => ({ inputs, setInputs, step, setStep, connection, tokenIn }),
    [inputs, setInputs, step, setStep, connection, tokenIn],
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
    () => getAmountUsd(inputs.amountIn, tokenInPrice),
    [inputs.amountIn, tokenInPrice],
  )

  const priceValue = useMemo(
    () => ({
      price,
      tokenOutPrice,
      amountInUsd,
      isFetchingQuote: preview.isLoading || isDebouncing,
    }),
    [amountInUsd, price, tokenOutPrice, preview.isLoading, isDebouncing],
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
    <RedeemFormContext.Provider value={formValue}>
      <RedeemBalanceContext.Provider value={balanceValue}>
        <RedeemPriceContext.Provider value={priceValue}>
          <RedeemTxnContext.Provider value={txnValue}>{children}</RedeemTxnContext.Provider>
        </RedeemPriceContext.Provider>
      </RedeemBalanceContext.Provider>
    </RedeemFormContext.Provider>
  )
}

export default RedeemProvider
