import { useCallback, useMemo, useState } from 'react'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import { useTradeInputModel } from '@/features/_shared'
import { getPresetAmount } from '@/features/_shared/trade-amounts'
import { formatBalanceLabel, formatNativeFee } from '@/features/_shared/trade-display'
import { getTradeMaxAmount } from '@/features/_shared/trade-input-format'
import {
  useBridgeBalance,
  useBridgeForm,
  useBridgePrice,
  useBridgeTxn,
} from '@/features/bridge/hooks/evm/useBridge'
import useBridgeSubmit from '@/features/bridge/hooks/evm/useBridgeSubmit'
import useIsHyperlaneRoute from '@/features/bridge/hooks/evm/useIsHyperlaneRoute'
import useUpdateBridge from '@/features/bridge/hooks/evm/useUpdateBridge'
import { getBridgePrimaryAction } from '@/features/bridge/primary'
import {
  doesLayerzeroNeedApproval,
  getLayerzeroApproveSpender,
  isBridgePairAllowed,
  isHyperlaneBridgeRoute,
  isLayerzeroBridgeRouteDisabled,
} from '@/features/bridge/route'
import { useSelectActiveChain } from '@/hooks/connection'
import useApprove from '@/hooks/on-chain/evm/useApprove'
import { type Address, sanitizeEVMAddress, sanitizeSuiAddress } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { BridgePanel } from '@/mock/bridge/BridgePanel'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'

