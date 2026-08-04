import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useTradeAmountHandlers, useTradeInputModel } from '@/features/_shared'
import {
  formatBalanceLabel,
  formatSubmitFeeLabels,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import { getStakeUnstakePrimaryAction } from '@/features/stake-unstake'
import {
  useUnstakeBalance,
  useUnstakeForm,
  useUnstakePrice,
  useUnstakeSubmit,
  useUnstakeTxn,
  useUpdateUnstake,
} from '@/features/unstake'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import { queryKeys } from '@/lib/query-keys'
import { StakeUnstakePanel } from '@/mock/stake-unstake/StakeUnstakePanel'

export function EvmUnstakeFlow() {
  const { inputs, connection, step, setStep, setInputs, tokenIn, tokenOut } = useUnstakeForm()
  const { isInsufficientBalance, tokenInBalance, tokenOutBalance } = useUnstakeBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useUnstakePrice()
  const { submitFee, txnUrl, setTxnUrl } = useUnstakeTxn()
  const { setAmountIn } = useUpdateUnstake()
  const submit = useUnstakeSubmit()
  const queryClient = useQueryClient()

  const [submitStatus, setSubmitStatus] = useState<SubmitTxnStatus>(SubmitTxnStatus.IDLE)

  const inputModel = useTradeInputModel({
    amount: inputs.amountIn,
    balance: tokenInBalance,
    tokenSymbol: tokenIn?.symbol,
    tokenDecimals: tokenIn?.decimals,
  })

  const { onAmountInChange, onHalf, onMax } = useTradeAmountHandlers({
    setInputs,
    setAmountIn,
    balance: tokenInBalance.data,
    tokenIn,
  })

  const isBusySubmit =
    submitStatus === SubmitTxnStatus.PROCESSING ||
    submitStatus === SubmitTxnStatus.TXN_SUBMITTED_ON_CHAIN

  const primary = useMemo(
    () =>
      getStakeUnstakePrimaryAction({
        mode: 'unstake',
        step,
        isConnected: connection.isConnected,
        isBalanceLoading: tokenInBalance.isLoading,
        amountIn: inputs.amountIn,
        amountOut: inputs.amountOut,
        isFetchingQuote,
        isQuoteError,
        isInsufficientBalance,
        requiresApproval: false,
        isApproved: true,
        tokenInSymbol: tokenIn?.symbol,
        isBusyApprove: false,
        isBusySubmit,
        submitFailed: submitStatus === SubmitTxnStatus.TXN_FAILURE,
      }),
    [
      connection.isConnected,
      inputs.amountIn,
      inputs.amountOut,
      isBusySubmit,
      isFetchingQuote,
      isInsufficientBalance,
      isQuoteError,
      step,
      submitStatus,
      tokenIn?.symbol,
      tokenInBalance.isLoading,
    ],
  )

  const onPrimary = useCallback(() => {
    if (step === 0) {
      setStep(1)
      return
    }
    // Critical: pass previewed USN assets (amountOut), not sUSN shares.
    void submit(
      connection,
      tokenIn,
      tokenOut,
      inputs.amountOut,
      () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.withdraw.requests() })
        setStep(2)
      },
      setSubmitStatus,
      setTxnUrl,
    )
  }, [
    connection,
    inputs.amountOut,
    queryClient,
    setStep,
    setTxnUrl,
    step,
    submit,
    tokenIn,
    tokenOut,
  ])

  const onBack = useCallback(() => setStep(0), [setStep])
  const onReset = useCallback(() => {
    setStep(0)
    setInputs((prev) => ({ ...prev, amountIn: undefined, amountOut: undefined }))
    setSubmitStatus(SubmitTxnStatus.IDLE)
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl])

  return (
    <StakeUnstakePanel
      mode="unstake"
      step={step}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      tokenIn={tokenIn}
      tokenOut={tokenOut}
      amountIn={inputs.amountIn}
      amountOut={inputs.amountOut}
      amountInUsd={amountInUsd}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        tokenOut?.symbol,
        tokenOut?.decimals,
      )}
      unitRateLabel={typeof price.data === 'number' ? formatUnitRate(price.data) : undefined}
      feeLabel={
        formatSubmitFeeLabels(submitFee, connection.config?.defaultGasToken?.symbol || 'ETH')
          .feeLabel
      }
      isFetchingQuote={isFetchingQuote}
      isInsufficientBalance={isInsufficientBalance}
      isApproved
      requiresApproval={false}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={submitStatus === SubmitTxnStatus.TXN_FAILURE ? 'Unstake failed' : undefined}
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      onAmountInChange={onAmountInChange}
      onHalf={onHalf}
      onMax={onMax}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
