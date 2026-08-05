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
import { StandardTradeFlowView } from '@/mock/_shared/StandardTradeFlowView'
import { StatusCallout } from '@/mock/bridge/StatusCallout'
import { UNSTAKE_COOLDOWN_NOTICE } from '@/mock/stake-unstake/constants'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

const unstakeCooldownCallout = (
  <StatusCallout
    type={UNSTAKE_COOLDOWN_NOTICE.type}
    title={UNSTAKE_COOLDOWN_NOTICE.title}
    description={UNSTAKE_COOLDOWN_NOTICE.description}
  />
)

export function EvmUnstakeFlow() {
  const { inputs, connection, step, setStep, setInputs, tokenIn, tokenOut } = useUnstakeForm()
  const { isInsufficientBalance, tokenInBalance, tokenOutBalance } = useUnstakeBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price, tokenPrice } = useUnstakePrice()
  const { submitFee, txnUrl, setTxnUrl } = useUnstakeTxn()
  const { setAmountIn } = useUpdateUnstake()
  const submit = useUnstakeSubmit()
  const queryClient = useQueryClient()
  const connectWalletFamily = useConnectWalletFamily()

  const [submitStatus, setSubmitStatus] = useState<SubmitTxnStatus>(SubmitTxnStatus.IDLE)

  const inputModel = useTradeInputModel({
    amount: inputs.amountIn,
    balance: tokenInBalance,
    tokenSymbol: tokenIn?.symbol,
    tokenDecimals: tokenIn?.decimals,
  })

  const { onAmountInChange } = useTradeAmountHandlers({
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
    if (!connection.isConnected) {
      void connectWalletFamily('evm')
      return
    }
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
    connectWalletFamily,
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

  const feeLabels = formatSubmitFeeLabels(
    submitFee,
    connection.config?.defaultGasToken?.symbol || 'ETH',
  )

  return (
    <StandardTradeFlowView
      step={step}
      payLabel="You're unstaking"
      receiveLabel="You're receiving"
      confirmTitle="Confirm your unstake transaction"
      successHeadline="You have successfully unstaked"
      moreLabel="Unstake more"
      notice={unstakeCooldownCallout}
      confirmNotice={unstakeCooldownCallout}
      tokenIn={tokenIn}
      tokenOut={tokenOut}
      amountIn={inputs.amountIn}
      amountOut={inputs.amountOut}
      amountInUsd={amountInUsd}
      payTokenUsdPrice={tokenPrice.data}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        tokenOut?.symbol,
        tokenOut?.decimals,
      )}
      unitRateLabel={typeof price.data === 'number' ? formatUnitRate(price.data) : undefined}
      feeLabel={feeLabels.feeLabel || '—'}
      feeNativeLabel={feeLabels.feeNativeLabel}
      isLoadingFee={submitFee.isLoading || submitFee.isFetching}
      isFetchingQuote={isFetchingQuote}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled || Boolean(connection.unsupported)}
      primaryLoading={primary.loading}
      statusMessage={
        connection.unsupported
          ? 'Unstake is only available on Ethereum mainnet.'
          : submitStatus === SubmitTxnStatus.TXN_FAILURE
            ? 'Unstake failed'
            : undefined
      }
      txnUrl={txnUrl}
      presetsDisabled={
        inputModel.isPresetDisabled || tokenInBalance.isLoading || Boolean(connection.unsupported)
      }
      onAmountInChange={onAmountInChange}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
