import { useCallback, useMemo, useState } from 'react'

import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
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
import { useStickyValue } from '@/hooks/ui/useStickyValue'
import {
  type Address,
  isEVMAddressValid,
  isStarknetAddressValid,
  isSuiAddressValid,
  sanitizeEVMAddress,
  sanitizeSuiAddress,
} from '@/lib/address'
import { getChainConfig, isEvmChainId } from '@/lib/chain'
import type { EVMConnection } from '@/lib/connection'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { BRIDGE_RECEIVER_NOTICE } from '@/mock/bridge/constants'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'
import { BridgeFlowView } from '@/pages/bridge/BridgeFlowView'

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

  const hasValidReceiver = useMemo(() => {
    const value = inputs.receiverAddress
    if (!value) return false
    if (destinationType === 'starknet') return isStarknetAddressValid(String(value))
    if (destinationType === 'sui') return isSuiAddressValid(String(value))
    return isEVMAddressValid(value as Address)
  }, [destinationType, inputs.receiverAddress])

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
        hasReceiver: hasValidReceiver,
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
      hasValidReceiver,
      inputs.amount,
      inputs.destinationChainId,
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
        setSuiReceiverAddress(sanitizeSuiAddress(value))
        return
      }
      if (destinationType === 'starknet') {
        const trimmed = value.trim()
        setStarknetReceiverAddress(
          isStarknetAddressValid(trimmed) ? (trimmed as Address) : undefined,
        )
        return
      }
      setEvmReceiverAddress(sanitizeEVMAddress(value) as Address | undefined)
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
    if (!hasValidReceiver) return
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
    hasValidReceiver,
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
      setInputs((prev) => ({ ...prev, amount: undefined }))
    },
    [setDestinationChainId, setInputs],
  )

  const onFlipNetworks = useCallback(() => {
    const source = inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined
    const destination = inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined
    if (source == null || destination == null || !isEvmChainId(destination)) return
    if (!isBridgePairAllowed(destination, source)) return
    setDestinationChainId(source)
    setSourceChainId(destination)
    void selectActiveChain(destination)
    setReceiverDraft('')
    setInputs((prev) => ({ ...prev, amount: undefined }))
  }, [
    inputs.destinationChainId,
    inputs.sourceChainId,
    selectActiveChain,
    setDestinationChainId,
    setInputs,
    setSourceChainId,
  ])

  const onBack = useCallback(() => setStep(0), [setStep])
  const onReset = useCallback(() => {
    setStep(0)
    setInputs((prev) => ({ ...prev, amount: undefined }))
    setApproveStatus('IDLE')
    setSubmitStatus('IDLE')
    setTxnUrl(undefined)
  }, [setInputs, setStep, setTxnUrl])

  const gasSymbol = connection.config?.defaultGasToken?.symbol || 'ETH'
  const feeRouteKey = `${inputs.sourceChainId ?? ''}:${inputs.destinationChainId ?? ''}:${inputs.token?.contractAddress ?? ''}`

  const liveBridgeFee =
    feeQuote.data !== undefined ? formatNativeFee(feeQuote.data, gasSymbol) : undefined
  const liveGasUsd = submitFee.isReady ? formatUsd(submitFee.data) : undefined
  const liveGasNative = submitFee.isReady
    ? formatNativeFeeDetail(submitFee.native, gasSymbol)
    : undefined

  const feeLabel = useStickyValue(liveBridgeFee, feeRouteKey)
  const gasLabel = useStickyValue(liveGasUsd, feeRouteKey)
  const gasNativeLabel = useStickyValue(liveGasNative, feeRouteKey)

  const sourceName = inputs.sourceChainId ? getChainConfig(inputs.sourceChainId).name : undefined
  const destinationName = inputs.destinationChainId
    ? getChainConfig(inputs.destinationChainId).name
    : undefined

  return (
    <BridgeFlowView
      step={step}
      chainFamily="evm"
      showHero={false}
      isConnected={connection.isConnected}
      unsupported={connection.unsupported}
      connectedAddress={connection.address}
      sourceNetworks={getBridgeSourceNetworks('evm')}
      destinationNetworks={getBridgeDestinationNetworks(inputs.sourceChainId, 'evm')}
      sourceChainId={inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined}
      destinationChainId={inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined}
      onSourceChange={onSourceChange}
      onDestinationChange={onDestinationChange}
      onFlipNetworks={
        inputs.destinationChainId && isEvmChainId(Number(inputs.destinationChainId))
          ? onFlipNetworks
          : undefined
      }
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
      feeLabel={feeLabel}
      networkFeeLabel={gasLabel}
      networkFeeNativeLabel={gasNativeLabel}
      bridgeFeeLabel={feeLabel}
      sourceName={sourceName}
      destinationName={destinationName}
      protocolLabel={
        inputs.destinationChainId
          ? isHyperlaneBridgeRoute(connection.config?.useHyperlane, inputs.destinationChainId)
            ? 'Hyperlane'
            : 'LayerZero'
          : undefined
      }
      warning={
        routeDisabled
          ? {
              type: 'warning',
              title: 'Bridge under maintenance',
              description:
                'LayerZero bridge routes are temporarily unavailable. Please try again later.',
            }
          : BRIDGE_RECEIVER_NOTICE
      }
      isFetchingFee={feeQuote.isLoading}
      isLoadingFee={!feeLabel && feeQuote.isLoading}
      isInsufficientBalance={isInsufficientBalance}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      primaryLoading={primary.loading}
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
