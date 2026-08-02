import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTradeInputModel } from '@/features/_shared'
import { getPresetAmount } from '@/features/_shared/trade-amounts'
import { formatBalanceLabel, formatNativeFee } from '@/features/_shared/trade-display'
import { getTradeMaxAmount } from '@/features/_shared/trade-input-format'
import {
  useBridgeBalance,
  useBridgeForm,
  useBridgePrice,
  useBridgeTxn,
} from '@/features/bridge/hooks/starknet/useBridge'
import useBridgeSubmit from '@/features/bridge/hooks/starknet/useBridgeSubmit'
import useUpdateBridge from '@/features/bridge/hooks/starknet/useUpdateBridge'
import { getBridgePrimaryAction } from '@/features/bridge/primary'
import { isBridgePairAllowed } from '@/features/bridge/route'
import { type Address, sanitizeEVMAddress } from '@/lib/address'
import { canWriteSession } from '@/lib/wallet-session'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'
import { BridgePanel } from '@/pages/bridge/BridgePanel'

export function StarknetBridgeFlow() {
  const { inputs, connection, destinationConnection, step, setStep, setInputs, tokenOut } =
    useBridgeForm()
  const { isApproved, isInsufficientBalance, tokenInBalance, tokenOutBalance } = useBridgeBalance()
  const { amountInUsd, feeQuote } = useBridgePrice()
  const { submitFee, txnUrl, setTxnUrl } = useBridgeTxn()
  const { setAmount, setToken, setDestinationChainId, setReceiverAddress } = useUpdateBridge()
  const submit = useBridgeSubmit(
    connection,
    inputs.token,
    tokenOut,
    inputs.amount,
    inputs.receiverAddress,
    feeQuote.data,
    destinationConnection,
  )

  const [receiverDraft, setReceiverDraft] = useState('')

  const inputModel = useTradeInputModel({
    amount: inputs.amount,
    balance: tokenInBalance,
    tokenSymbol: inputs.token?.symbol,
    tokenDecimals: inputs.token?.decimals,
  })

  const pairAllowed = isBridgePairAllowed(inputs.sourceChainId, inputs.destinationChainId)
  const isBusySubmit = submit.mutationStatus.isPending

  useEffect(() => {
    if (submit.mutationStatus.isSuccess) {
      if (submit.txnHash && connection.config?.explorerUrl) {
        setTxnUrl(`${connection.config.explorerUrl}/tx/${submit.txnHash}`)
      }
      setStep(2)
    }
  }, [
    connection.config?.explorerUrl,
    setStep,
    setTxnUrl,
    submit.mutationStatus.isSuccess,
    submit.txnHash,
  ])

  const primary = useMemo(
    () =>
      getBridgePrimaryAction({
        step,
        isConnected: connection.isConnected,
        unsupported: connection.unsupported,
        hasSourceNetwork: !!inputs.sourceChainId,
        hasDestinationNetwork: !!inputs.destinationChainId,
        pairAllowed,
        hasReceiver: !!inputs.receiverAddress,
        hasToken: !!inputs.token,
        amount: inputs.amount,
        isBalanceLoading: tokenInBalance.isLoading,
        isAllowanceLoading: false,
        isFeeLoading: feeQuote.isLoading,
        isFeeError: feeQuote.isError,
        isInsufficientBalance,
        routeDisabled: false,
        requiresApproval: false,
        isApproved: true,
        isBusyApprove: false,
        isBusySubmit,
        submitFailed: submit.mutationStatus.isError,
      }),
    [
      connection.isConnected,
      connection.unsupported,
      feeQuote.isError,
      feeQuote.isLoading,
      inputs.amount,
      inputs.destinationChainId,
      inputs.receiverAddress,
      inputs.sourceChainId,
      inputs.token,
      isBusySubmit,
      isInsufficientBalance,
      pairAllowed,
      step,
      submit.mutationStatus.isError,
      tokenInBalance.isLoading,
    ],
  )

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      if (amount === undefined) {
        setInputs((prev) => ({ ...prev, amount: undefined }))
        return
      }
      setAmount(amount)
    },
    [setAmount, setInputs],
  )

  const onPrimary = useCallback(() => {
    if (step === 0) {
      setStep(1)
      return
    }
    if (!canWriteSession(connection)) return
    submit.onSubmit()
  }, [connection, setStep, step, submit])

  return (
    <BridgePanel
      step={step}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      sourceNetworks={getBridgeSourceNetworks('starknet')}
      destinationNetworks={getBridgeDestinationNetworks(inputs.sourceChainId, 'starknet')}
      sourceChainId={inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined}
      destinationChainId={inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined}
      onSourceChange={() => undefined}
      onDestinationChange={(chainId) => setDestinationChainId(chainId)}
      tokens={inputs.tokens}
      token={inputs.token}
      onTokenChange={setToken}
      amount={inputs.amount}
      amountUsd={amountInUsd}
      balanceInLabel={inputModel.balanceLabel}
      balanceOutLabel={formatBalanceLabel(
        tokenOutBalance.data,
        tokenOut?.symbol,
        tokenOut?.decimals,
      )}
      receiverLabel="EVM receiver"
      receiverValue={receiverDraft || String(inputs.receiverAddress || '')}
      receiverPlaceholder="0x…"
      onReceiverChange={(value) => {
        setReceiverDraft(value)
        setReceiverAddress(sanitizeEVMAddress(value) as Address | undefined)
      }}
      feeLabel={
        feeQuote.data !== undefined
          ? formatNativeFee(feeQuote.data, connection.config?.defaultGasToken?.symbol || 'ETH')
          : undefined
      }
      gasLabel={
        submitFee.data !== undefined
          ? formatNativeFee(submitFee.data, connection.config?.defaultGasToken?.symbol || 'ETH')
          : undefined
      }
      protocolLabel="Hyperlane"
      warning="Make sure you control the receiver wallet on the destination network."
      isFetchingFee={feeQuote.isLoading}
      isInsufficientBalance={isInsufficientBalance}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled || !isApproved}
      primaryLoading={primary.loading}
      statusMessage={submit.mutationStatus.isError ? 'Bridge failed' : undefined}
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      onAmountChange={onAmountChange}
      onHalf={() => {
        const next = getPresetAmount(tokenInBalance.data, 'half')
        if (next > 0) setAmount(next)
      }}
      onMax={() => {
        const next = getTradeMaxAmount(tokenInBalance.data, inputs.token?.isNative)
        if (next > 0) setAmount(next)
      }}
      onPrimary={onPrimary}
      onBack={() => setStep(0)}
      onReset={() => {
        setStep(0)
        setInputs((prev) => ({ ...prev, amount: undefined }))
        setTxnUrl(undefined)
      }}
    />
  )
}
