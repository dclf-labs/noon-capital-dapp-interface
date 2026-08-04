import { useCallback, useMemo, useState } from 'react'

import { ChangeReceiverAddressModal } from '@/components/bridge/ChangeReceiverAddressModal'
import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import { useTradeInputModel } from '@/features/_shared'
import { getPresetAmount } from '@/features/_shared/trade-amounts'
import {
  formatBalanceLabel,
  formatFeeUsd,
  formatNativeFeeDetail,
} from '@/features/_shared/trade-display'
import { getTradeMaxAmount } from '@/features/_shared/trade-input-format'
import { canFlipBridgeNetworks, requestBridgeNetworkFlip } from '@/features/bridge/flip'
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
import { type Address, type StarknetAddress, type SuiAddress } from '@/lib/address'
import { type ChainId, getChainConfig } from '@/lib/chain'
import type { EVMConnection } from '@/lib/connection'
import { isStoredReceiverAddressValid } from '@/lib/receiver-address'
import type { TxnStatus as ApproveTxnStatus } from '@/lib/types'
import { BRIDGE_RECEIVER_NOTICE } from '@/mock/bridge/constants'
import {
  getBridgeDestinationNetworks,
  getBridgeSourceNetworks,
} from '@/pages/bridge/bridge-networks'
import { BridgeFlowView } from '@/pages/bridge/BridgeFlowView'
import { sumBridgeFeeUsd, useBridgeFeeUsd } from '@/pages/bridge/useBridgeFeeUsdLabel'

export function EvmBridgeFlow() {
  const {
    inputs,
    connection,
    destinationConnection,
    step,
    setStep,
    setInputs,
    tokenOut,
    isEvmReceiverAddressModalOpen,
    setIsEvmReceiverAddressModalOpen,
    isStarknetReceiverAddressModalOpen,
    setIsStarknetReceiverAddressModalOpen,
    isSuiReceiverAddressModalOpen,
    setIsSuiReceiverAddressModalOpen,
  } = useBridgeForm()
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
    return isStoredReceiverAddressValid(destinationType, String(inputs.receiverAddress || ''))
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

  const receiverValue = String(inputs.receiverAddress || '')

  const onOpenReceiverModal = useCallback(() => {
    if (destinationType === 'starknet') {
      setIsStarknetReceiverAddressModalOpen(true)
      return
    }
    if (destinationType === 'sui') {
      setIsSuiReceiverAddressModalOpen(true)
      return
    }
    setIsEvmReceiverAddressModalOpen(true)
  }, [
    destinationType,
    setIsEvmReceiverAddressModalOpen,
    setIsStarknetReceiverAddressModalOpen,
    setIsSuiReceiverAddressModalOpen,
  ])

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
      setInputs((prev) => ({ ...prev, amount: undefined }))
    },
    [setDestinationChainId, setInputs],
  )

  const onFlipNetworks = useCallback(() => {
    requestBridgeNetworkFlip(inputs.sourceChainId, inputs.destinationChainId, {
      selectActiveChain,
      applySameFamilyFlip: (nextSource, nextDestination) => {
        setInputs((prev) => ({
          ...prev,
          sourceChainId: nextSource as typeof prev.sourceChainId,
          destinationChainId: nextDestination as typeof prev.destinationChainId,
          amount: undefined,
        }))
      },
    })
  }, [inputs.destinationChainId, inputs.sourceChainId, selectActiveChain, setInputs])

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

  const liveGasFeeUsd = useBridgeFeeUsd(feeQuote.data, connection.config?.id, gasSymbol)
  const liveNetworkFeeUsd = submitFee.isReady ? submitFee.data : undefined
  const liveTotalFeeUsd = sumBridgeFeeUsd(liveNetworkFeeUsd, liveGasFeeUsd)

  const feeLabel = useStickyValue(
    liveTotalFeeUsd != null ? formatFeeUsd(liveTotalFeeUsd) : undefined,
    feeRouteKey,
  )
  const networkFeeLabel = useStickyValue(
    liveNetworkFeeUsd != null ? formatFeeUsd(liveNetworkFeeUsd) : undefined,
    feeRouteKey,
  )
  const gasFeeLabel = useStickyValue(
    liveGasFeeUsd != null ? formatFeeUsd(liveGasFeeUsd) : undefined,
    feeRouteKey,
  )
  const networkFeeNativeLabel = useStickyValue(
    submitFee.isReady ? formatNativeFeeDetail(submitFee.native, gasSymbol) : undefined,
    feeRouteKey,
  )
  const gasFeeNativeLabel = useStickyValue(
    feeQuote.data != null && feeQuote.data > 0
      ? formatNativeFeeDetail(feeQuote.data, gasSymbol)
      : undefined,
    feeRouteKey,
  )
  const protocolFeeNativeLabel = formatNativeFeeDetail(0, gasSymbol)

  const sourceName = inputs.sourceChainId ? getChainConfig(inputs.sourceChainId).name : undefined
  const destinationName = inputs.destinationChainId
    ? getChainConfig(inputs.destinationChainId).name
    : undefined

  return (
    <>
      <BridgeFlowView
        step={step}
        chainFamily="evm"
        showHero={false}
        isConnected={connection.isConnected}
        unsupported={connection.unsupported}
        connectedAddress={connection.address}
        sourceNetworks={getBridgeSourceNetworks(inputs.destinationChainId)}
        destinationNetworks={getBridgeDestinationNetworks(inputs.sourceChainId)}
        sourceChainId={inputs.sourceChainId ? Number(inputs.sourceChainId) : undefined}
        destinationChainId={
          inputs.destinationChainId ? Number(inputs.destinationChainId) : undefined
        }
        onSourceChange={onSourceChange}
        onDestinationChange={onDestinationChange}
        onFlipNetworks={
          canFlipBridgeNetworks(
            inputs.sourceChainId as ChainId | undefined,
            inputs.destinationChainId as ChainId | undefined,
          )
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
        onOpenReceiverModal={onOpenReceiverModal}
        feeLabel={feeLabel}
        networkFeeLabel={networkFeeLabel}
        networkFeeNativeLabel={networkFeeNativeLabel}
        gasFeeLabel={gasFeeLabel}
        gasFeeNativeLabel={gasFeeNativeLabel}
        protocolFeeLabel="$0"
        protocolFeeNativeLabel={protocolFeeNativeLabel}
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
        isLoadingFee={!feeLabel && (feeQuote.isLoading || submitFee.isLoading)}
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

      <ChangeReceiverAddressModal
        family="evm"
        isOpen={isEvmReceiverAddressModalOpen}
        currentAddress={inputs.evmReceiverAddress || connection.address}
        onOpenChange={setIsEvmReceiverAddressModalOpen}
        onSubmitAddress={(address) => setEvmReceiverAddress(address as Address)}
      />
      <ChangeReceiverAddressModal
        family="starknet"
        isOpen={isStarknetReceiverAddressModalOpen}
        currentAddress={inputs.starknetReceiverAddress}
        onOpenChange={setIsStarknetReceiverAddressModalOpen}
        onSubmitAddress={(address) => setStarknetReceiverAddress(address as StarknetAddress)}
      />
      <ChangeReceiverAddressModal
        family="sui"
        isOpen={isSuiReceiverAddressModalOpen}
        currentAddress={inputs.suiReceiverAddress}
        onOpenChange={setIsSuiReceiverAddressModalOpen}
        onSubmitAddress={(address) => setSuiReceiverAddress(address as SuiAddress)}
      />
    </>
  )
}
