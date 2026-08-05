import { useCallback, useMemo, useState } from 'react'

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
} from '@/features/sell/hooks/evm/useSell'
import useSellSubmit from '@/features/sell/hooks/evm/useSellSubmit'
import useUpdateSell from '@/features/sell/hooks/evm/useUpdateSell'
import { getSwapSpender } from '@/features/swap/lib/spender'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { StandardTradeFlowView } from '@/mock/_shared/StandardTradeFlowView'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

export function EvmSellTrade() {
  const { inputs, connection, step, setStep, setInputs } = useSellForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useSellBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useSellPrice()
  const { submitFee, txnUrl, setTxnUrl } = useSellTxn()
  const { setAmountIn, setTokenIn, setTokenOut } = useUpdateSell()
  const approve = useApprove()
  const submit = useSellSubmit()
  const connectWalletFamily = useConnectWalletFamily()

  const [approveStatus, setApproveStatus] = useState<ApproveTxnStatus>('IDLE')
  const [submitStatus, setSubmitStatus] = useState<SubmitTxnStatus>(SubmitTxnStatus.IDLE)

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
  })

  const isBusyApprove = approveStatus === 'PROCESSING' || approveStatus === 'TXN_SUBMITTED_ON_CHAIN'
  const isBusySubmit =
    submitStatus === SubmitTxnStatus.PROCESSING ||
    submitStatus === SubmitTxnStatus.TXN_SUBMITTED_ON_CHAIN

  const primary = useMemo(
    () =>
      getTradePrimaryAction({
        mode: 'sell',
        step,
        isConnected: connection.isConnected,
        isBalanceLoading: tokenInBalance.isLoading,
        isAllowanceLoading: tokenInAllowance.isLoading,
        amountIn: inputs.amountIn,
        amountOut: inputs.amountOut,
        isFetchingQuote,
        isQuoteError,
        isInsufficientBalance,
        isApproved,
        requiresApproval: true,
        tokenInSymbol: inputs.tokenIn?.symbol,
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
      inputs.tokenIn?.symbol,
      isApproved,
      isBusyApprove,
      isBusySubmit,
      isFetchingQuote,
      isInsufficientBalance,
      isQuoteError,
      step,
      submitStatus,
      tokenInAllowance.isLoading,
      tokenInBalance.isLoading,
    ],
  )

  const onPrimary = useCallback(() => {
    if (!connection.isConnected) {
      void connectWalletFamily('evm')
      return
    }
    if (step === 0 && !isApproved) {
      void approve(
        connection,
        getSwapSpender(connection.config),
        inputs.tokenIn,
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
      inputs.tokenIn,
      inputs.tokenOut,
      inputs.amountIn,
      inputs.amountOut,
      submitFee.gasUsed as bigint | undefined,
      () => setStep(2),
      setSubmitStatus,
      setTxnUrl,
    )
  }, [
    approve,
    connectWalletFamily,
    connection,
    inputs.amountIn,
    inputs.amountOut,
    inputs.tokenIn,
    inputs.tokenOut,
    isApproved,
    setStep,
    setTxnUrl,
    step,
    submit,
    submitFee.gasUsed,
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

  const feeLabels = formatSubmitFeeLabels(
    submitFee,
    connection.config?.defaultGasToken?.symbol || 'ETH',
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
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        inputs.tokenOut?.symbol,
        inputs.tokenOut?.decimals,
      )}
      unitRateLabel={typeof price.data === 'number' ? formatUnitRate(price.data) : undefined}
      feeLabel={feeLabels.feeLabel || '—'}
      feeNativeLabel={feeLabels.feeNativeLabel}
      isLoadingFee={submitFee.isLoading || submitFee.isFetching}
      isFetchingQuote={isFetchingQuote}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={submitStatus === SubmitTxnStatus.TXN_FAILURE ? 'Swap failed' : undefined}
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
