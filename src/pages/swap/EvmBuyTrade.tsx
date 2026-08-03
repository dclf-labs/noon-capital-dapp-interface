import { useCallback, useMemo, useState } from 'react'

import {
  getTradePrimaryAction,
  useTradeAmountHandlers,
  useTradeInputModel,
} from '@/features/_shared'
import {
  formatBalanceLabel,
  formatFeeUsd,
  formatNativeFeeDetail,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import useGeckoPrice from '@/features/api/hooks/useGeckoPrice'
import { useBuyBalance, useBuyForm, useBuyPrice, useBuyTxn } from '@/features/buy/hooks/evm/useBuy'
import useBuySubmit from '@/features/buy/hooks/evm/useBuySubmit'
import useUpdateBuy from '@/features/buy/hooks/evm/useUpdateBuy'
import { getSwapSpender } from '@/features/swap/lib/spender'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { useStickyValue } from '@/hooks/ui/useStickyValue'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { payAmountFromBuyAmount } from '@/mock/buy/buy-amount'
import { resolveBuyPoweredBy } from '@/mock/buy/powered-by'
import { BuyFlowView } from '@/pages/swap/BuyFlowView'

export function EvmBuyTrade() {
  const { inputs, connection, step, setStep, setInputs } = useBuyForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useBuyBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price } = useBuyPrice()
  const { submitFee, txnUrl, setTxnUrl } = useBuyTxn()
  const { setAmountIn, setTokenIn, setTokenOut } = useUpdateBuy()
  const buyTokenUsd = useGeckoPrice(inputs.tokenOut)
  const approve = useApprove()
  const submit = useBuySubmit()

  const unitOutPerIn = typeof price.data === 'number' && price.data > 0 ? price.data : undefined

  const onBuyAmountChange = useCallback(
    (buyAmount: number | undefined) => {
      if (buyAmount === undefined) {
        setInputs((prev) => ({ ...prev, amountIn: undefined, amountOut: undefined }))
        return
      }
      const pay = payAmountFromBuyAmount(buyAmount, unitOutPerIn)
      setInputs((prev) => ({
        ...prev,
        amountIn: pay,
        amountOut: buyAmount,
      }))
    },
    [setInputs, unitOutPerIn],
  )

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
        mode: 'buy',
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

  const liveFeeLabel = submitFee.isReady ? formatFeeUsd(submitFee.data) : undefined
  const liveFeeNativeLabel = submitFee.isReady
    ? formatNativeFeeDetail(submitFee.native, connection.config?.defaultGasToken?.symbol || 'ETH')
    : undefined
  const feeLabel = useStickyValue(liveFeeLabel)
  const feeNativeLabel = useStickyValue(liveFeeNativeLabel)
  // Don't paint a mismatched symbol/amount while the prior query is used as placeholder.
  const balanceInLabel =
    useStickyValue(
      tokenInBalance.isPlaceholderData || tokenInBalance.isLoading
        ? undefined
        : inputModel.balanceLabel,
    ) ?? inputModel.balanceLabel

  return (
    <BuyFlowView
      mode="buy"
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
      balanceInLabel={balanceInLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        inputs.tokenOut?.symbol,
        inputs.tokenOut?.decimals,
      )}
      unitRateLabel={typeof price.data === 'number' ? formatUnitRate(price.data) : undefined}
      feeLabel={feeLabel}
      feeNativeLabel={feeNativeLabel}
      isLoadingFee={!feeLabel && (submitFee.isLoading || submitFee.isFetching)}
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
