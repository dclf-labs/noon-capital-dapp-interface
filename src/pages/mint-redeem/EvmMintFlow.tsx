import { useCallback, useMemo, useState } from 'react'

import { useTradeAmountHandlers, useTradeInputModel } from '@/features/_shared'
import {
  formatBalanceLabel,
  formatSubmitFeeLabels,
  formatUnitRate,
} from '@/features/_shared/trade-display'
import useIsWhitelisted from '@/features/mint/hooks/useIsWhitelisted'
import {
  useMintBalance,
  useMintForm,
  useMintPrice,
  useMintTxn,
} from '@/features/mint/hooks/useMint'
import useMintSubmit from '@/features/mint/hooks/useMintSubmit'
import useUpdateMint from '@/features/mint/hooks/useUpdateMint'
import { getMintRedeemPrimaryAction } from '@/features/mint-redeem'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { TxnStatus as SubmitTxnStatus } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { StandardTradeFlowView } from '@/mock/_shared/StandardTradeFlowView'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

export function EvmMintFlow() {
  const { inputs, connection, step, setStep, setInputs, tokenOut } = useMintForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useMintBalance()
  const { amountInUsd, isFetchingQuote, isQuoteError, price, tokenPrice } = useMintPrice()
  const { submitFee, txnUrl, setTxnUrl } = useMintTxn()
  const { setAmountIn, setTokenIn } = useUpdateMint()
  const whitelist = useIsWhitelisted(connection)
  const approve = useApprove()
  const submit = useMintSubmit()
  const connectWalletFamily = useConnectWalletFamily()

  const [approveStatus, setApproveStatus] = useState<ApproveTxnStatus>('IDLE')
  const [submitStatus, setSubmitStatus] = useState<SubmitTxnStatus>(SubmitTxnStatus.IDLE)

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
  })

  const isBusyApprove = approveStatus === 'PROCESSING' || approveStatus === 'TXN_SUBMITTED_ON_CHAIN'
  const isBusySubmit =
    submitStatus === SubmitTxnStatus.PROCESSING ||
    submitStatus === SubmitTxnStatus.TXN_SUBMITTED_ON_CHAIN

  const primary = useMemo(
    () =>
      getMintRedeemPrimaryAction({
        mode: 'mint',
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
        tokenInSymbol: inputs.tokenIn?.symbol,
        tokenOutSymbol: tokenOut?.symbol,
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
      tokenOut?.symbol,
      whitelist.data,
      whitelist.isError,
      whitelist.isLoading,
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
        connection.config?.directMinter,
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
      tokenOut,
      inputs.amountIn,
      inputs.amountOut,
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
    isApproved,
    setStep,
    setTxnUrl,
    step,
    submit,
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

  const feeLabels = formatSubmitFeeLabels(
    submitFee,
    connection.config?.defaultGasToken?.symbol || 'ETH',
  )

  return (
    <StandardTradeFlowView
      step={step}
      payLabel="You're sending"
      receiveLabel="You're minting"
      confirmTitle="Confirm your mint transaction"
      successHeadline="You have successfully minted"
      moreLabel="Mint more"
      tokenIn={inputs.tokenIn}
      tokenOut={tokenOut}
      tokensIn={inputs.tokensIn}
      onTokenInChange={setTokenIn}
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
          ? 'Mint is only available on Ethereum mainnet.'
          : submitStatus === SubmitTxnStatus.TXN_FAILURE
            ? 'Mint failed'
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
