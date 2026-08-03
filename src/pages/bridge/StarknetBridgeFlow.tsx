import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useTradeInputModel } from '@/features/_shared'
import { getPresetAmount } from '@/features/_shared/trade-amounts'
import {
  formatBalanceLabel,
  formatNativeFee,
  formatNativeFeeDetail,
  formatUsd,
} from '@/features/_shared/trade-display'
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
import { useSelectActiveChain } from '@/hooks/connection'
import { useStickyValue } from '@/hooks/ui/useStickyValue'
import { type Address, isEVMAddressValid, sanitizeEVMAddress } from '@/lib/address'
import { getChainConfig } from '@/lib/chain'
import { canWriteSession } from '@/lib/wallet-session'
import { BRIDGE_RECEIVER_NOTICE } from '@/mock/bridge/constants'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'
import { BridgeFlowView } from '@/pages/bridge/BridgeFlowView'

export function StarknetBridgeFlow() {
  const { inputs, connection, destinationConnection, step, setStep, setInputs, tokenOut } =
    useBridgeForm()
  const { isApproved, isInsufficientBalance, tokenInBalance, tokenOutBalance } = useBridgeBalance()
  const { amountInUsd, feeQuote } = useBridgePrice()
  const { submitFee, txnUrl, setTxnUrl } = useBridgeTxn()
  const { setAmount, setToken, setDestinationChainId, setReceiverAddress } = useUpdateBridge()
  const { selectActiveChain } = useSelectActiveChain()
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
  // Prevent success effect from re-opening step 2 after "Bridge more" with the same tx.
  const dismissedHashRef = useRef<string | undefined>(undefined)

  const inputModel = useTradeInputModel({
    amount: inputs.amount,
    balance: tokenInBalance,
    tokenSymbol: inputs.token?.symbol,
    tokenDecimals: inputs.token?.decimals,
  })

  const pairAllowed = isBridgePairAllowed(inputs.sourceChainId, inputs.destinationChainId)
  const isBusySubmit = submit.mutationStatus.isPending
  const hasValidReceiver = isEVMAddressValid(inputs.receiverAddress as Address | undefined)

  useEffect(() => {
    if (!submit.mutationStatus.isSuccess || !submit.txnHash) return
    if (dismissedHashRef.current === submit.txnHash) return
    if (connection.config?.explorerUrl) {
      setTxnUrl(`${connection.config.explorerUrl}/tx/${submit.txnHash}`)
    }
    setStep(2)
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
        hasReceiver: hasValidReceiver,
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
      hasValidReceiver,
      inputs.amount,
      inputs.destinationChainId,
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
    if (!canWriteSession(connection) || !hasValidReceiver) return
    submit.onSubmit()
  }, [connection, hasValidReceiver, setStep, step, submit])

  const onDestinationChange = useCallback(
    (chainId: number | undefined) => {
      setDestinationChainId(chainId)
      setReceiverDraft('')
      setInputs((prev) => ({ ...prev, amount: undefined }))
    },
    [setDestinationChainId, setInputs],
  )

  const onReset = useCallback(() => {
    if (submit.txnHash) dismissedHashRef.current = submit.txnHash
    setStep(0)
    setInputs((prev) => ({ ...prev, amount: undefined }))
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl, submit.txnHash])

  const gasSymbol = connection.config?.defaultGasToken?.symbol || 'STRK'
  const feeRouteKey = `${inputs.sourceChainId ?? ''}:${inputs.destinationChainId ?? ''}:${inputs.token?.contractAddress ?? ''}`

  const feeLabel = useStickyValue(
    feeQuote.data !== undefined ? formatNativeFee(feeQuote.data, gasSymbol) : undefined,
    feeRouteKey,
  )
  const gasLabel = useStickyValue(
    submitFee.isReady ? formatUsd(submitFee.data) : undefined,
    feeRouteKey,
  )
  const gasNativeLabel = useStickyValue(
    submitFee.isReady ? formatNativeFeeDetail(submitFee.native, gasSymbol) : undefined,
    feeRouteKey,
  )

  return (
    <BridgeFlowView
      step={step}
      chainFamily="starknet"
      showHero={false}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      connectedAddress={connection.address}
      sourceNetworks={getBridgeSourceNetworks('starknet')}
      destinationNetworks={getBridgeDestinationNetworks(inputs.sourceChainId, 'starknet')}
      sourceChainId={inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined}
      destinationChainId={inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined}
      onSourceChange={(chainId) => {
        void selectActiveChain(chainId)
      }}
      onDestinationChange={onDestinationChange}
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
      feeLabel={feeLabel}
      networkFeeLabel={gasLabel}
      networkFeeNativeLabel={gasNativeLabel}
      bridgeFeeLabel={feeLabel}
      sourceName={inputs.sourceChainId ? getChainConfig(inputs.sourceChainId).name : undefined}
      destinationName={
        inputs.destinationChainId ? getChainConfig(inputs.destinationChainId).name : undefined
      }
      protocolLabel="Hyperlane"
      warning={BRIDGE_RECEIVER_NOTICE}
      isFetchingFee={feeQuote.isLoading}
      isLoadingFee={!feeLabel && feeQuote.isLoading}
      isInsufficientBalance={isInsufficientBalance}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled || !isApproved}
      primaryLoading={primary.loading}
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
      onReset={onReset}
    />
  )
}
