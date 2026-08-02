import React, { useEffect, useMemo, useRef, useState } from 'react'

import { getToken, getTokens } from '@/config'
import type { ChainId, ProtocolChainId } from '@/config/chain-id'
import starknetConfig from '@/config/chains/starknet'
import suiConfig from '@/config/chains/sui'
import { STARKNET_BRIDGE_DESTINATION, SUI_BRIDGE_DESTINATION } from '@/constants/common'
import { getAmountUsd } from '@/features/_shared/trade-amounts'
import {
  getInsufficientBalance,
  getIsApproved,
  useTradeFormController,
} from '@/features/_shared/use-trade-form-controller'
import useTokenPrice from '@/features/api/hooks/useTokenPrice'
import {
  BridgeBalanceContext,
  BridgeFormContext,
  BridgePriceContext,
  BridgeTxnContext,
} from '@/features/bridge/context/evm/context'
import { type FormInputs } from '@/features/bridge/context/evm/types'
import useBridgeAllowance from '@/features/bridge/hooks/evm/useBridgeAllowance'
import useBridgeFeeQuote from '@/features/bridge/hooks/evm/useBridgeFeeQuote'
import useBridgeSubmitFee from '@/features/bridge/hooks/evm/useBridgeSubmitFee'
import { useResolvedChain } from '@/hooks/connection'
import { useReadOnlySession } from '@/hooks/connection/useReadOnlySession'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useEvmDestinationTokenBalance from '@/hooks/on-chain/evm/useDestinationTokenBalance'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import useStarknetDestinationTokenBalance from '@/hooks/on-chain/starknet/useDestinationTokenBalance'
import useSuiDestinationTokenBalance from '@/hooks/on-chain/sui/useDestinationTokenBalance'
import type { SuiAddress } from '@/lib/address'
import { getActiveEvmChainIds } from '@/lib/chain'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'

type DestinationNetworkType = 'starknet' | 'sui' | 'evm'

const INITIAL_BRIDGE_INPUTS: FormInputs = {
  token: undefined,
  amount: undefined,
  tokens: undefined,
  receiverAddress: undefined,
  evmReceiverAddress: undefined,
  starknetReceiverAddress: undefined,
  suiReceiverAddress: undefined,
  destinationChainId: undefined,
  sourceChainId: undefined,
}

const getDestinationNetworkType = (
  destinationChainId: ChainId | undefined,
): DestinationNetworkType => {
  if (destinationChainId == null) return 'evm'
  if (Number(destinationChainId) === Number(STARKNET_BRIDGE_DESTINATION?.id)) return 'starknet'
  if (Number(destinationChainId) === Number(SUI_BRIDGE_DESTINATION?.id)) return 'sui'
  return 'evm'
}

