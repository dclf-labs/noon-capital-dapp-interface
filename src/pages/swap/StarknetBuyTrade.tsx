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
import useTokenPrice from '@/features/api/hooks/useTokenPrice'
import {
  useBuyBalance,
  useBuyForm,
  useBuyPrice,
  useBuyTxn,
} from '@/features/buy/hooks/starknet/useBuy'
import useBuySubmit from '@/features/buy/hooks/starknet/useBuySubmit'
import useUpdateBuy from '@/features/buy/hooks/starknet/useUpdateBuy'
import { useStickyValue } from '@/hooks/ui/useStickyValue'
import { payAmountFromBuyAmount } from '@/mock/buy/buy-amount'
import { resolveBuyPoweredBy } from '@/mock/buy/powered-by'
import { BuyFlowView } from '@/pages/swap/BuyFlowView'

export function StarknetBuyTrade() {
  const { inputs, connection, step, setStep, setInputs } = useBuyForm()
  const { isApproved, isInsufficientBalance, tokenInBalance, tokenOutBalance } = useBuyBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useBuyPrice()
  const { submitFee, txnUrl, setTxnUrl } = useBuyTxn()
  const { setAmountIn, setTokenIn, setTokenOut } = useUpdateBuy()
  const buyTokenUsd = useTokenPrice(inputs.tokenOut)

  const submit = useBuySubmit(
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

  // Prevent success effect from re-opening step 2 after "Buy more" with the same tx hash.
  const dismissedHashRef = useRef<string | undefined>(undefined)

  const inputModel = useTradeInputModel({
    amount: inputs.amountIn,
    balance: tokenInBalance,
    tokenSymbol: inputs.tokenIn?.symbol,
    tokenDecimals: inputs.tokenIn?.decimals,
  })

  const { onAmountInChange, onHalf, onMax } = useTradeAmountHandlers({
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

  const unitOutPerIn = typeof unitRate === 'number' && unitRate > 0 ? unitRate : undefined

  const onBuyAmountChange = useCallback(
    (buyAmount: number | undefined) => {
      if (buyAmount === undefined) {
        setInputs((prev) => ({
          ...prev,
          amountIn: undefined,
          amountOut: undefined,
          route: [],
        }))
        return
      }
      const pay = payAmountFromBuyAmount(buyAmount, unitOutPerIn)
      setInputs((prev) => ({
        ...prev,
        amountIn: pay,
        amountOut: buyAmount,
        route: [],
      }))
    },
    [setInputs, unitOutPerIn],
  )

  const primary = useMemo(
    () =>
      getTradePrimaryAction({
        mode: 'buy',
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
        tokenOutSymbol: inputs.tokenOut?.symbol,
        isBusySubmit: isBusy,
        submitFailed: receipt.isError || submit.mutationStatus.isError,
      }),
    [
      connection.isConnected,
      inputs.amountIn,
      inputs.amountOut,
      inputs.route?.length,
      inputs.tokenOut?.symbol,
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
    if (step === 0) {
      setStep(1)
      return
    }
    submit.onSubmit()
  }, [setStep, step, submit])

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

  const { feeLabel: liveFeeLabel, feeNativeLabel: liveFeeNativeLabel } = formatSubmitFeeLabels(
    submitFee,
    connection.config?.defaultGasToken?.symbol || 'STRK',
  )
  const feeLabel = useStickyValue(liveFeeLabel)
  const feeNativeLabel = useStickyValue(liveFeeNativeLabel)

  return (
    <BuyFlowView
      mode="buy"
      chainFamily="starknet"
      step={step}
      showHero={false}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      tokenIn={inputs.tokenIn}
      tokenOut={inputs.tokenOut}
      tokensIn={inputs.tokensIn}
      tokensOut={inputs.tokensOut}
      amountIn={inputs.amountIn}
      amountOut={inputs.amountOut}
      amountInUsd={amountInUsd}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        inputs.tokenOut?.symbol,
        inputs.tokenOut?.decimals,
      )}
      unitRateLabel={unitRate !== undefined ? formatUnitRate(unitRate) : undefined}
      feeLabel={feeLabel}
      feeNativeLabel={feeNativeLabel}
      isLoadingFee={submitFee.isLoading || submitFee.isFetching}
      poweredBy={resolveBuyPoweredBy(connection.config)}
      isFetchingQuote={isFetchingQuote}
      isInsufficientBalance={isInsufficientBalance}
      isApproved={isApproved}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      buyTokenUsdPrice={buyTokenUsd.data}
      unitOutPerIn={unitOutPerIn}
      onBuyAmountChange={onBuyAmountChange}
      onAmountInChange={onAmountInChange}
      onHalf={onHalf}
      onMax={onMax}
      onTokenInChange={setTokenIn}
      onTokenOutChange={setTokenOut}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
