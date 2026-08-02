import { useCallback, useMemo, useState } from 'react'

import { useTradeAmountHandlers, useTradeInputModel } from '@/features/_shared'
import {
  formatBalanceLabel,
  formatNativeFee,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import { getMintRedeemPrimaryAction } from '@/features/mint-redeem'
import useIsWhitelisted from '@/features/redeem/hooks/useIsWhitelisted'
import {
  useRedeemBalance,
  useRedeemForm,
  useRedeemPrice,
  useRedeemTxn,
} from '@/features/redeem/hooks/useRedeem'
import useRedeemSubmit from '@/features/redeem/hooks/useRedeemSubmit'
import useUpdateRedeem from '@/features/redeem/hooks/useUpdateRedeem'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { MintRedeemPanel } from '@/mock/mint-redeem/MintRedeemPanel'

export function EvmRedeemFlow() {
  const { inputs, connection, step, setStep, setInputs, tokenIn } = useRedeemForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useRedeemBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useRedeemPrice()
  const { submitFee, txnUrl, setTxnUrl } = useRedeemTxn()
  const { setAmountIn, setTokenOut } = useUpdateRedeem()
  const whitelist = useIsWhitelisted(connection)
  const approve = useApprove()
  const submit = useRedeemSubmit()

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
      getMintRedeemPrimaryAction({
        mode: 'redeem',
        step,
        isConnected: connection.isConnected,
        isBalanceLoading: tokenInBalance.isLoading,
        isAllowanceLoading: tokenInAllowance.isLoading,
        isWhitelistLoading: whitelist.isLoading,
        isWhitelistError: whitelist.isError,
        isWhitelisted: whitelist.data,
        amountIn: inputs.amountIn,
        amountOut: inputs.amountOut,
        isFetchingQuote,
        isQuoteError,
        isInsufficientBalance,
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
      whitelist.data,
      whitelist.isError,
      whitelist.isLoading,
    ],
  )

  const onPrimary = useCallback(() => {
    if (step === 0 && !isApproved) {
      void approve(
        connection,
        connection.config?.directRedeemer,
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
      inputs.tokenOut,
      inputs.amountIn,
      inputs.amountOut,
      () => setStep(2),
      setSubmitStatus,
      setTxnUrl,
    )
  }, [
    approve,
    connection,
    inputs.amountIn,
    inputs.amountOut,
    inputs.tokenOut,
    isApproved,
    setStep,
    setTxnUrl,
    step,
    submit,
    tokenIn,
    tokenInAllowance.refetch,
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
    <MintRedeemPanel
      mode="redeem"
      step={step}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      tokenIn={tokenIn}
      tokenOut={inputs.tokenOut}
      variableTokens={inputs.tokensOut}
      amountIn={inputs.amountIn}
      amountOut={inputs.amountOut}
      amountInUsd={amountInUsd}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        inputs.tokenOut?.symbol,
        inputs.tokenOut?.decimals,
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
      isWhitelisted={whitelist.data}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={
        approveStatus === 'TXN_FAILURE'
          ? 'Approval failed'
          : submitStatus === SubmitTxnStatus.TXN_FAILURE
            ? 'Redeem failed'
            : undefined
      }
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      onAmountInChange={onAmountInChange}
      onHalf={onHalf}
      onMax={onMax}
      onVariableTokenChange={setTokenOut}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
