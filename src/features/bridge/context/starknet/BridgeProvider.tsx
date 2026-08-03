import React, { useEffect, useMemo, useRef, useState } from 'react'

import { getToken, getTokens } from '@/config'
import type { ProtocolChainId } from '@/config/chain-id'
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
} from '@/features/bridge/context/starknet/context'
import { type FormInputs } from '@/features/bridge/context/starknet/types'
import useBridgeAllowance from '@/features/bridge/hooks/starknet/useBridgeAllowance'
import useBridgeFeeQuote from '@/features/bridge/hooks/starknet/useBridgeFeeQuote'
import useBridgeSubmitFee from '@/features/bridge/hooks/starknet/useBridgeSubmitFee'
import { applyBridgeTokenSync } from '@/features/bridge/lib/sync-bridge-tokens'
import { useResolvedChain } from '@/hooks/connection'
import { useReadOnlySession } from '@/hooks/connection/useReadOnlySession'
import { useStarknetFamilySession } from '@/hooks/connection/useWalletSession'
import useEvmDestinationTokenBalance from '@/hooks/on-chain/evm/useDestinationTokenBalance'
import useTokenBalance from '@/hooks/on-chain/starknet/useTokenBalance'

const INITIAL_BRIDGE_INPUTS: FormInputs = {
  token: undefined,
  amount: undefined,
  tokens: undefined,
  receiverAddress: undefined,
  destinationChainId: undefined,
  sourceChainId: undefined,
}

