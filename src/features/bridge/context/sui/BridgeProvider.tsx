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
} from '@/features/bridge/context/sui/context'
import { type FormInputs } from '@/features/bridge/context/sui/types'
import useBridgeAllowance from '@/features/bridge/hooks/sui/useBridgeAllowance'
import useBridgeFeeQuote from '@/features/bridge/hooks/sui/useBridgeFeeQuote'
import useBridgeSubmitFee from '@/features/bridge/hooks/sui/useBridgeSubmitFee'
import { applyBridgeTokenSync } from '@/features/bridge/lib/sync-bridge-tokens'
import { useResolvedChain } from '@/hooks/connection'
import { useReadOnlySession } from '@/hooks/connection/useReadOnlySession'
import { useSuiFamilySession } from '@/hooks/connection/useWalletSession'
import useEvmDestinationTokenBalance from '@/hooks/on-chain/evm/useDestinationTokenBalance'
import useTokenBalance from '@/hooks/on-chain/sui/useTokenBalance'
import { getChainFamily } from '@/lib/wallet-session'
import { useBridgeFlipStore } from '@/state/bridge-flip'

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

  const connection = useSuiFamilySession()
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

  useEffect(() => {
    if (connection.isConnected && connection.connectedChainId) {
      const connectedChainId = connection.connectedChainId as ProtocolChainId

      if (!inputs.sourceChainId) {
        setInputs((prev) => ({
          ...prev,
          sourceChainId: connectedChainId,
          destinationChainId: undefined,
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Detect chain family changes — apply pending cross-family flip, else reset destination
  useEffect(() => {
    const hasChainFamilyChanged =
      prevChainFamilyRef.current !== undefined && prevChainFamilyRef.current !== resolvedChainFamily

    if (hasChainFamilyChanged && resolvedChainFamily === 'sui') {
      const pending = useBridgeFlipStore.getState().consumePending()
      if (pending && getChainFamily(pending.sourceChainId) === 'sui') {
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
    }

    prevChainFamilyRef.current = resolvedChainFamily
  }, [resolvedChainFamily, setInputs])

  useEffect(() => {
    const effectiveSourceChainId = (inputs.sourceChainId ||
      connection.connectedChainId ||
      connection.config?.id) as ProtocolChainId | undefined

    if (!effectiveSourceChainId) {
      return
    }

    const currentSourceChainId = inputs.sourceChainId
    const shouldUpdateSource = currentSourceChainId !== effectiveSourceChainId
    const prevSourceChainId = prevSourceChainIdRef.current
    const hasSourceChanged = prevSourceChainId !== effectiveSourceChainId

    if (shouldUpdateSource || hasSourceChanged) {
      setInputs((prev) => {
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

  useEffect(() => {
    const prevDestinationChainId = prevDestinationChainIdRef.current
    const hasDestinationChanged = prevDestinationChainId !== inputs.destinationChainId

    if (hasDestinationChanged && inputs.destinationChainId !== undefined) {
      const newDestinationChainId = inputs.destinationChainId
      setInputs((prev) => {
        const newSourceChainId =
          prev.sourceChainId === newDestinationChainId ? undefined : prev.sourceChainId

        return {
          ...prev,
          sourceChainId: newSourceChainId,
        }
      })
      prevDestinationChainIdRef.current = newDestinationChainId
    } else if (inputs.destinationChainId === undefined) {
      prevDestinationChainIdRef.current = undefined
    }
  }, [inputs.destinationChainId, setInputs])

  useEffect(() => {
    const prevSourceChainId = prevSourceChainIdRef.current
    const hasSourceChanged = prevSourceChainId !== inputs.sourceChainId

    if (hasSourceChanged && inputs.sourceChainId !== undefined) {
      const effectiveSourceChainId = (connection.connectedChainId || connection.config?.id) as
        ProtocolChainId | undefined
      if (inputs.sourceChainId !== effectiveSourceChainId) {
        setInputs((prev) => {
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
