import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useTransactionReceipt } from '@starknet-react/core'

import {
  getTradePrimaryAction,
  useTradeAmountHandlers,
  useTradeInputModel,
} from '@/features/_shared'
import {
  formatBalanceLabel,
  formatSubmitFeeLabels,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import {
  useSellBalance,
  useSellForm,
  useSellPrice,
  useSellTxn,
} from '@/features/sell/hooks/starknet/useSell'
import useSellSubmit from '@/features/sell/hooks/starknet/useSellSubmit'
import useUpdateSell from '@/features/sell/hooks/starknet/useUpdateSell'
import { StandardTradeFlowView } from '@/mock/_shared/StandardTradeFlowView'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

export function StarknetSellTrade() {
  const { inputs, connection, step, setStep, setInputs } = useSellForm()
  const { isInsufficientBalance, tokenInBalance, tokenOutBalance } = useSellBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price, tokenPrice } = useSellPrice()
  const { submitFee, txnUrl, setTxnUrl } = useSellTxn()
  const { setAmountIn, setTokenIn, setTokenOut } = useUpdateSell()
  const connectWalletFamily = useConnectWalletFamily()

  const submit = useSellSubmit(
    connection,
    inputs.tokenIn,
    inputs.tokenOut,
    inputs.amountIn,
    inputs.amountOut,
    inputs.route,
  )

  const receipt = useTransactionReceipt({
    hash: submit.txnHash,
    enabled: Boolean(submit.txnHash && connection.isConnected),
    watch: true,
    refetchInterval: 1000,
  })

  const dismissedHashRef = useRef<string | undefined>(undefined)

  const inputModel = useTradeInputModel({
    amount: inputs.amountIn,
    balance: tokenInBalance,
    tokenSymbol: inputs.tokenIn?.symbol,
    tokenDecimals: inputs.tokenIn?.decimals,
  })

  const { onAmountInChange } = useTradeAmountHandlers({
    setInputs,
    setAmountIn,
    balance: tokenInBalance.data,
    tokenIn: inputs.tokenIn,
    clearRoute: true,
  })

  const isBusy = submit.mutationStatus.isPending || (Boolean(submit.txnHash) && receipt.isLoading)

  useEffect(() => {
    if (!receipt.isSuccess || !submit.txnHash) return
    if (dismissedHashRef.current === submit.txnHash) return
    setTxnUrl(`${connection.config?.explorerUrl || ''}/tx/${submit.txnHash}`)
    setStep(2)
  }, [connection.config?.explorerUrl, receipt.isSuccess, setStep, setTxnUrl, submit.txnHash])

  const unitRate =
    price.data && typeof price.data === 'object' && 'quote' in price.data
      ? price.data.quote
      : typeof price.data === 'number'
        ? price.data
        : undefined

  const primary = useMemo(
    () =>
      getTradePrimaryAction({
        mode: 'sell',
        step,
        isConnected: connection.isConnected,
        isBalanceLoading: tokenInBalance.isLoading,
        amountIn: inputs.amountIn,
        amountOut: inputs.amountOut,
        hasRoute: Boolean(inputs.route?.length),
        isFetchingQuote,
        isQuoteError,
        isInsufficientBalance,
        isApproved: true,
        requiresApproval: false,
        tokenInSymbol: inputs.tokenIn?.symbol,
        isBusySubmit: isBusy,
        submitFailed: receipt.isError || submit.mutationStatus.isError,
      }),
    [
      connection.isConnected,
      inputs.amountIn,
      inputs.amountOut,
      inputs.route?.length,
      inputs.tokenIn?.symbol,
      isBusy,
      isFetchingQuote,
      isInsufficientBalance,
      isQuoteError,
      receipt.isError,
      step,
      submit.mutationStatus.isError,
      tokenInBalance.isLoading,
    ],
  )

  const onPrimary = useCallback(() => {
    if (!connection.isConnected) {
      void connectWalletFamily('starknet')
      return
    }
    if (step === 0) {
      setStep(1)
      return
    }
    submit.onSubmit()
  }, [connectWalletFamily, connection.isConnected, setStep, step, submit])

  const onBack = useCallback(() => setStep(0), [setStep])
  const onReset = useCallback(() => {
    if (submit.txnHash) dismissedHashRef.current = submit.txnHash
    setStep(0)
    setInputs((prev) => ({
      ...prev,
      amountIn: undefined,
      amountOut: undefined,
      route: [],
    }))
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl, submit.txnHash])

  const feeLabels = formatSubmitFeeLabels(
    submitFee,
    connection.config?.defaultGasToken?.symbol || 'STRK',
  )

  return (
    <StandardTradeFlowView
      step={step}
      payLabel="You're selling"
      receiveLabel="You're receiving"
      confirmTitle="Confirm your sell transaction"
      successHeadline="You have successfully sold"
      moreLabel="Sell more"
      payColumnLabel="Selling"
      receiveColumnLabel="To receive"
      tokenIn={inputs.tokenIn}
      tokenOut={inputs.tokenOut}
      tokensIn={inputs.tokensIn}
      tokensOut={inputs.tokensOut}
      onTokenInChange={setTokenIn}
      onTokenOutChange={setTokenOut}
      amountIn={inputs.amountIn}
      amountOut={inputs.amountOut}
      amountInUsd={amountInUsd}
      payTokenUsdPrice={tokenPrice.data}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        inputs.tokenOut?.symbol,
        inputs.tokenOut?.decimals,
      )}
      unitRateLabel={unitRate !== undefined ? formatUnitRate(unitRate) : undefined}
      feeLabel={feeLabels.feeLabel || '—'}
      feeNativeLabel={feeLabels.feeNativeLabel}
      isLoadingFee={submitFee.isLoading || submitFee.isFetching}
      isFetchingQuote={isFetchingQuote}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={receipt.isError || submit.mutationStatus.isError ? 'Swap failed' : undefined}
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      onAmountInChange={onAmountInChange}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
