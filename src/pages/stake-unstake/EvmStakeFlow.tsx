import { useCallback, useMemo, useState } from 'react'

import { useTradeAmountHandlers, useTradeInputModel } from '@/features/_shared'
import {
  formatBalanceLabel,
  formatNativeFee,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import {
  useStakeBalance,
  useStakeForm,
  useStakePrice,
  useStakeSubmit,
  useStakeTxn,
  useUpdateStake,
} from '@/features/stake'
import { getStakeUnstakePrimaryAction } from '@/features/stake-unstake'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { StakeUnstakePanel } from '@/mock/stake-unstake/StakeUnstakePanel'

export function EvmStakeFlow() {
  const { inputs, connection, step, setStep, setInputs, tokenIn, tokenOut } = useStakeForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useStakeBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useStakePrice()
  const { submitFee, txnUrl, setTxnUrl } = useStakeTxn()
  const { setAmountIn } = useUpdateStake()
  const approve = useApprove()
  const submit = useStakeSubmit()

  const [approveStatus, setApproveStatus] = useState<ApproveTxnStatus>('IDLE')
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

  const isBusyApprove = approveStatus === 'PROCESSING' || approveStatus === 'TXN_SUBMITTED_ON_CHAIN'
  const isBusySubmit =
    submitStatus === SubmitTxnStatus.PROCESSING ||
    submitStatus === SubmitTxnStatus.TXN_SUBMITTED_ON_CHAIN

  const primary = useMemo(
    () =>
      getStakeUnstakePrimaryAction({
        mode: 'stake',
        step,
        isConnected: connection.isConnected,
        isBalanceLoading: tokenInBalance.isLoading,
        isAllowanceLoading: tokenInAllowance.isLoading,
        amountIn: inputs.amountIn,
        amountOut: inputs.amountOut,
        isFetchingQuote,
        isQuoteError,
        isInsufficientBalance,
        requiresApproval: true,
        isApproved,
        tokenInSymbol: tokenIn?.symbol,
        approveStatus,
        isBusyApprove,
        isBusySubmit,
        submitFailed: submitStatus === SubmitTxnStatus.TXN_FAILURE,
      }),
    [
      approveStatus,
      connection.isConnected,
      inputs.amountIn,
      inputs.amountOut,
      isApproved,
      isBusyApprove,
      isBusySubmit,
      isFetchingQuote,
      isInsufficientBalance,
      isQuoteError,
      step,
      submitStatus,
      tokenIn?.symbol,
      tokenInAllowance.isLoading,
      tokenInBalance.isLoading,
    ],
  )

  const onPrimary = useCallback(() => {
    if (step === 0 && !isApproved) {
      void approve(
        connection,
        connection.config?.stakingVault,
        tokenIn,
        undefined,
        tokenInAllowance.refetch,
        setApproveStatus,
      )
      return
    }
    if (step === 0) {
      setStep(1)
      return
    }
    void submit(
      connection,
      tokenIn,
      tokenOut,
      inputs.amountIn,
      () => setStep(2),
      setSubmitStatus,
      setTxnUrl,
    )
  }, [
    approve,
    connection,
    inputs.amountIn,
    isApproved,
    setStep,
    setTxnUrl,
    step,
    submit,
    tokenIn,
    tokenInAllowance.refetch,
    tokenOut,
  ])

  const onBack = useCallback(() => setStep(0), [setStep])
  const onReset = useCallback(() => {
    setStep(0)
    setInputs((prev) => ({ ...prev, amountIn: undefined, amountOut: undefined }))
    setApproveStatus('IDLE')
    setSubmitStatus(SubmitTxnStatus.IDLE)
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl])

  return (
    <StakeUnstakePanel
      mode="stake"
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
        submitFee.data !== undefined
          ? formatNativeFee(submitFee.data, connection.config?.defaultGasToken?.symbol || 'ETH')
          : undefined
      }
      isFetchingQuote={isFetchingQuote}
      isInsufficientBalance={isInsufficientBalance}
      isApproved={isApproved}
      requiresApproval
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={submitStatus === SubmitTxnStatus.TXN_FAILURE ? 'Stake failed' : undefined}
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
