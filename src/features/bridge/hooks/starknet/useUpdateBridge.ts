import { useCallback, useMemo } from 'react'

import { type Address } from 'viem'

import type { ChainId, ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/bridge/context/starknet/types'
import { useBridgeForm } from '@/features/bridge/hooks/starknet/useBridge'

const useUpdateBridge = () => {
  const { setInputs } = useBridgeForm()

  const setToken = useCallback(
    (token: Token) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        token,
      }))
    },
    [setInputs],
  )

  const setAmount = useCallback(
    (amount: number) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        amount,
      }))
    },
    [setInputs],
  )

  const setDestinationChainId = useCallback(
    (chainId: ChainId | undefined) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        destinationChainId: chainId as ProtocolChainId,
      }))
    },
    [setInputs],
  )

  const setSourceChainId = useCallback(
    (chainId: ChainId | undefined) => {
      setInputs((prevState: FormInputs) => ({
        ...prevState,
        sourceChainId: chainId as ProtocolChainId,
      }))
    },
    [setInputs],
  )

  const setReceiverAddress = useCallback(
    (address: Address | undefined) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, receiverAddress: address }))
    },
    [setInputs],
  )

  return useMemo(
    () => ({
      setToken,
      setAmount,
      setDestinationChainId,
      setSourceChainId,
      setReceiverAddress,
    }),
    [setToken, setAmount, setDestinationChainId, setSourceChainId, setReceiverAddress],
  )
}

export default useUpdateBridge