export const BridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, txnUrl, setTxnUrl } =
    useTradeFormController(INITIAL_BRIDGE_INPUTS)
  const [isStarknetReceiverAddressModalOpen, setIsStarknetReceiverAddressModalOpen] =
    useState(false)
  const [isSuiReceiverAddressModalOpen, setIsSuiReceiverAddressModalOpen] = useState(false)
  const [isEvmReceiverAddressModalOpen, setIsEvmReceiverAddressModalOpen] = useState(false)
  const [hasAutoOpenedStarknetModal, setHasAutoOpenedStarknetModal] = useState(false)
  const [hasAutoOpenedSuiModal, setHasAutoOpenedSuiModal] = useState(false)
  const [hasAutoOpenedEvmModal, setHasAutoOpenedEvmModal] = useState(false)
  const [lastDestinationChainId, setLastDestinationChainId] = useState<number | undefined>(
    undefined,
  )
  const [lastDestinationNetworkType, setLastDestinationNetworkType] = useState<
    DestinationNetworkType | undefined
  >(undefined)
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | undefined>(undefined)
  const prevSourceChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevDestinationChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevChainFamilyRef = useRef<'evm' | 'starknet' | 'sui' | undefined>(undefined)

  const { chainId: resolvedChainId, chainFamily: resolvedChainFamily } = useResolvedChain()
  const sourceChainId = inputs.sourceChainId
    ? (toNum(inputs.sourceChainId) as ProtocolChainId)
    : undefined
  const destinationChainId = inputs.destinationChainId
    ? (toNum(inputs.destinationChainId) as ProtocolChainId)
    : undefined

  const connection = useEvmTargetSession(sourceChainId, { fallbackToDefault: false })
  const evmDestinationConnection = useReadOnlySession(destinationChainId, inputs.receiverAddress)
  const starknetDestinationConnection = useReadOnlySession(
    starknetConfig.id,
    inputs.receiverAddress,
  )
  const suiDestinationConnection = useReadOnlySession(
    suiConfig.id,
    inputs.receiverAddress as SuiAddress | undefined,
  )

  const destinationConnection = useMemo(() => {
    if (inputs.destinationChainId === STARKNET_BRIDGE_DESTINATION?.id) {
      return starknetDestinationConnection
    }
    if (inputs.destinationChainId === SUI_BRIDGE_DESTINATION?.id) {
      return suiDestinationConnection
    }
    return evmDestinationConnection
  }, [
    inputs.destinationChainId,
    evmDestinationConnection,
    starknetDestinationConnection,
    suiDestinationConnection,
  ])

  const tokenOut = useMemo(() => {
    return getToken(destinationConnection.config, inputs?.token?.symbol)
  }, [destinationConnection.config, inputs?.token?.symbol])

  const tokenPrice = useTokenPrice(inputs.token)
  const tokenInBalance = useTokenBalance(connection, inputs.token)
  const tokenInAllowance = useBridgeAllowance(
    connection,
    inputs.token,
    destinationConnection as EVMConnection,
  )
  const evmTokenOutBalance = useEvmDestinationTokenBalance(evmDestinationConnection, tokenOut)
  const starknetTokenOutBalance = useStarknetDestinationTokenBalance(
    starknetDestinationConnection,
    tokenOut,
    inputs.receiverAddress,
  )
  const suiTokenOutBalance = useSuiDestinationTokenBalance(
    suiDestinationConnection,
    tokenOut,
    inputs.receiverAddress as SuiAddress | undefined,
  )
  const tokenOutBalance = useMemo(() => {
    if (destinationConnection.config?.id === STARKNET_BRIDGE_DESTINATION?.id) {
      return starknetTokenOutBalance
    }
    if (destinationConnection.config?.id === SUI_BRIDGE_DESTINATION?.id) {
      return suiTokenOutBalance
    }
    return evmTokenOutBalance
  }, [
    destinationConnection.config?.id,
    starknetTokenOutBalance,
    suiTokenOutBalance,
    evmTokenOutBalance,
  ])

  const feeQuote = useBridgeFeeQuote(
    connection,
    inputs.token,
    tokenOut,
    inputs.amount,
    inputs.receiverAddress,
    destinationConnection as EVMConnection,
  )

  const submitFee = useBridgeSubmitFee(
    connection,
    inputs.token,
    tokenOut,
    inputs.amount,
    inputs.receiverAddress,
    feeQuote.data,
    destinationConnection as EVMConnection,
  )

  const isInsufficientBalance = useMemo(
    () => getInsufficientBalance(tokenInBalance.data, inputs.amount),
    [tokenInBalance.data, inputs.amount],
  )

  const isApproved = useMemo(
    () => getIsApproved(tokenInAllowance.data, inputs.amount),
    [inputs.amount, tokenInAllowance.data],
  )

  const amountInUsd = useMemo(
    () => getAmountUsd(inputs.amount, tokenPrice),
    [inputs.amount, tokenPrice],
  )

  // Effect to handle wallet connection changes and reset EVM receiver address
  useEffect(() => {
    if (!connection.isConnected) {
      setInputs((prev) => ({
        ...prev,
        evmReceiverAddress: undefined,
        receiverAddress: undefined,
      }))
      setLastConnectedAddress(undefined)
      return
    }

    // Detect if wallet address has changed (not just initial connection)
    const hasWalletChanged =
      lastConnectedAddress && lastConnectedAddress !== connection.address && connection.isConnected

    // Only reset EVM receiver address when wallet actually changes OR when no EVM address is set
    if (hasWalletChanged || !inputs.evmReceiverAddress) {
      setInputs((prev) => ({
        ...prev,
        evmReceiverAddress: connection.address,
      }))
    }

    // If wallet address changed and destination is EVM, open modal to confirm address
    if (hasWalletChanged) {
      const networkType = getDestinationNetworkType(inputs.destinationChainId)

      if (networkType === 'evm' && !isEvmReceiverAddressModalOpen) {
        setIsEvmReceiverAddressModalOpen(true)
      }
    }

    // Update last connected address
    setLastConnectedAddress(connection.address)
  }, [
    connection.address,
    connection.isConnected,
    inputs.destinationChainId,
    isEvmReceiverAddressModalOpen,
    inputs.evmReceiverAddress,
    lastConnectedAddress,
    setInputs,
  ])

  // Effect to handle destination network changes and modal management
  useEffect(() => {
    // Use inputs.destinationChainId directly instead of destinationConnection.config?.id
    // to avoid fallback config issues when destinationChainId is undefined
    const currentDestinationChainId = destinationChainId
    const currentNetworkType = getDestinationNetworkType(currentDestinationChainId)

    // Detect network type change (EVM ↔ Starknet ↔ Sui)
    const hasNetworkTypeChanged =
      lastDestinationNetworkType &&
      lastDestinationNetworkType !== currentNetworkType &&
      connection.isConnected

    // Reset auto-open flags when destination chain changes
    if (lastDestinationChainId !== currentDestinationChainId) {
      setHasAutoOpenedStarknetModal(false)
      setHasAutoOpenedSuiModal(false)
      setHasAutoOpenedEvmModal(false)
      setLastDestinationChainId(currentDestinationChainId)
    }

    // Update last network type
    if (lastDestinationNetworkType !== currentNetworkType) {
      setLastDestinationNetworkType(currentNetworkType)
    }

    if (!connection.isConnected) {
      return
    }

    if (currentNetworkType === 'starknet') {
      if (isEvmReceiverAddressModalOpen) setIsEvmReceiverAddressModalOpen(false)
      if (isSuiReceiverAddressModalOpen) setIsSuiReceiverAddressModalOpen(false)

      setInputs((prev) => ({
        ...prev,
        receiverAddress: prev.starknetReceiverAddress,
      }))

      if (
        (!inputs?.starknetReceiverAddress && !hasAutoOpenedStarknetModal) ||
        (hasNetworkTypeChanged && lastDestinationNetworkType !== 'starknet')
      ) {
        if (!isStarknetReceiverAddressModalOpen) {
          setIsStarknetReceiverAddressModalOpen(true)
          setHasAutoOpenedStarknetModal(true)
        }
      }
    } else if (currentNetworkType === 'sui') {
      if (isEvmReceiverAddressModalOpen) setIsEvmReceiverAddressModalOpen(false)
      if (isStarknetReceiverAddressModalOpen) setIsStarknetReceiverAddressModalOpen(false)

      setInputs((prev) => ({
        ...prev,
        receiverAddress: prev.suiReceiverAddress,
      }))

      if (
        (!inputs?.suiReceiverAddress && !hasAutoOpenedSuiModal) ||
        (hasNetworkTypeChanged && lastDestinationNetworkType !== 'sui')
      ) {
        if (!isSuiReceiverAddressModalOpen) {
          setIsSuiReceiverAddressModalOpen(true)
          setHasAutoOpenedSuiModal(true)
        }
      }
    } else {
      if (isStarknetReceiverAddressModalOpen) setIsStarknetReceiverAddressModalOpen(false)
      if (isSuiReceiverAddressModalOpen) setIsSuiReceiverAddressModalOpen(false)

      setInputs((prev) => ({
        ...prev,
        receiverAddress: prev.evmReceiverAddress,
      }))

      if (hasNetworkTypeChanged && lastDestinationNetworkType !== 'evm') {
        if (!isEvmReceiverAddressModalOpen) {
          setIsEvmReceiverAddressModalOpen(true)
          setHasAutoOpenedEvmModal(true)
        }
      }
    }
  }, [
    connection.isConnected,
    inputs.destinationChainId,
    inputs.evmReceiverAddress,
    inputs?.starknetReceiverAddress,
    inputs?.suiReceiverAddress,
    isStarknetReceiverAddressModalOpen,
    isSuiReceiverAddressModalOpen,
    isEvmReceiverAddressModalOpen,
    hasAutoOpenedStarknetModal,
    hasAutoOpenedSuiModal,
    hasAutoOpenedEvmModal,
    lastDestinationChainId,
    lastDestinationNetworkType,
    destinationChainId,
    setInputs,
  ])

  const formValue = useMemo(
    () => ({
      inputs,
      setInputs,
      step,
      setStep,
      connection,
      destinationConnection,
      tokenOut,
      isStarknetReceiverAddressModalOpen,
      setIsStarknetReceiverAddressModalOpen,
      isSuiReceiverAddressModalOpen,
      setIsSuiReceiverAddressModalOpen,
      isEvmReceiverAddressModalOpen,
      setIsEvmReceiverAddressModalOpen,
    }),
    [
      inputs,
      setInputs,
      step,
      setStep,
      connection,
      destinationConnection,
      tokenOut,
      isStarknetReceiverAddressModalOpen,
      setIsStarknetReceiverAddressModalOpen,
      isSuiReceiverAddressModalOpen,
      setIsSuiReceiverAddressModalOpen,
      isEvmReceiverAddressModalOpen,
      setIsEvmReceiverAddressModalOpen,
    ],
  )

  const balanceValue = useMemo(
    () => ({
      tokenInBalance,
      tokenInAllowance,
      isInsufficientBalance,
      isApproved,
      tokenOutBalance,
    }),
    [tokenInBalance, tokenInAllowance, isInsufficientBalance, isApproved, tokenOutBalance],
  )

  const priceValue = useMemo(
    () => ({
      feeQuote,
      tokenPrice,
      amountInUsd,
    }),
    [amountInUsd, tokenPrice, feeQuote],
  )

  const txnValue = useMemo(
    () => ({
      txnUrl,
      setTxnUrl,
      submitFee,
    }),
    [txnUrl, setTxnUrl, submitFee],
  )

  useEffect(() => {
    const sourceBridgeTokens = connection.config?.bridgeTokens || []
    const destinationBridgeTokens = destinationConnection.config?.bridgeTokens || []
    const normalizedDestinationBridgeTokens = new Set(
      destinationBridgeTokens.map((tokenSymbol) => tokenSymbol.toUpperCase()),
    )
    const bridgeTokens =
      destinationChainId === undefined
        ? sourceBridgeTokens
        : sourceBridgeTokens.filter((tokenSymbol) =>
            normalizedDestinationBridgeTokens.has(tokenSymbol.toUpperCase()),
          )
    const tokens = getTokens(connection.config, bridgeTokens)
    const token = tokens?.at(0)

    setInputs((prev) => ({
      ...prev,
      token,
      tokens,
    }))
    setStep(0)
  }, [connection.config, destinationConnection.config, destinationChainId, setInputs, setStep])

  // Initialize source chain from connected chain, destination as undefined
  useEffect(() => {
    if (connection.isConnected && connection.connectedChainId) {
      const connectedChainId = connection.connectedChainId as ProtocolChainId
      const chains = getActiveEvmChainIds()

      // Only initialize if source is not set
      if (!inputs.sourceChainId && chains?.includes(toNum(connectedChainId))) {
        setInputs((prev) => ({
          ...prev,
          sourceChainId: connectedChainId,
          destinationChainId: undefined, // Start with undefined destination
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Detect chain family changes and reset destination
  useEffect(() => {
    const hasChainFamilyChanged =
      prevChainFamilyRef.current !== undefined && prevChainFamilyRef.current !== resolvedChainFamily

    if (hasChainFamilyChanged) {
      setInputs((prev) => ({
        ...prev,
        destinationChainId: undefined,
      }))
    }

    prevChainFamilyRef.current = resolvedChainFamily
  }, [resolvedChainFamily, setInputs])

  // Effect to handle source chain changes (from connection or user selection)
  // Source chain should always be undefined or connected EVM chain
  useEffect(() => {
    const chains = getActiveEvmChainIds()
    const resolvedEvmChainId =
      resolvedChainFamily === 'evm' ? (resolvedChainId as ProtocolChainId) : undefined
    const effectiveSourceChainId = (connection.connectedChainId ||
      connection.config?.id ||
      resolvedEvmChainId ||
      chains?.at(0)) as ProtocolChainId | undefined
    const isValidChainId =
      !!effectiveSourceChainId && chains?.includes(toNum(effectiveSourceChainId))

    if (!isValidChainId) {
      return
    }

    // Source chain should always be the connected EVM chain (or undefined)
    // If inputs.sourceChainId is set to something else, we need to correct it
    const currentSourceChainId = sourceChainId
    const shouldUpdateSource = currentSourceChainId !== effectiveSourceChainId
    const prevSourceChainId = prevSourceChainIdRef.current
    const hasSourceChanged = prevSourceChainId !== effectiveSourceChainId

    if (shouldUpdateSource || hasSourceChanged) {
      setInputs((prev) => {
        // When source chain changes:
        // - Keep destination chain the same UNLESS they are the same
        // - If they are the same, set destination chain to undefined
        // - BUT: Don't clear destination if source was just restored from undefined
        //   This prevents clearing destination when user selects a destination that matches source
        const wasSourceUndefined = currentSourceChainId === undefined
        const shouldClearDestination =
          effectiveSourceChainId === prev.destinationChainId && !wasSourceUndefined

        const newDestinationChainId = shouldClearDestination ? undefined : prev.destinationChainId

        return {
          ...prev,
          sourceChainId: effectiveSourceChainId,
          destinationChainId: newDestinationChainId,
        }
      })
      prevSourceChainIdRef.current = effectiveSourceChainId
    }
  }, [
    connection.connectedChainId,
    connection.config?.id,
    resolvedChainId,
    resolvedChainFamily,
    sourceChainId,
    setInputs,
  ])

  // Effect to handle destination chain changes (from user selection)
  // When destination chain changes, keep source chain the same UNLESS they are the same
  useEffect(() => {
    const prevDestinationChainId = prevDestinationChainIdRef.current
    const hasDestinationChanged = prevDestinationChainId !== destinationChainId

    if (hasDestinationChanged && destinationChainId !== undefined) {
      const newDestinationChainId = destinationChainId
      setInputs((prev) => {
        // When destination chain changes:
        // - Keep source chain the same UNLESS they are the same
        // - If destination chain is the same as source chain, set source chain to undefined
        const newSourceChainId =
          prev.sourceChainId === newDestinationChainId ? undefined : prev.sourceChainId

        return {
          ...prev,
          sourceChainId: newSourceChainId,
        }
      })
      // Update ref immediately to prevent source effect from clearing destination
      prevDestinationChainIdRef.current = newDestinationChainId
    } else if (destinationChainId === undefined) {
      // Update ref when destination is cleared
      prevDestinationChainIdRef.current = undefined
    }
  }, [destinationChainId, inputs.destinationChainId, setInputs])

  // Sync refs when inputs change externally (e.g., from useUpdateBridge)
  useEffect(() => {
    if (sourceChainId !== prevSourceChainIdRef.current) {
      prevSourceChainIdRef.current = sourceChainId
    }
    if (destinationChainId !== prevDestinationChainIdRef.current) {
      prevDestinationChainIdRef.current = destinationChainId
    }
  }, [destinationChainId, inputs.destinationChainId, sourceChainId])

  return (
    <BridgeFormContext.Provider value={formValue}>
      <BridgeBalanceContext.Provider value={balanceValue}>
        <BridgePriceContext.Provider value={priceValue}>
          <BridgeTxnContext.Provider value={txnValue}>{children}</BridgeTxnContext.Provider>
        </BridgePriceContext.Provider>
      </BridgeBalanceContext.Provider>
    </BridgeFormContext.Provider>
  )
}

export default BridgeProvider