export function EvmBridgeFlow() {
  const { inputs, connection, destinationConnection, step, setStep, setInputs, tokenOut } =
    useBridgeForm()
  const { isApproved, isInsufficientBalance, tokenInAllowance, tokenInBalance, tokenOutBalance } =
    useBridgeBalance()
  const { amountInUsd, feeQuote } = useBridgePrice()
  const { submitFee, txnUrl, setTxnUrl } = useBridgeTxn()
  const {
    setAmount,
    setToken,
    setSourceChainId,
    setDestinationChainId,
    setEvmReceiverAddress,
    setStarknetReceiverAddress,
    setSuiReceiverAddress,
  } = useUpdateBridge()
  const { selectActiveChain } = useSelectActiveChain()
  const approve = useApprove()
  const submit = useBridgeSubmit(connection, destinationConnection as EVMConnection)
  const isHyperlaneRoute = useIsHyperlaneRoute(connection, destinationConnection as EVMConnection)

  const [approveStatus, setApproveStatus] = useState<ApproveTxnStatus>('IDLE')
  const [submitStatus, setSubmitStatus] = useState<ApproveTxnStatus>('IDLE')
  const [receiverDraft, setReceiverDraft] = useState('')

  const inputModel = useTradeInputModel({
    amount: inputs.amount,
    balance: tokenInBalance,
    tokenSymbol: inputs.token?.symbol,
    tokenDecimals: inputs.token?.decimals,
  })

  const destinationType = useMemo(() => {
    if (Number(inputs.destinationChainId) === Number(STARKNET_BRIDGE_DESTINATION.id)) {
      return 'starknet'
    }
    if (Number(inputs.destinationChainId) === Number(SUI_BRIDGE_DESTINATION.id)) {
      return 'sui'
    }
    return 'evm'
  }, [inputs.destinationChainId])

  const requiresApproval =
    !isHyperlaneRoute &&
    doesLayerzeroNeedApproval(inputs.token, connection.config?.layerzeroOftHelper)

  const routeDisabled = isLayerzeroBridgeRouteDisabled(isHyperlaneRoute)
  const pairAllowed = isBridgePairAllowed(inputs.sourceChainId, inputs.destinationChainId)

  const isBusyApprove = approveStatus === 'PROCESSING' || approveStatus === 'TXN_SUBMITTED_ON_CHAIN'
  const isBusySubmit = submitStatus === 'PROCESSING' || submitStatus === 'TXN_SUBMITTED_ON_CHAIN'

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
        isAllowanceLoading: tokenInAllowance.isLoading,
        isFeeLoading: feeQuote.isLoading,
        isFeeError: feeQuote.isError,
        isInsufficientBalance,
        routeDisabled,
        routeDisabledLabel: 'LayerZero bridge unavailable',
        requiresApproval,
        isApproved,
        tokenSymbol: inputs.token?.symbol,
        approveStatus,
        isBusyApprove,
        isBusySubmit,
        submitFailed: submitStatus === 'TXN_FAILURE',
      }),
    [
      approveStatus,
      connection.isConnected,
      connection.unsupported,
      feeQuote.isError,
      feeQuote.isLoading,
      inputs.amount,
      inputs.destinationChainId,
      inputs.receiverAddress,
      inputs.sourceChainId,
      inputs.token,
      isApproved,
      isBusyApprove,
      isBusySubmit,
      isInsufficientBalance,
      pairAllowed,
      requiresApproval,
      routeDisabled,
      step,
      submitStatus,
      tokenInAllowance.isLoading,
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

  const onHalf = useCallback(() => {
    const next = getPresetAmount(tokenInBalance.data, 'half')
    if (next > 0) setAmount(next)
  }, [setAmount, tokenInBalance.data])

  const onMax = useCallback(() => {
    const next = getTradeMaxAmount(tokenInBalance.data, inputs.token?.isNative)
    if (next > 0) setAmount(next)
  }, [inputs.token?.isNative, setAmount, tokenInBalance.data])

  const onReceiverChange = useCallback(
    (value: string) => {
      setReceiverDraft(value)
      if (destinationType === 'sui') {
        const sanitized = sanitizeSuiAddress(value)
        setSuiReceiverAddress(sanitized)
        return
      }
      if (destinationType === 'starknet') {
        const trimmed = value.trim()
        setStarknetReceiverAddress(trimmed ? (trimmed as Address) : undefined)
        return
      }
      const sanitized = sanitizeEVMAddress(value) as Address | undefined
      setEvmReceiverAddress(sanitized)
    },
    [destinationType, setEvmReceiverAddress, setStarknetReceiverAddress, setSuiReceiverAddress],
  )

  const receiverValue = useMemo(() => {
    if (receiverDraft) return receiverDraft
    return String(inputs.receiverAddress || '')
  }, [inputs.receiverAddress, receiverDraft])

  const onPrimary = useCallback(() => {
    if (step === 0 && requiresApproval && !isApproved) {
      const spender = getLayerzeroApproveSpender(
        inputs.token,
        connection.config?.layerzeroOftHelper,
      )
      void approve(
        connection,
        spender,
        inputs.token,
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
      inputs.token,
      tokenOut,
      inputs.amount,
      inputs.receiverAddress as Address | undefined,
      feeQuote.data,
      destinationConnection as EVMConnection,
      undefined,
      () => setStep(2),
      setSubmitStatus,
      setTxnUrl,
    )
  }, [
    approve,
    connection,
    destinationConnection,
    feeQuote.data,
    inputs.amount,
    inputs.receiverAddress,
    inputs.token,
    isApproved,
    requiresApproval,
    setStep,
    setTxnUrl,
    step,
    submit,
    tokenInAllowance.refetch,
    tokenOut,
  ])

  const onSourceChange = useCallback(
    (chainId: number) => {
      setSourceChainId(chainId)
      void selectActiveChain(chainId)
    },
    [selectActiveChain, setSourceChainId],
  )

  const onDestinationChange = useCallback(
    (chainId: number | undefined) => {
      setDestinationChainId(chainId)
      setReceiverDraft('')
    },
    [setDestinationChainId],
  )

  const onBack = useCallback(() => setStep(0), [setStep])
  const onReset = useCallback(() => {
    setStep(0)
    setInputs((prev) => ({ ...prev, amount: undefined }))
    setApproveStatus('IDLE')
    setSubmitStatus('IDLE')
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl])

  const gasSymbol = connection.config?.defaultGasToken?.symbol || 'ETH'

  return (
    <BridgePanel
      step={step}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      sourceNetworks={getBridgeSourceNetworks('evm')}
      destinationNetworks={getBridgeDestinationNetworks(inputs.sourceChainId, 'evm')}
      sourceChainId={inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined}
      destinationChainId={inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined}
      onSourceChange={onSourceChange}
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
      receiverLabel={
        destinationType === 'starknet'
          ? 'Starknet receiver'
          : destinationType === 'sui'
            ? 'Sui receiver'
            : 'EVM receiver'
      }
      receiverValue={receiverValue}
      receiverPlaceholder={
        destinationType === 'starknet'
          ? '0x…'
          : destinationType === 'sui'
            ? '0x… sui address'
            : '0x…'
      }
      onReceiverChange={onReceiverChange}
      feeLabel={feeQuote.data !== undefined ? formatNativeFee(feeQuote.data, gasSymbol) : undefined}
      gasLabel={
        submitFee.data !== undefined ? formatNativeFee(submitFee.data, gasSymbol) : undefined
      }
      protocolLabel={
        inputs.destinationChainId
          ? isHyperlaneBridgeRoute(connection.config?.useHyperlane, inputs.destinationChainId)
            ? 'Hyperlane'
            : 'LayerZero'
          : undefined
      }
      warning={
        routeDisabled
          ? 'LayerZero routes are temporarily disabled.'
          : 'Make sure you control the receiver wallet on the destination network.'
      }
      isFetchingFee={feeQuote.isLoading}
      isInsufficientBalance={isInsufficientBalance}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
      statusMessage={
        approveStatus === 'TXN_FAILURE'
          ? 'Approval failed'
          : submitStatus === 'TXN_FAILURE'
            ? 'Bridge failed'
            : undefined
      }
      txnUrl={txnUrl}
      presetsDisabled={inputModel.isPresetDisabled || tokenInBalance.isLoading}
      onAmountChange={onAmountChange}
      onHalf={onHalf}
      onMax={onMax}
      onPrimary={onPrimary}
      onBack={onBack}
      onReset={onReset}
    />
  )
}