export const BridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, setStep, inputs, setInputs, txnUrl, setTxnUrl } =
    useTradeFormController(INITIAL_BRIDGE_INPUTS)
  const [isReceiverAddressModalOpen, setIsReceiverAddressModalOpen] = useState<boolean>(false)
  const prevSourceChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevDestinationChainIdRef = useRef<ProtocolChainId | undefined>(undefined)
  const prevChainFamilyRef = useRef<'evm' | 'starknet' | 'sui' | undefined>(undefined)
  const prevTokenRouteKeyRef = useRef('')

  const connection = useStarknetFamilySession()
  const { chainFamily: resolvedChainFamily } = useResolvedChain()
  const destinationConnection = useReadOnlySession(
    inputs.destinationChainId as ProtocolChainId,
    inputs?.receiverAddress,
  )

  const tokenOut = useMemo(() => {
    return getToken(destinationConnection.config, inputs?.token?.symbol)
  }, [destinationConnection.config, inputs?.token?.symbol])

  const tokenPrice = useTokenPrice(inputs.token)
  const tokenInBalance = useTokenBalance(connection, inputs.token)
  const tokenInAllowance = useBridgeAllowance(connection, inputs.token)
  const tokenOutBalance = useEvmDestinationTokenBalance(destinationConnection, tokenOut)

  const feeQuote = useBridgeFeeQuote(
    connection,
    inputs.token,
    inputs.amount,
    inputs.receiverAddress,
    destinationConnection,
  )

  const submitFee = useBridgeSubmitFee(
    connection,
    inputs.token,
    tokenOut,
    inputs.amount,
    inputs.receiverAddress,
    feeQuote.data,
    destinationConnection,
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

  const formValue = useMemo(
    () => ({
      inputs,
      setInputs,
      step,
      setStep,
      connection,
      destinationConnection,
      tokenOut,
      isReceiverAddressModalOpen,
      setIsReceiverAddressModalOpen,
    }),
    [
      inputs,
      setInputs,
      step,
      setStep,
      connection,
      destinationConnection,
      tokenOut,
      isReceiverAddressModalOpen,
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

  const prevAddressRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!connection.isConnected) {
      setInputs((prev) => ({
        ...prev,
        receiverAddress: undefined,
      }))
      prevAddressRef.current = undefined
      return
    }

    const prevAddress = prevAddressRef.current
    const nextAddress = connection.address
    if (prevAddress && nextAddress && prevAddress.toLowerCase() !== nextAddress.toLowerCase()) {
      setInputs((prev) => ({
        ...prev,
        receiverAddress: undefined,
      }))
    }
    prevAddressRef.current = nextAddress
  }, [connection.address, connection.isConnected, setInputs])

  useEffect(() => {
    const sourceBridgeTokens = connection.config?.bridgeTokens || []
    const destinationBridgeTokens = destinationConnection.config?.bridgeTokens || []
    const normalizedDestinationBridgeTokens = new Set(
      destinationBridgeTokens.map((tokenSymbol) => tokenSymbol.toUpperCase()),
    )
    const bridgeTokens =
      inputs.destinationChainId === undefined
        ? sourceBridgeTokens
        : sourceBridgeTokens.filter((tokenSymbol) =>
            normalizedDestinationBridgeTokens.has(tokenSymbol.toUpperCase()),
          )
    const tokens = getTokens(connection.config, bridgeTokens)
    const routeKey = `${connection.config?.id ?? ''}:${inputs.destinationChainId ?? ''}:${bridgeTokens.join(',')}`

    applyBridgeTokenSync(setInputs, tokens)

    if (prevTokenRouteKeyRef.current && prevTokenRouteKeyRef.current !== routeKey) {
      setStep(0)
    }
    prevTokenRouteKeyRef.current = routeKey
  }, [
    connection.config,
    destinationConnection.config,
    inputs.destinationChainId,
    setInputs,
    setStep,
  ])

  // Initialize source chain from connected chain, destination as undefined
  useEffect(() => {
    if (connection.isConnected && connection.connectedChainId) {
      const connectedChainId = connection.connectedChainId as ProtocolChainId

      // Only initialize if source is not set
      if (!inputs.sourceChainId) {
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

    // If chain family changed, reset destination to undefined
    if (hasChainFamilyChanged && resolvedChainFamily === 'starknet') {
      setInputs((prev) => ({
        ...prev,
        destinationChainId: undefined,
      }))
    }

    prevChainFamilyRef.current = resolvedChainFamily
  }, [resolvedChainFamily, setInputs])

  // Open receiver address modal on initial load when both chains are set
  useEffect(() => {
    if (inputs.sourceChainId && inputs.destinationChainId && !inputs.receiverAddress) {
      setIsReceiverAddressModalOpen(true)
    }
  }, [inputs.sourceChainId, inputs.destinationChainId, inputs.receiverAddress])

  // Effect to handle source chain changes (from connection)
  // Source chain should always be undefined or connected Starknet chain
  useEffect(() => {
    const effectiveSourceChainId = (inputs.sourceChainId ||
      connection.connectedChainId ||
      connection.config?.id) as ProtocolChainId | undefined

    // For Starknet, source chain should be the Starknet chain ID
    // If not connected or no valid chain ID, don't update
    if (!effectiveSourceChainId) {
      return
    }

    // Source chain should always be the connected Starknet chain (or undefined)
    // If inputs.sourceChainId is set to something else, we need to correct it
    const currentSourceChainId = inputs.sourceChainId
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
  }, [connection.connectedChainId, connection.config?.id, inputs.sourceChainId, setInputs])

  // Effect to handle destination chain changes (from user selection)
  // When destination chain changes, keep source chain the same UNLESS they are the same
  useEffect(() => {
    const prevDestinationChainId = prevDestinationChainIdRef.current
    const hasDestinationChanged = prevDestinationChainId !== inputs.destinationChainId

    if (hasDestinationChanged && inputs.destinationChainId !== undefined) {
      const newDestinationChainId = inputs.destinationChainId
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
    } else if (inputs.destinationChainId === undefined) {
      // Update ref when destination is cleared
      prevDestinationChainIdRef.current = undefined
    }
  }, [inputs.destinationChainId, setInputs])

  // Sync refs when inputs change externally (e.g., from useUpdateBridge)
  // Also handle the case where source is updated externally and matches destination
  useEffect(() => {
    const prevSourceChainId = prevSourceChainIdRef.current
    const hasSourceChanged = prevSourceChainId !== inputs.sourceChainId

    // If source changed externally (not from connection effect) and matches destination, clear destination
    if (hasSourceChanged && inputs.sourceChainId !== undefined) {
      const effectiveSourceChainId = (connection.connectedChainId || connection.config?.id) as
        ProtocolChainId | undefined
      // Only handle external updates (when source doesn't match effective source from connection)
      // The connection effect will handle updates to match the connected chain
      if (inputs.sourceChainId !== effectiveSourceChainId) {
        setInputs((prev) => {
          // When source chain changes externally:
          // - Keep destination chain the same UNLESS they are the same
          // - If they are the same, set destination chain to undefined
          const newDestinationChainId =
            inputs.sourceChainId === prev.destinationChainId ? undefined : prev.destinationChainId

          return {
            ...prev,
            destinationChainId: newDestinationChainId,
          }
        })
      }
      prevSourceChainIdRef.current = inputs.sourceChainId
    } else if (inputs.sourceChainId === undefined) {
      prevSourceChainIdRef.current = undefined
    }

    if (inputs.destinationChainId !== prevDestinationChainIdRef.current) {
      prevDestinationChainIdRef.current = inputs.destinationChainId
    }
  }, [
    inputs.sourceChainId,
    inputs.destinationChainId,
    connection.connectedChainId,
    connection.config?.id,
    setInputs,
  ])

  // Open receiver address modal on initial load when both chains are set
  useEffect(() => {
    if (inputs.sourceChainId && inputs.destinationChainId && !inputs.receiverAddress) {
      setIsReceiverAddressModalOpen(true)
    }
  }, [inputs.sourceChainId, inputs.destinationChainId, inputs.receiverAddress])

  // Open receiver address modal when destination chain changes (but keep existing receiver address)
  useEffect(() => {
    if (
      prevDestinationChainIdRef.current &&
      inputs.destinationChainId &&
      prevDestinationChainIdRef.current !== inputs.destinationChainId
    ) {
      setIsReceiverAddressModalOpen(true)
    }
  }, [inputs.destinationChainId])

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
