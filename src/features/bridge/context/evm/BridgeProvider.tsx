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
import { applyBridgeTokenSync } from '@/features/bridge/lib/sync-bridge-tokens'
import { useResolvedChain, useSelectActiveChain } from '@/hooks/connection'
import { useReadOnlySession } from '@/hooks/connection/useReadOnlySession'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import useEvmDestinationTokenBalance from '@/hooks/on-chain/evm/useDestinationTokenBalance'
import useTokenBalance from '@/hooks/on-chain/evm/useTokenBalance'
import useStarknetDestinationTokenBalance from '@/hooks/on-chain/starknet/useDestinationTokenBalance'
import useSuiDestinationTokenBalance from '@/hooks/on-chain/sui/useDestinationTokenBalance'
import type { SuiAddress } from '@/lib/address'
import { getActiveEvmChainIds, isEvmChainId } from '@/lib/chain'
import { type EVMConnection } from '@/lib/connection'
import { toNum } from '@/lib/format'
import { getChainFamily } from '@/lib/wallet-session'
import { useActiveChainStore } from '@/state/active-chain'
import { useBridgeFlipStore } from '@/state/bridge-flip'

/** Cover the gap after `isPending` clears before wagmi reports the new chain. */
const EVM_SWITCH_UNSUPPORTED_GRACE_MS = 2000

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
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | undefined>(undefined)
  const prevSourceChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevDestinationChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevChainFamilyRef = useRef<'evm' | 'starknet' | 'sui' | undefined>(undefined)
  const prevTokenRouteKeyRef = useRef('')

  const selectedChainId = useActiveChainStore((s) => s.selectedChainId)
  const { isSwitchingEvmNetwork } = useSelectActiveChain()
  const { chainId: resolvedChainId, chainFamily: resolvedChainFamily } = useResolvedChain()
  const sourceChainId = inputs.sourceChainId
    ? (toNum(inputs.sourceChainId) as ProtocolChainId)
    : undefined
  const destinationChainId = inputs.destinationChainId
    ? (toNum(inputs.destinationChainId) as ProtocolChainId)
    : undefined

  const liveConnection = useEvmTargetSession(sourceChainId, { fallbackToDefault: false })

  // EVM→EVM: keep queries + banner quiet while the wallet catches up (same as Buy).
  const [softUnsupported, setSoftUnsupported] = useState(false)
  useEffect(() => {
    if (!isEvmChainId(selectedChainId)) return
    setSoftUnsupported(true)
    const timer = window.setTimeout(
      () => setSoftUnsupported(false),
      EVM_SWITCH_UNSUPPORTED_GRACE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [selectedChainId])
  useEffect(() => {
    if (!liveConnection.unsupported) setSoftUnsupported(false)
  }, [liveConnection.unsupported])

  const isEvmSwitchSettling = isSwitchingEvmNetwork || softUnsupported
  const connection = useMemo(
    () => ({
      ...liveConnection,
      unsupported: Boolean(liveConnection.unsupported && !isEvmSwitchSettling),
    }),
    [liveConnection, isEvmSwitchSettling],
  )
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

    // Update last connected address
    setLastConnectedAddress(connection.address)
  }, [
    connection.address,
    connection.isConnected,
    inputs.evmReceiverAddress,
    lastConnectedAddress,
    setInputs,
  ])

  // Sync active receiverAddress for the destination family; close unrelated modals.
  // Modal open is user-driven via SET ADDRESS / CHANGE on the bridge panel.
  useEffect(() => {
    const currentNetworkType = getDestinationNetworkType(destinationChainId)

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
    } else if (currentNetworkType === 'sui') {
      if (isEvmReceiverAddressModalOpen) setIsEvmReceiverAddressModalOpen(false)
      if (isStarknetReceiverAddressModalOpen) setIsStarknetReceiverAddressModalOpen(false)

      setInputs((prev) => ({
        ...prev,
        receiverAddress: prev.suiReceiverAddress,
      }))
    } else {
      if (isStarknetReceiverAddressModalOpen) setIsStarknetReceiverAddressModalOpen(false)
      if (isSuiReceiverAddressModalOpen) setIsSuiReceiverAddressModalOpen(false)

      setInputs((prev) => ({
        ...prev,
        receiverAddress: prev.evmReceiverAddress,
      }))
    }
  }, [
    connection.isConnected,
    destinationChainId,
    inputs.evmReceiverAddress,
    inputs?.starknetReceiverAddress,
    inputs?.suiReceiverAddress,
    isStarknetReceiverAddressModalOpen,
    isSuiReceiverAddressModalOpen,
    isEvmReceiverAddressModalOpen,
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
    const routeKey = `${connection.config?.id ?? ''}:${destinationChainId ?? ''}:${bridgeTokens.join(',')}`

    applyBridgeTokenSync(setInputs, tokens)

    // Reset confirm/success only when the route identity actually changes.
    if (prevTokenRouteKeyRef.current && prevTokenRouteKeyRef.current !== routeKey) {
      setStep(0)
    }
    prevTokenRouteKeyRef.current = routeKey
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

  // Detect chain family changes — apply pending cross-family flip, else reset destination
  useEffect(() => {
    const hasChainFamilyChanged =
      prevChainFamilyRef.current !== undefined && prevChainFamilyRef.current !== resolvedChainFamily

    if (hasChainFamilyChanged) {
      if (resolvedChainFamily === 'evm') {
        const pending = useBridgeFlipStore.getState().consumePending()
        if (pending && getChainFamily(pending.sourceChainId) === 'evm') {
          setInputs((prev) => ({
            ...prev,
            sourceChainId: pending.sourceChainId as ProtocolChainId,
            destinationChainId: pending.destinationChainId as ProtocolChainId,
            amount: undefined,
          }))
        } else {
          setInputs((prev) => ({
            ...prev,
            destinationChainId: undefined,
          }))
        }
      } else {
        setInputs((prev) => ({
          ...prev,
          destinationChainId: undefined,
        }))
      }
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

    // Mid-flip: inputs already swapped to the new source while the wallet (and/or
    // connection-derived effective source) still lags. Keep the flipped pair until
    // the wallet catches up — forcing source back would drop the destination route.
    const classicEvmFlip =
      destinationChainId != null && Number(destinationChainId) === Number(effectiveSourceChainId)
    const dappAlreadyOnFlippedSource =
      resolvedEvmChainId != null &&
      currentSourceChainId != null &&
      Number(currentSourceChainId) === Number(resolvedEvmChainId)
    const pendingFlipPair =
      currentSourceChainId != null &&
      currentSourceChainId !== effectiveSourceChainId &&
      destinationChainId != null &&
      (classicEvmFlip || dappAlreadyOnFlippedSource)

    if (pendingFlipPair) {
      return
    }

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
    destinationChainId,
    resolvedChainId,
    resolvedChainFamily,
    sourceChainId,
    setInputs,
  ])

  // Destination is user-selected; source is wallet-owned. On collision, drop destination
  // (never clear source — that races with flip / wallet sync and leaves dest empty).
  useEffect(() => {
    const prevDestinationChainId = prevDestinationChainIdRef.current
    const hasDestinationChanged = prevDestinationChainId !== destinationChainId

    if (hasDestinationChanged && destinationChainId !== undefined) {
      const newDestinationChainId = destinationChainId
      setInputs((prev) => {
        if (
          prev.sourceChainId != null &&
          Number(prev.sourceChainId) === Number(newDestinationChainId)
        ) {
          prevDestinationChainIdRef.current = undefined
          return {
            ...prev,
            destinationChainId: undefined,
          }
        }
        prevDestinationChainIdRef.current = newDestinationChainId
        return prev
      })
    } else if (destinationChainId === undefined) {
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
