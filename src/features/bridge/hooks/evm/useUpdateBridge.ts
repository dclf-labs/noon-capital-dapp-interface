import { useCallback, useMemo } from 'react'

import type { ChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type FormInputs } from '@/features/bridge/context/evm/types'
import { useBridgeForm } from '@/features/bridge/hooks/evm/useBridge'
import { type Address } from '@/lib/address'
import { type StarknetAddress } from '@/lib/address'
import { type SuiAddress } from '@/lib/address'

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
      setInputs((prevState: FormInputs) => ({ ...prevState, destinationChainId: chainId }))
    },
    [setInputs],
  )

  const setSourceChainId = useCallback(
    (chainId: ChainId | undefined) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, sourceChainId: chainId }))
    },
    [setInputs],
  )

  const setReceiverAddress = useCallback(
    (address: Address | undefined | StarknetAddress | SuiAddress) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, receiverAddress: address }))
    },
    [setInputs],
  )

  const setEvmReceiverAddress = useCallback(
    (address: Address | undefined) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, evmReceiverAddress: address }))
    },
    [setInputs],
  )

  const setStarknetReceiverAddress = useCallback(
    (address: StarknetAddress | undefined) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, starknetReceiverAddress: address }))
    },
    [setInputs],
  )

  const setSuiReceiverAddress = useCallback(
    (address: SuiAddress | undefined) => {
      setInputs((prevState: FormInputs) => ({ ...prevState, suiReceiverAddress: address }))
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
      setEvmReceiverAddress,
      setStarknetReceiverAddress,
      setSuiReceiverAddress,
    }),
    [
      setToken,
      setAmount,
      setDestinationChainId,
      setSourceChainId,
      setReceiverAddress,
      setEvmReceiverAddress,
      setStarknetReceiverAddress,
      setSuiReceiverAddress,
    ],
  )
}

export default useUpdateBridge
